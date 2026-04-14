import { createServer as createHttpServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { detectRobloxConnector } from "../connectors/roblox/index.js";
import { detectLuauRuntime } from "../connectors/luau/index.js";
import { detectUnityConnector } from "../connectors/unity/index.js";
import { detectUnrealConnector } from "../connectors/unreal/index.js";
import { detectBlenderConnector } from "../connectors/blender/index.js";
import { VERSION, NAME } from "../version.js";
import { chat, AVAILABLE_MODELS, type ChatRequest } from "./llm-proxy.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_PORT = 3100;
const ALLOWED_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);
const ALLOWED_ORIGINS = new Set(["http://127.0.0.1:3100", "http://localhost:3100", "http://[::1]:3100"]);
const SSE_INTERVAL_MS = 5_000;
const MAX_SSE_CLIENTS = 20;

let dashboardHtml: string | null = null;

function loadDashboardHtml(): string {
  if (!dashboardHtml) {
    dashboardHtml = readFileSync(resolve(__dirname, "dashboard.html"), "utf-8");
  }
  return dashboardHtml;
}

async function buildStatusPayload() {
  const [roblox, luau, unity, unreal, blender] = await Promise.all([
    detectRobloxConnector(),
    detectLuauRuntime(),
    detectUnityConnector(),
    detectUnrealConnector(),
    detectBlenderConnector()
  ]);

  return {
    name: NAME,
    version: VERSION,
    timestamp: new Date().toISOString(),
    roblox,
    luau,
    unity,
    unreal,
    blender
  };
}

function validateHost(req: IncomingMessage): boolean {
  const host = req.headers.host;
  if (!host) return false;
  const hostname = host.split(":")[0];
  return ALLOWED_HOSTS.has(hostname);
}

function jsonResponse(res: ServerResponse, status: number, data: unknown, req?: IncomingMessage) {
  const body = JSON.stringify(data);
  const origin = req?.headers.origin ?? "";
  const corsOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache"
  };
  if (corsOrigin) headers["Access-Control-Allow-Origin"] = corsOrigin;
  res.writeHead(status, headers);
  res.end(body);
}

const sseClients = new Set<ServerResponse>();

function handleSSE(_req: IncomingMessage, res: ServerResponse) {
  if (sseClients.size >= MAX_SSE_CLIENTS) {
    jsonResponse(res, 503, { error: "Too many SSE clients" });
    return;
  }

  const origin = _req.headers.origin ?? "";
  const corsOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";
  const sseHeaders: Record<string, string> = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  };
  if (corsOrigin) sseHeaders["Access-Control-Allow-Origin"] = corsOrigin;
  res.writeHead(200, sseHeaders);

  res.write("event: connected\ndata: {}\n\n");
  sseClients.add(res);

  res.on("close", () => {
    sseClients.delete(res);
  });
}

async function broadcastStatus() {
  if (sseClients.size === 0) return;

  try {
    const payload = await buildStatusPayload();
    const data = `event: status\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(data);
      } catch {
        sseClients.delete(client);
      }
    }
  } catch {
    // detection failure should not crash the broadcast loop
  }
}

export function pushLogToClients(message: string, level: "info" | "warn" | "error" | "ok" = "info") {
  if (sseClients.size === 0) return;
  const data = `event: log\ndata: ${JSON.stringify({ message, level, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(data);
    } catch {
      sseClients.delete(client);
    }
  }
}

function readRequestBody(req: IncomingMessage, maxBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) { req.destroy(); reject(new Error("Request body too large")); return; }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  if (!validateHost(req)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const url = req.url ?? "/";
  const method = req.method ?? "GET";

  if (method === "OPTIONS") {
    const origin = req.headers.origin ?? "";
    const corsOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";
    const optHeaders: Record<string, string> = {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (corsOrigin) optHeaders["Access-Control-Allow-Origin"] = corsOrigin;
    res.writeHead(204, optHeaders);
    res.end();
    return;
  }

  if (method === "POST" && url === "/api/chat") {
    try {
      const body = await readRequestBody(req, 65536);
      const parsed = JSON.parse(body) as ChatRequest;
      if (
        !parsed.provider || !parsed.apiKey || !parsed.model ||
        !Array.isArray(parsed.messages) || parsed.messages.length === 0
      ) {
        jsonResponse(res, 400, { error: "Missing required fields: provider, apiKey, model, messages (non-empty array)" }, req);
        return;
      }
      for (const msg of parsed.messages) {
        if (typeof msg.role !== "string" || typeof msg.content !== "string") {
          jsonResponse(res, 400, { error: "Each message must have string role and content" }, req);
          return;
        }
      }
      const result = await chat(parsed);
      jsonResponse(res, 200, result, req);
    } catch (err) {
      jsonResponse(res, 500, { error: `Chat failed: ${String(err)}` }, req);
    }
    return;
  }

  if (method === "GET" && url === "/api/models") {
    jsonResponse(res, 200, AVAILABLE_MODELS, req);
    return;
  }

  if (method !== "GET") {
    jsonResponse(res, 405, { error: "Method not allowed" }, req);
    return;
  }

  if (url === "/" || url === "/index.html") {
    try {
      const html = loadDashboardHtml();
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache"
      });
      res.end(html);
    } catch {
      res.writeHead(500);
      res.end("Dashboard HTML not found");
    }
    return;
  }

  if (url === "/api/status") {
    try {
      const payload = await buildStatusPayload();
      jsonResponse(res, 200, payload, req);
    } catch (err) {
      jsonResponse(res, 500, { error: "Failed to build status", detail: String(err) }, req);
    }
    return;
  }

  if (url === "/api/tools") {
    jsonResponse(res, 200, {
      total: 67,
      groups: [
        { module: "foundation", count: 4, tools: ["project_init", "inspect_project", "doctor", "list_capabilities"] },
        { module: "roblox-core", count: 2, tools: ["roblox_run_code", "roblox_create_workspace_part"] },
        { module: "roblox-script", count: 4, tools: ["roblox_get_script_source", "roblox_set_script_source", "roblox_edit_script_lines", "roblox_grep_scripts"] },
        { module: "roblox-instance", count: 5, tools: ["roblox_create_instance", "roblox_delete_instance", "roblox_set_property", "roblox_clone_instance", "roblox_reparent_instance"] },
        { module: "roblox-query", count: 4, tools: ["roblox_get_instance_properties", "roblox_get_instance_children", "roblox_search_instances", "roblox_get_file_tree"] },
        { module: "roblox-physics", count: 5, tools: ["roblox_set_gravity", "roblox_set_physics", "roblox_add_constraint", "roblox_raycast", "roblox_simulate_physics"] },
        { module: "unity", count: 10, tools: ["unity_get_hierarchy", "unity_get_gameobject", "unity_create_gameobject", "unity_delete_gameobject", "unity_set_component_property", "unity_add_component", "unity_set_transform", "unity_get_script_source", "unity_play_mode", "unity_execute_menu_item"] },
        { module: "unity-physics", count: 5, tools: ["unity_set_gravity", "unity_add_rigidbody", "unity_add_joint", "unity_raycast", "unity_apply_force"] },
        { module: "unreal", count: 10, tools: ["unreal_get_world_outliner", "unreal_get_actor", "unreal_spawn_actor", "unreal_destroy_actor", "unreal_set_actor_transform", "unreal_set_actor_property", "unreal_get_blueprint", "unreal_run_python", "unreal_play_mode", "unreal_get_viewport_screenshot"] },
        { module: "unreal-physics", count: 5, tools: ["unreal_set_gravity", "unreal_set_simulate_physics", "unreal_add_physics_constraint", "unreal_raycast", "unreal_apply_force"] },
        { module: "blender", count: 8, tools: ["blender_get_scene", "blender_get_object", "blender_create_object", "blender_delete_object", "blender_set_transform", "blender_set_material", "blender_run_python", "blender_export"] },
        { module: "blender-physics", count: 5, tools: ["blender_set_gravity", "blender_setup_rigid_body", "blender_add_constraint", "blender_bake_physics", "blender_apply_force"] }
      ]
    }, req);
    return;
  }

  if (url === "/api/events") {
    handleSSE(req, res);
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
}

let httpServer: Server | null = null;
let broadcastInterval: ReturnType<typeof setInterval> | null = null;

export async function startDashboardServer(): Promise<void> {
  const port = Number(process.env["WEB_DASHBOARD_PORT"]) || DEFAULT_PORT;
  const enabled = process.env["WEB_DASHBOARD_ENABLED"];
  if (enabled === "false" || enabled === "0") {
    console.error(`[dashboard] disabled via WEB_DASHBOARD_ENABLED=${enabled}`);
    return;
  }

  return new Promise((resolveP, rejectP) => {
    httpServer = createHttpServer(handleRequest);

    httpServer.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(`[dashboard] port ${port} in use, dashboard disabled`);
        httpServer = null;
        resolveP();
      } else {
        rejectP(err);
      }
    });

    httpServer.listen(port, "127.0.0.1", () => {
      console.error(`[dashboard] http://127.0.0.1:${port}`);
      broadcastInterval = setInterval(broadcastStatus, SSE_INTERVAL_MS);
      broadcastInterval.unref();
      resolveP();
    });
  });
}

export async function stopDashboardServer(): Promise<void> {
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
  }

  for (const client of sseClients) {
    try { client.end(); } catch { /* ignore */ }
  }
  sseClients.clear();

  if (httpServer) {
    return new Promise((resolveP) => {
      httpServer!.close(() => {
        httpServer = null;
        resolveP();
      });
    });
  }
}
