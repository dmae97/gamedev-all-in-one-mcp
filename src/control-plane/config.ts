import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { z } from "zod";

const DEFAULT_LOCAL_CONTROL_PORT = 3210;

const skillEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  prompt: z.string().min(1)
}).strict();

const mcpEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  transport: z.enum(["stdio", "http"]),
  command: z.string().min(1).optional(),
  args: z.array(z.string()).optional(),
  url: z.string().url().optional(),
  env: z.record(z.string()).optional()
}).strict();

const controlPlaneRegistrySchema = z.object({
  skills: z.array(skillEntrySchema).default([]),
  mcps: z.array(mcpEntrySchema).default([])
}).strict();

export type ControlPlaneSkillEntry = z.infer<typeof skillEntrySchema>;
export type ControlPlaneMcpEntry = z.infer<typeof mcpEntrySchema>;
export type ControlPlaneRegistry = z.infer<typeof controlPlaneRegistrySchema>;

export type LocalProviderId = "openai-api" | "anthropic-api" | "zai-api" | "minimax-api" | "codex-cli" | "claude-code-cli";

export type LoadedLocalControlPlaneConfig = {
  cwd: string;
  localPort: number;
  defaultProviderId: LocalProviderId | null;
  envFilePath: string;
  envValues: Record<string, string>;
  registryPath: string;
  registry: ControlPlaneRegistry;
  openAiApiKey: string | null;
  openAiModel: string;
  anthropicApiKey: string | null;
  anthropicModel: string;
  zaiApiKey: string | null;
  zaiModel: string;
  minimaxApiKey: string | null;
  minimaxModel: string;
  codexCommand: string;
  claudeCodeCommand: string;
};

function parseDotEnv(content: string) {
  const values: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function readEnvFile(cwd: string) {
  const envFilePath = join(cwd, ".env");
  if (!existsSync(envFilePath)) {
    return {
      envFilePath,
      envValues: {}
    };
  }

  return {
    envFilePath,
    envValues: parseDotEnv(readFileSync(envFilePath, "utf8"))
  };
}

function readRegistry(cwd: string) {
  const registryPath = join(cwd, ".roblox-mcp", "control-plane.json");
  if (!existsSync(registryPath)) {
    return {
      registryPath,
      registry: controlPlaneRegistrySchema.parse({})
    };
  }

  const parsed = JSON.parse(readFileSync(registryPath, "utf8"));
  return {
    registryPath,
    registry: controlPlaneRegistrySchema.parse(parsed)
  };
}

function getEnvValue(envValues: Record<string, string>, name: string) {
  const runtimeValue = process.env[name]?.trim();
  if (runtimeValue) {
    return runtimeValue;
  }

  return envValues[name]?.trim() || null;
}

function parseLocalPort(rawPort: string | null) {
  if (!rawPort) {
    return DEFAULT_LOCAL_CONTROL_PORT;
  }

  const parsed = Number(rawPort);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    return DEFAULT_LOCAL_CONTROL_PORT;
  }

  return parsed;
}

function parseDefaultProvider(rawProvider: string | null): LocalProviderId | null {
  if (
    rawProvider === "openai-api"
    || rawProvider === "anthropic-api"
    || rawProvider === "zai-api"
    || rawProvider === "minimax-api"
    || rawProvider === "codex-cli"
    || rawProvider === "claude-code-cli"
  ) {
    return rawProvider;
  }

  return null;
}

export function loadLocalControlPlaneConfig(cwd = process.cwd()): LoadedLocalControlPlaneConfig {
  const projectRoot = resolve(cwd);
  const { envFilePath, envValues } = readEnvFile(projectRoot);
  const { registryPath, registry } = readRegistry(projectRoot);

  return {
    cwd: projectRoot,
    localPort: parseLocalPort(getEnvValue(envValues, "LOCAL_CONTROL_PORT")),
    defaultProviderId: parseDefaultProvider(getEnvValue(envValues, "LOCAL_CONTROL_DEFAULT_PROVIDER")),
    envFilePath,
    envValues,
    registryPath,
    registry,
    openAiApiKey: getEnvValue(envValues, "OPENAI_API_KEY"),
    openAiModel: getEnvValue(envValues, "OPENAI_MODEL") || "gpt-5.4",
    anthropicApiKey: getEnvValue(envValues, "ANTHROPIC_API_KEY"),
    anthropicModel: getEnvValue(envValues, "ANTHROPIC_MODEL") || "claude-sonnet-4-6",
    zaiApiKey: getEnvValue(envValues, "ZAI_API_KEY"),
    zaiModel: getEnvValue(envValues, "ZAI_MODEL") || "glm-5.1",
    minimaxApiKey: getEnvValue(envValues, "MINIMAX_API_KEY"),
    minimaxModel: getEnvValue(envValues, "MINIMAX_MODEL") || "M2-her",
    codexCommand: getEnvValue(envValues, "CODEX_COMMAND") || "codex",
    claudeCodeCommand: getEnvValue(envValues, "CLAUDE_CODE_COMMAND") || "claude"
  };
}
