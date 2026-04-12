import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { startLuauRuntimeBridge } from "./connectors/luau/bridge.js";
import { createServer } from "./server/create-server.js";

async function main() {
  await startLuauRuntimeBridge();
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error("roblox-all-in-one-mcp running on stdio");
}

main().catch((error) => {
  console.error("roblox-all-in-one-mcp failed:", error);
  process.exit(1);
});
