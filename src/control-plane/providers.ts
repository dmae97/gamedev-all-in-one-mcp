import { existsSync, statSync } from "node:fs";
import { spawn } from "node:child_process";
import { isAbsolute } from "node:path";
import { z } from "zod";
import type {
  ControlPlaneMcpEntry,
  ControlPlaneSkillEntry,
  LoadedLocalControlPlaneConfig,
  LocalProviderId
} from "./config.js";
import { commandExists } from "../validation/environment.js";

export type LocalProviderStatus = {
  id: LocalProviderId;
  label: string;
  kind: "api" | "cli";
  available: boolean;
  model: string | null;
  reason: string | null;
};

export type ProviderJobInput = {
  providerId: LocalProviderId;
  prompt: string;
  cwd: string;
  selectedSkills: ControlPlaneSkillEntry[];
  selectedMcps: ControlPlaneMcpEntry[];
};

export type ProviderJobResult = {
  providerId: LocalProviderId;
  ok: boolean;
  output: string;
  stderr: string;
  exitCode: number;
  model: string | null;
};

const openAiResponseSchema = z.object({
  output_text: z.string().optional()
}).passthrough();

const anthropicMessageSchema = z.object({
  content: z.array(z.object({
    type: z.string(),
    text: z.string().optional()
  }).passthrough())
}).passthrough();

const chatCompletionSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.string().optional()
    }).passthrough()
  }).passthrough())
}).passthrough();

function commandAvailable(command: string) {
  if (isAbsolute(command)) {
    try {
      if (!existsSync(command)) {
        return false;
      }

      return (statSync(command).mode & 0o111) !== 0;
    } catch {
      return false;
    }
  }

  return commandExists(command);
}

function buildPrompt(
  prompt: string,
  selectedSkills: ControlPlaneSkillEntry[],
  selectedMcps: ControlPlaneMcpEntry[]
) {
  const sections = [prompt.trim()];

  if (selectedSkills.length > 0) {
    sections.push([
      "Selected local skills:",
      ...selectedSkills.map((skill) => `- ${skill.title}: ${skill.prompt}`)
    ].join("\n"));
  }

  if (selectedMcps.length > 0) {
    sections.push([
      "Selected local MCP registry entries:",
      ...selectedMcps.map((mcp) => `- ${mcp.title} (${mcp.transport})`)
    ].join("\n"));
  }

  return sections.filter(Boolean).join("\n\n");
}

async function runCommand(command: string, args: string[], cwd: string) {
  return await new Promise<ProviderJobResult>((resolvePromise) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => {
      resolvePromise({
        providerId: "codex-cli",
        ok: code === 0,
        output: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code ?? 1,
        model: null
      });
    });
    child.on("error", (error) => {
      resolvePromise({
        providerId: "codex-cli",
        ok: false,
        output: "",
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
        model: null
      });
    });
  });
}

export function listLocalProviders(config: LoadedLocalControlPlaneConfig): LocalProviderStatus[] {
  return [
    {
      id: "openai-api",
      label: "OpenAI API",
      kind: "api",
      available: Boolean(config.openAiApiKey),
      model: config.openAiModel,
      reason: config.openAiApiKey ? null : "OPENAI_API_KEY is not configured."
    },
    {
      id: "anthropic-api",
      label: "Anthropic API",
      kind: "api",
      available: Boolean(config.anthropicApiKey),
      model: config.anthropicModel,
      reason: config.anthropicApiKey ? null : "ANTHROPIC_API_KEY is not configured."
    },
    {
      id: "zai-api",
      label: "z.ai API",
      kind: "api",
      available: Boolean(config.zaiApiKey),
      model: config.zaiModel,
      reason: config.zaiApiKey ? null : "ZAI_API_KEY is not configured."
    },
    {
      id: "minimax-api",
      label: "MiniMax API",
      kind: "api",
      available: Boolean(config.minimaxApiKey),
      model: config.minimaxModel,
      reason: config.minimaxApiKey ? null : "MINIMAX_API_KEY is not configured."
    },
    {
      id: "codex-cli",
      label: "Codex CLI",
      kind: "cli",
      available: commandAvailable(config.codexCommand),
      model: null,
      reason: commandAvailable(config.codexCommand) ? null : `${config.codexCommand} is not installed or not executable.`
    },
    {
      id: "claude-code-cli",
      label: "Claude Code CLI",
      kind: "cli",
      available: commandAvailable(config.claudeCodeCommand),
      model: null,
      reason: commandAvailable(config.claudeCodeCommand) ? null : `${config.claudeCodeCommand} is not installed or not executable.`
    }
  ];
}

export async function runLocalProviderJob(
  config: LoadedLocalControlPlaneConfig,
  input: ProviderJobInput
): Promise<ProviderJobResult> {
  const prompt = buildPrompt(input.prompt, input.selectedSkills, input.selectedMcps);

  if (input.providerId === "openai-api") {
    if (!config.openAiApiKey) {
      return {
        providerId: input.providerId,
        ok: false,
        output: "",
        stderr: "OPENAI_API_KEY is not configured.",
        exitCode: 1,
        model: config.openAiModel
      };
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.openAiApiKey}`
      },
      body: JSON.stringify({
        model: config.openAiModel,
        input: prompt
      })
    });
    const text = await response.text();
    if (!response.ok) {
      return {
        providerId: input.providerId,
        ok: false,
        output: "",
        stderr: text,
        exitCode: response.status,
        model: config.openAiModel
      };
    }

    const parsed = openAiResponseSchema.parse(JSON.parse(text));
    return {
      providerId: input.providerId,
      ok: true,
      output: parsed.output_text || text,
      stderr: "",
      exitCode: 0,
      model: config.openAiModel
    };
  }

  if (input.providerId === "anthropic-api") {
    if (!config.anthropicApiKey) {
      return {
        providerId: input.providerId,
        ok: false,
        output: "",
        stderr: "ANTHROPIC_API_KEY is not configured.",
        exitCode: 1,
        model: config.anthropicModel
      };
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": config.anthropicApiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: config.anthropicModel,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });
    const text = await response.text();
    if (!response.ok) {
      return {
        providerId: input.providerId,
        ok: false,
        output: "",
        stderr: text,
        exitCode: response.status,
        model: config.anthropicModel
      };
    }

    const parsed = anthropicMessageSchema.parse(JSON.parse(text));
    return {
      providerId: input.providerId,
      ok: true,
      output: parsed.content.map((item) => item.text || "").join("\n").trim(),
      stderr: "",
      exitCode: 0,
      model: config.anthropicModel
    };
  }

  if (input.providerId === "zai-api") {
    if (!config.zaiApiKey) {
      return {
        providerId: input.providerId,
        ok: false,
        output: "",
        stderr: "ZAI_API_KEY is not configured.",
        exitCode: 1,
        model: config.zaiModel
      };
    }

    const response = await fetch("https://api.z.ai/api/coding/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept-language": "en-US,en",
        authorization: `Bearer ${config.zaiApiKey}`
      },
      body: JSON.stringify({
        model: config.zaiModel,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });
    const text = await response.text();
    if (!response.ok) {
      return {
        providerId: input.providerId,
        ok: false,
        output: "",
        stderr: text,
        exitCode: response.status,
        model: config.zaiModel
      };
    }

    const parsed = chatCompletionSchema.parse(JSON.parse(text));
    return {
      providerId: input.providerId,
      ok: true,
      output: parsed.choices[0]?.message?.content || text,
      stderr: "",
      exitCode: 0,
      model: config.zaiModel
    };
  }

  if (input.providerId === "minimax-api") {
    if (!config.minimaxApiKey) {
      return {
        providerId: input.providerId,
        ok: false,
        output: "",
        stderr: "MINIMAX_API_KEY is not configured.",
        exitCode: 1,
        model: config.minimaxModel
      };
    }

    const response = await fetch("https://api.minimax.io/v1/text/chatcompletion_v2", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.minimaxApiKey}`
      },
      body: JSON.stringify({
        model: config.minimaxModel,
        messages: [
          {
            role: "user",
            content: prompt,
            name: "User"
          }
        ]
      })
    });
    const text = await response.text();
    if (!response.ok) {
      return {
        providerId: input.providerId,
        ok: false,
        output: "",
        stderr: text,
        exitCode: response.status,
        model: config.minimaxModel
      };
    }

    const parsed = chatCompletionSchema.parse(JSON.parse(text));
    return {
      providerId: input.providerId,
      ok: true,
      output: parsed.choices[0]?.message?.content || text,
      stderr: "",
      exitCode: 0,
      model: config.minimaxModel
    };
  }

  if (input.providerId === "codex-cli") {
    const result = await runCommand(
      config.codexCommand,
      ["exec", "--skip-git-repo-check", "-C", input.cwd, prompt],
      input.cwd
    );
    return {
      ...result,
      providerId: input.providerId
    };
  }

  const result = await runCommand(
    config.claudeCodeCommand,
    ["-p", prompt, "--output-format", "text"],
    input.cwd
  );
  return {
    ...result,
    providerId: input.providerId
  };
}
