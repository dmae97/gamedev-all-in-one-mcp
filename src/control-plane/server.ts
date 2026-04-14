import Fastify from "fastify";
import { z } from "zod";
import { detectBlenderConnector } from "../connectors/blender/index.js";
import { detectLuauRuntime } from "../connectors/luau/index.js";
import { detectRobloxConnector } from "../connectors/roblox/index.js";
import { inspectProjectManifest } from "../project/manifest.js";
import type { LoadedLocalControlPlaneConfig, LocalProviderId } from "./config.js";
import { listLocalProviders, runLocalProviderJob } from "./providers.js";

const launchJobSchema = z.object({
  providerId: z.enum(["openai-api", "anthropic-api", "zai-api", "minimax-api", "codex-cli", "claude-code-cli"]),
  prompt: z.string().min(1),
  cwd: z.string().optional(),
  skillIds: z.array(z.string()).default([]),
  mcpIds: z.array(z.string()).default([])
}).strict();

function escapeHtml(text: string): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}

function renderPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Roblox Local Control Plane</title>
    <style>
      body { font-family: sans-serif; margin: 24px; background: #111827; color: #f9fafb; }
      textarea, select, button { width: 100%; margin-top: 8px; }
      textarea { min-height: 180px; }
      pre { background: #0f172a; padding: 16px; overflow: auto; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    </style>
  </head>
  <body>
    <h1>Roblox Local Control Plane</h1>
    <p>Local-only orchestration layer for provider selection, detection, and prompt execution.</p>
    <div class="grid">
      <section>
        <h2>Status</h2>
        <pre id="status">Loading...</pre>
      </section>
      <section>
        <h2>Run Job</h2>
        <label>Provider</label>
        <select id="provider"></select>
        <label>Prompt</label>
        <textarea id="prompt" placeholder="Describe the Roblox or Blender task to run locally."></textarea>
        <button id="run">Run</button>
        <pre id="result">Idle.</pre>
      </section>
    </div>
    <script>
      async function loadStatus() {
        const response = await fetch('/api/status');
        const data = await response.json();
        document.getElementById('status').textContent = JSON.stringify(data, null, 2);
        const providerSelect = document.getElementById('provider');
        providerSelect.innerHTML = data.providers.map((provider) => {
          const disabled = provider.available ? '' : 'disabled';
          const selected = data.defaults.defaultProviderId === provider.id ? 'selected' : '';
          return '<option value="' + escapeHtml(provider.id) + '" ' + disabled + ' ' + selected + '>' + escapeHtml(provider.label) + '</option>';
        }).join('');
      }

      async function runJob() {
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            providerId: document.getElementById('provider').value,
            prompt: document.getElementById('prompt').value
          })
        });
        const data = await response.json();
        document.getElementById('result').textContent = JSON.stringify(data, null, 2);
      }

      document.getElementById('run').addEventListener('click', runJob);
      loadStatus();
    </script>
  </body>
</html>`;
}

export async function buildLocalControlPlaneStatus(config: LoadedLocalControlPlaneConfig) {
  const [roblox, luau, blender] = await Promise.all([
    detectRobloxConnector(),
    detectLuauRuntime(config.cwd),
    detectBlenderConnector()
  ]);

  return {
    manifest: inspectProjectManifest(config.cwd),
    connectors: {
      roblox,
      luau,
      blender
    },
    providers: listLocalProviders(config),
    registry: config.registry,
    defaults: {
      defaultProviderId: config.defaultProviderId,
      cwd: config.cwd,
      envFilePath: config.envFilePath,
      registryPath: config.registryPath
    }
  };
}

export function createLocalControlPlaneServer(config: LoadedLocalControlPlaneConfig) {
  const fastify = Fastify({ logger: true });

  fastify.get("/", async (_, reply) => {
    reply.type("text/html").send(renderPage());
  });

  fastify.get("/api/status", async () => {
    return await buildLocalControlPlaneStatus(config);
  });

  fastify.post("/api/jobs", async (request, reply) => {
    const parsedBody = launchJobSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.code(400).send({
        error: "Invalid job request"
      });
    }

    const availableProviders = listLocalProviders(config);
    const selectedProvider = availableProviders.find((provider) => provider.id === parsedBody.data.providerId);
    if (!selectedProvider?.available) {
      return reply.code(400).send({
        error: "Requested provider is not available"
      });
    }

    const selectedSkills = config.registry.skills.filter((skill) => parsedBody.data.skillIds.includes(skill.id));
    const selectedMcps = config.registry.mcps.filter((mcp) => parsedBody.data.mcpIds.includes(mcp.id));
    const result = await runLocalProviderJob(config, {
      providerId: parsedBody.data.providerId as LocalProviderId,
      prompt: parsedBody.data.prompt,
      cwd: parsedBody.data.cwd || config.cwd,
      selectedSkills,
      selectedMcps
    });

    return {
      ok: result.ok,
      result
    };
  });

  return fastify;
}
