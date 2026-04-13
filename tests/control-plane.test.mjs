import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const configModule = await import(pathToFileURL(resolve(projectRoot, "dist/control-plane/config.js")).href);
const serverModule = await import(pathToFileURL(resolve(projectRoot, "dist/control-plane/server.js")).href);

function createFixture() {
  const cwd = mkdtempSync(join(tmpdir(), "roblox-local-control-"));
  mkdirSync(join(cwd, ".roblox-mcp"), { recursive: true });
  writeFileSync(join(cwd, ".env"), [
    "LOCAL_CONTROL_DEFAULT_PROVIDER=openai-api",
    "OPENAI_API_KEY=test-key",
    "OPENAI_MODEL=gpt-5.4",
    "ZAI_API_KEY=test-zai-key",
    "ZAI_MODEL=glm-5.1",
    "MINIMAX_API_KEY=test-minimax-key",
    "MINIMAX_MODEL=M2-her",
    "CODEX_COMMAND=/definitely-missing-codex",
    "CLAUDE_CODE_COMMAND=/definitely-missing-claude"
  ].join("\n"));
  writeFileSync(join(cwd, ".roblox-mcp", "control-plane.json"), JSON.stringify({
    skills: [
      {
        id: "roblox-builder",
        title: "Roblox Builder",
        prompt: "Focus on Roblox Studio edits."
      }
    ],
    mcps: [
      {
        id: "local-stdio",
        title: "Local Stdio MCP",
        transport: "stdio",
        command: "node",
        args: ["dist/index.js"]
      }
    ]
  }, null, 2));

  return cwd;
}

test("status API surfaces providers and local registry entries", async () => {
  const cwd = createFixture();
  const config = configModule.loadLocalControlPlaneConfig(cwd);
  const server = serverModule.createLocalControlPlaneServer(config);
  await server.ready();

  try {
    const response = await server.inject({
      method: "GET",
      url: "/api/status"
    });
    const body = response.json();

    assert.equal(response.statusCode, 200);
    assert.equal(body.defaults.defaultProviderId, "openai-api");
    assert.equal(body.providers.some((provider) => provider.id === "openai-api" && provider.available), true);
    assert.equal(body.providers.some((provider) => provider.id === "zai-api" && provider.available), true);
    assert.equal(body.providers.some((provider) => provider.id === "minimax-api" && provider.available), true);
    assert.equal(body.registry.skills[0].id, "roblox-builder");
    assert.equal(body.registry.mcps[0].id, "local-stdio");
  } finally {
    await server.close();
  }
});

test("job API rejects unavailable providers", async () => {
  const cwd = createFixture();
  const config = configModule.loadLocalControlPlaneConfig(cwd);
  const server = serverModule.createLocalControlPlaneServer(config);
  await server.ready();

  try {
    const response = await server.inject({
      method: "POST",
      url: "/api/jobs",
      payload: {
        providerId: "codex-cli",
        prompt: "test"
      }
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error, "Requested provider is not available");
  } finally {
    await server.close();
  }
});
