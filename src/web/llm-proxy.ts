import { executeRobloxCommand } from "../connectors/roblox/index.js";
import type { LuauCommandKind } from "../connectors/luau/bridge.js";
import { executeUnityCommand } from "../connectors/unity/index.js";
import { executeUnrealCommand } from "../connectors/unreal/index.js";
import { executeBlenderCommand } from "../connectors/blender/index.js";

export type Provider = "anthropic" | "openai" | "google";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatRequest = {
  provider: Provider;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  systemPrompt?: string;
};

export type ChatResponse = {
  content: string;
  toolCalls?: { name: string; input: Record<string, unknown>; result: Record<string, unknown> }[];
  error?: string;
};

const TOOL_DEFS = buildToolDefinitions();

function buildToolDefinitions() {
  const tools: { name: string; description: string; parameters: Record<string, unknown> }[] = [];

  const robloxTools = [
    { name: "roblox_run_code", desc: "Execute arbitrary Luau code in Roblox Studio", params: { code: "string", mode: "string?" } },
    { name: "roblox_set_gravity", desc: "Set Workspace gravity vector", params: { x: "number", y: "number", z: "number" } },
    { name: "roblox_set_physics", desc: "Enable/disable physics on a BasePart", params: { path: "string", anchored: "boolean" } },
    { name: "roblox_create_instance", desc: "Create any ClassName under a parent path", params: { className: "string", parentPath: "string", name: "string?" } },
    { name: "roblox_delete_instance", desc: "Delete an instance by path", params: { path: "string" } },
    { name: "roblox_set_property", desc: "Set a property on an instance", params: { path: "string", property: "string", value: "any" } },
    { name: "roblox_get_instance_children", desc: "List direct children", params: { path: "string" } },
    { name: "roblox_search_instances", desc: "Search instances by class/name", params: { rootPath: "string?", className: "string?", namePattern: "string?" } },
    { name: "roblox_raycast", desc: "Cast a ray in 3D space", params: { origin: "object", direction: "object" } },
    { name: "roblox_simulate_physics", desc: "Apply impulse/force to a BasePart", params: { path: "string", impulse: "object?" } },
  ];

  const unityTools = [
    { name: "unity_get_hierarchy", desc: "Get Unity scene hierarchy tree", params: { rootPath: "string?", depth: "number?" } },
    { name: "unity_create_gameobject", desc: "Create a new GameObject", params: { name: "string", parentPath: "string?", primitiveType: "string?" } },
    { name: "unity_delete_gameobject", desc: "Delete a GameObject by path", params: { path: "string" } },
    { name: "unity_set_transform", desc: "Set position/rotation/scale", params: { path: "string", position: "object?", rotation: "object?", scale: "object?" } },
    { name: "unity_add_rigidbody", desc: "Add Rigidbody to GameObject", params: { path: "string", mass: "number?", useGravity: "boolean?" } },
    { name: "unity_set_gravity", desc: "Set Physics.gravity vector", params: { x: "number", y: "number", z: "number" } },
    { name: "unity_raycast", desc: "Physics.Raycast", params: { origin: "object", direction: "object" } },
    { name: "unity_apply_force", desc: "Apply force/impulse to Rigidbody", params: { path: "string", force: "object?", forceMode: "string?" } },
    { name: "unity_play_mode", desc: "Control play/stop/pause", params: { action: "string" } },
  ];

  const unrealTools = [
    { name: "unreal_get_world_outliner", desc: "Get Unreal world outliner", params: { rootPath: "string?", depth: "number?" } },
    { name: "unreal_spawn_actor", desc: "Spawn a new actor", params: { className: "string", label: "string?", location: "object?" } },
    { name: "unreal_destroy_actor", desc: "Destroy an actor", params: { path: "string" } },
    { name: "unreal_set_actor_transform", desc: "Set actor transform", params: { path: "string", location: "object?", rotation: "object?", scale: "object?" } },
    { name: "unreal_set_simulate_physics", desc: "Enable/disable physics", params: { path: "string", simulate: "boolean" } },
    { name: "unreal_set_gravity", desc: "Set world gravity", params: { x: "number", y: "number", z: "number" } },
    { name: "unreal_run_python", desc: "Execute Python in Unreal Editor", params: { code: "string" } },
    { name: "unreal_raycast", desc: "Line trace", params: { start: "object", end: "object" } },
    { name: "unreal_apply_force", desc: "Apply force/impulse", params: { path: "string", force: "object?", impulse: "object?" } },
  ];

  const blenderTools = [
    { name: "blender_get_scene", desc: "Get Blender scene hierarchy", params: { includeTransforms: "boolean?" } },
    { name: "blender_create_object", desc: "Create mesh primitive or empty", params: { type: "string", name: "string?", location: "object?" } },
    { name: "blender_delete_object", desc: "Delete object by name", params: { name: "string" } },
    { name: "blender_set_transform", desc: "Set object transform", params: { name: "string", location: "object?", rotation: "object?", scale: "object?" } },
    { name: "blender_setup_rigid_body", desc: "Setup rigid body physics", params: { objectName: "string", bodyType: "string?", mass: "number?" } },
    { name: "blender_set_gravity", desc: "Set scene gravity", params: { x: "number", y: "number", z: "number" } },
    { name: "blender_run_python", desc: "Execute bpy Python code", params: { code: "string" } },
    { name: "blender_export", desc: "Export scene to file", params: { format: "string", outputPath: "string" } },
    { name: "blender_set_material", desc: "Assign material to object", params: { objectName: "string", baseColor: "object?" } },
  ];

  for (const t of [...robloxTools, ...unityTools, ...unrealTools, ...blenderTools]) {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [k, v] of Object.entries(t.params)) {
      const isOptional = (v as string).endsWith("?");
      const baseType = (v as string).replace("?", "");
      const jsonType = baseType === "any" ? {} : baseType === "object" ? { type: "object" } : { type: baseType };
      properties[k] = jsonType;
      if (!isOptional) required.push(k);
    }
    tools.push({
      name: t.name,
      description: t.desc,
      parameters: { type: "object", properties, required }
    });
  }

  return tools;
}

async function executeTool(name: string, input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const timeout = 10_000;
  if (name.startsWith("roblox_")) {
    const kind = name.replace("roblox_", "") as LuauCommandKind;
    return executeRobloxCommand(kind, input, { waitForResponseMs: timeout });
  }
  if (name.startsWith("unity_")) {
    const method = name.replace("unity_", "");
    return executeUnityCommand(method, input, { timeoutMs: timeout });
  }
  if (name.startsWith("unreal_")) {
    const method = name.replace("unreal_", "");
    return executeUnrealCommand(method, input, { timeoutMs: timeout });
  }
  if (name.startsWith("blender_")) {
    const method = name.replace("blender_", "");
    return executeBlenderCommand(method, input, { timeoutMs: timeout });
  }
  return { error: `Unknown tool: ${name}` };
}

function toAnthropicTools() {
  return TOOL_DEFS.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters
  }));
}

function toOpenAITools() {
  return TOOL_DEFS.map(t => ({
    type: "function" as const,
    function: { name: t.name, description: t.description, parameters: t.parameters }
  }));
}

function toGoogleTools() {
  return [{ functionDeclarations: TOOL_DEFS.map(t => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters
  })) }];
}

async function callAnthropic(req: ChatRequest): Promise<ChatResponse> {
  const toolCalls: ChatResponse["toolCalls"] = [];
  let messages = req.messages.map(m => ({ role: m.role, content: m.content }));

  for (let i = 0; i < 10; i++) {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": req.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: req.model,
        max_tokens: 4096,
        system: req.systemPrompt || "You are a game development assistant with access to Roblox, Unity, Unreal, and Blender tools.",
        messages,
        tools: toAnthropicTools()
      })
    });

    if (!resp.ok) {
      const err = await resp.text();
      return { content: "", error: `Anthropic ${resp.status}: ${err}` };
    }

    const data = await resp.json() as Record<string, unknown>;
    const content = data.content as Array<Record<string, unknown>>;
    const stopReason = data.stop_reason as string;

    if (stopReason !== "tool_use") {
      const textBlock = content.find((b: Record<string, unknown>) => b.type === "text");
      return { content: (textBlock?.text as string) || "", toolCalls: toolCalls.length ? toolCalls : undefined };
    }

    const toolUseBlocks = content.filter((b: Record<string, unknown>) => b.type === "tool_use");
    const toolResults: Array<Record<string, unknown>> = [];

    for (const block of toolUseBlocks) {
      const result = await executeTool(block.name as string, block.input as Record<string, unknown>);
      toolCalls.push({ name: block.name as string, input: block.input as Record<string, unknown>, result });
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result)
      });
    }

    messages = [
      ...messages,
      { role: "assistant" as const, content: content as unknown as string },
      { role: "user" as const, content: toolResults as unknown as string }
    ];
  }

  return { content: "Max tool iterations reached.", toolCalls };
}

async function callOpenAI(req: ChatRequest): Promise<ChatResponse> {
  const toolCalls: ChatResponse["toolCalls"] = [];
  let messages: Array<Record<string, unknown>> = [
    { role: "system", content: req.systemPrompt || "You are a game development assistant with access to Roblox, Unity, Unreal, and Blender tools." },
    ...req.messages.map(m => ({ role: m.role, content: m.content }))
  ];

  for (let i = 0; i < 10; i++) {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${req.apiKey}` },
      body: JSON.stringify({ model: req.model, messages, tools: toOpenAITools() })
    });

    if (!resp.ok) {
      const err = await resp.text();
      return { content: "", error: `OpenAI ${resp.status}: ${err}` };
    }

    const data = await resp.json() as Record<string, unknown>;
    const choices = data.choices as Array<Record<string, unknown>>;
    const msg = choices[0].message as Record<string, unknown>;
    const finishReason = choices[0].finish_reason as string;

    if (finishReason !== "tool_calls" || !msg.tool_calls) {
      return { content: (msg.content as string) || "", toolCalls: toolCalls.length ? toolCalls : undefined };
    }

    messages.push(msg);

    for (const tc of msg.tool_calls as Array<Record<string, unknown>>) {
      const fn = tc.function as Record<string, unknown>;
      const args = JSON.parse(fn.arguments as string);
      const result = await executeTool(fn.name as string, args);
      toolCalls.push({ name: fn.name as string, input: args, result });
      messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) });
    }
  }

  return { content: "Max tool iterations reached.", toolCalls };
}

async function callGoogle(req: ChatRequest): Promise<ChatResponse> {
  const toolCalls: ChatResponse["toolCalls"] = [];
  const contents = req.messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  for (let i = 0; i < 10; i++) {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${req.model}:generateContent?key=${req.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          tools: toGoogleTools(),
          systemInstruction: { parts: [{ text: req.systemPrompt || "You are a game development assistant." }] }
        })
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      return { content: "", error: `Google ${resp.status}: ${err}` };
    }

    const data = await resp.json() as Record<string, unknown>;
    const candidates = data.candidates as Array<Record<string, unknown>>;
    const parts = (candidates[0].content as Record<string, unknown>).parts as Array<Record<string, unknown>>;

    const fcParts = parts.filter(p => p.functionCall);
    if (!fcParts.length) {
      const textPart = parts.find(p => p.text);
      return { content: (textPart?.text as string) || "", toolCalls: toolCalls.length ? toolCalls : undefined };
    }

    contents.push({ role: "model", parts: parts as Array<{ text: string }> });

    const fnResponseParts: Array<{ text: string }> = [];
    for (const p of fcParts) {
      const fc = p.functionCall as Record<string, unknown>;
      const result = await executeTool(fc.name as string, (fc.args as Record<string, unknown>) || {});
      toolCalls.push({ name: fc.name as string, input: (fc.args as Record<string, unknown>) || {}, result });
      fnResponseParts.push({ functionResponse: { name: fc.name, response: result } } as unknown as { text: string });
    }
    contents.push({ role: "user", parts: fnResponseParts });
  }

  return { content: "Max tool iterations reached.", toolCalls };
}

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  try {
    switch (req.provider) {
      case "anthropic": return await callAnthropic(req);
      case "openai": return await callOpenAI(req);
      case "google": return await callGoogle(req);
      default: return { content: "", error: `Unknown provider: ${req.provider}` };
    }
  } catch (err) {
    return { content: "", error: `Chat error: ${String(err)}` };
  }
}

export const AVAILABLE_MODELS: Record<Provider, string[]> = {
  anthropic: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o3-mini"],
  google: ["gemini-2.0-flash", "gemini-2.5-pro-preview-05-06", "gemini-2.5-flash-preview-04-17"]
};
