import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerFoundationTools } from "../tools/foundation.js";
import { registerRobloxTools } from "../tools/roblox.js";

export function createServer() {
  const server = new McpServer({
    name: "roblox-all-in-one-mcp",
    version: "0.1.0"
  });

  registerFoundationTools(server);
  registerRobloxTools(server);

  return server;
}
