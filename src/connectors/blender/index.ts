import { commandExists, envFlag } from "../../validation/environment.js";

export type ConnectorStatus = {
  available: boolean;
  reasons: string[];
  detected: {
    command: boolean;
    bridge: boolean;
  };
};

export async function detectBlenderConnector(): Promise<ConnectorStatus> {
  const command = commandExists("blender");
  const bridge = envFlag("BLENDER_MCP_URL") || envFlag("BLENDER_EXECUTABLE");
  const reasons: string[] = [];

  if (!command) {
    reasons.push("No local Blender executable detected.");
  }

  if (!bridge) {
    reasons.push("No Blender bridge hint detected (BLENDER_MCP_URL or BLENDER_EXECUTABLE).");
  }

  return {
    available: command || bridge,
    reasons,
    detected: {
      command,
      bridge
    }
  };
}
