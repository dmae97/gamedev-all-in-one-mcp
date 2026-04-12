import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";

export type LuauRuntimeHandshake = {
  protocolVersion: 1;
  runtimeName: string;
  runtimeVersion: string;
  bridgeMode: "http-long-poll";
  capabilities: string[];
  sessionId?: string;
  studioPlaceId?: string;
  lastSeenAt: string;
};

export type LuauRuntimeCommandRequest = {
  id: string;
  kind: "run_code" | "create_workspace_part";
  createdAt: string;
  payload:
    | {
        code: string;
        mode: "edit" | "playtest";
      }
    | {
        name: string;
        anchored: boolean;
        position: { x: number; y: number; z: number };
        size: { x: number; y: number; z: number };
      };
};

export type LuauRuntimeCommandResponse = {
  requestId: string;
  status: "ok" | "error";
  completedAt: string;
  output?: string;
  data?: unknown;
  error?: string;
};

type PendingPoll = {
  response: ServerResponse<IncomingMessage>;
  timer: ReturnType<typeof setTimeout>;
};

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3002;
const HANDSHAKE_STALE_MS = 30_000;

class LuauRuntimeBridge {
  private handshake: LuauRuntimeHandshake | null = null;
  private readonly queue: LuauRuntimeCommandRequest[] = [];
  private readonly responses = new Map<string, LuauRuntimeCommandResponse>();
  private readonly pendingResults = new Map<string, (response: LuauRuntimeCommandResponse) => void>();
  private readonly pendingPolls: PendingPoll[] = [];
  private started = false;

  async start() {
    if (this.started) {
      return this.getConnectionInfo();
    }

    const port = Number(process.env.ROBLOX_LUAU_BRIDGE_PORT || DEFAULT_PORT);
    const server = createServer(async (request, response) => {
      try {
        const host = request.headers.host || "";
        if (host && !host.startsWith("127.0.0.1:") && !host.startsWith("localhost:")) {
          this.json(response, 400, { error: "Invalid host header" });
          return;
        }

        const url = new URL(request.url || "/", `http://${DEFAULT_HOST}:${port}`);

        if (request.method === "POST" && url.pathname === "/runtime/handshake") {
          const body = await this.readJson(request) as Omit<LuauRuntimeHandshake, "lastSeenAt">;
          this.handshake = {
            ...body,
            protocolVersion: 1,
            lastSeenAt: new Date().toISOString()
          };
          this.json(response, 200, { ok: true, handshake: this.handshake });
          return;
        }

        if (request.method === "GET" && url.pathname === "/runtime/health") {
          this.json(response, 200, this.getStatus());
          return;
        }

        if (request.method === "GET" && url.pathname === "/runtime/commands/next") {
          const timeoutMs = Number(url.searchParams.get("timeoutMs") || 25_000);
          const next = this.queue.shift();
          if (next) {
            this.json(response, 200, { ok: true, command: next });
            return;
          }

          const timer = setTimeout(() => {
            this.removePendingPoll(response);
            this.json(response, 200, { ok: true, command: null });
          }, timeoutMs);

          this.pendingPolls.push({ response, timer });
          request.on("close", () => this.removePendingPoll(response));
          return;
        }

        if (request.method === "POST" && url.pathname === "/runtime/commands/result") {
          const result = await this.readJson(request) as LuauRuntimeCommandResponse;
          this.responses.set(result.requestId, result);
          const pending = this.pendingResults.get(result.requestId);
          if (pending) {
            this.pendingResults.delete(result.requestId);
            pending(result);
          }
          this.json(response, 200, { ok: true, requestId: result.requestId });
          return;
        }

        this.json(response, 404, { error: "Not found" });
      } catch (error) {
        this.json(response, 500, { error: error instanceof Error ? error.message : String(error) });
      }
    });

    await new Promise<void>((resolvePromise, rejectPromise) => {
      server.once("error", rejectPromise);
      server.listen(port, DEFAULT_HOST, () => resolvePromise());
    });

    this.started = true;
    return this.getConnectionInfo();
  }

  getConnectionInfo() {
    const port = Number(process.env.ROBLOX_LUAU_BRIDGE_PORT || DEFAULT_PORT);
    return {
      host: DEFAULT_HOST,
      port,
      url: `http://${DEFAULT_HOST}:${port}`
    };
  }

  getStatus() {
    const checkedAt = new Date().toISOString();
    if (!this.handshake) {
      return {
        connected: false,
        checkedAt,
        stale: true,
        ageMs: null,
        handshake: null,
        queueLength: this.queue.length
      };
    }

    const ageMs = Date.now() - Date.parse(this.handshake.lastSeenAt);
    const stale = Number.isNaN(ageMs) || ageMs > HANDSHAKE_STALE_MS;
    return {
      connected: !stale,
      checkedAt,
      stale,
      ageMs: Number.isNaN(ageMs) ? null : ageMs,
      handshake: this.handshake,
      queueLength: this.queue.length
    };
  }

  async dispatch(
    request: Omit<LuauRuntimeCommandRequest, "id" | "createdAt">,
    waitForResponseMs = 2_000
  ) {
    const payload: LuauRuntimeCommandRequest = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...request
    };

    const waitingPoll = this.pendingPolls.shift();
    if (waitingPoll) {
      clearTimeout(waitingPoll.timer);
      this.json(waitingPoll.response, 200, { ok: true, command: payload });
    } else {
      this.queue.push(payload);
    }

    if (waitForResponseMs <= 0) {
      return {
        status: "queued" as const,
        request: payload,
        response: null
      };
    }

    const response = await new Promise<LuauRuntimeCommandResponse | null>((resolvePromise) => {
      const timer = setTimeout(() => {
        this.pendingResults.delete(payload.id);
        resolvePromise(null);
      }, waitForResponseMs);

      this.pendingResults.set(payload.id, (result) => {
        clearTimeout(timer);
        resolvePromise(result);
      });
    });

    return {
      status: response?.status || "queued",
      request: payload,
      response
    };
  }

  private async readJson(request: IncomingMessage) {
    const chunks: Buffer[] = [];
    for await (const chunk of request) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const body = Buffer.concat(chunks).toString("utf8");
    return body ? JSON.parse(body) : {};
  }

  private json(response: ServerResponse<IncomingMessage>, statusCode: number, payload: unknown) {
    if (response.writableEnded) {
      return;
    }

    response.writeHead(statusCode, { "content-type": "application/json" });
    response.end(`${JSON.stringify(payload)}\n`);
  }

  private removePendingPoll(response: ServerResponse<IncomingMessage>) {
    const index = this.pendingPolls.findIndex((entry) => entry.response === response);
    if (index === -1) {
      return;
    }

    clearTimeout(this.pendingPolls[index].timer);
    this.pendingPolls.splice(index, 1);
  }
}

const bridge = new LuauRuntimeBridge();

export async function startLuauRuntimeBridge() {
  return bridge.start();
}

export function getLuauRuntimeBridgeStatus() {
  return bridge.getStatus();
}

export function getLuauRuntimeBridgeConnectionInfo() {
  return bridge.getConnectionInfo();
}

export async function dispatchLuauRunCode(
  code: string,
  mode: "edit" | "playtest",
  waitForResponseMs?: number
) {
  return bridge.dispatch(
    {
      kind: "run_code",
      payload: {
        code,
        mode
      }
    },
    waitForResponseMs
  );
}

export async function dispatchLuauCreateWorkspacePart(
  input: {
    name: string;
    anchored: boolean;
    position: { x: number; y: number; z: number };
    size: { x: number; y: number; z: number };
  },
  waitForResponseMs?: number
) {
  return bridge.dispatch(
    {
      kind: "create_workspace_part",
      payload: input
    },
    waitForResponseMs
  );
}
