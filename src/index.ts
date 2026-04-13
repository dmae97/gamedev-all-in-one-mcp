import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { startLuauRuntimeBridge, stopLuauRuntimeBridge } from "./connectors/luau/bridge.js";
import { startUnityBridge, stopUnityBridge } from "./connectors/unity/index.js";
import { startUnrealBridge, stopUnrealBridge } from "./connectors/unreal/index.js";
import { startBlenderBridge, stopBlenderBridge } from "./connectors/blender/index.js";
import { createServer } from "./server/create-server.js";
import { startDashboardServer, stopDashboardServer } from "./web/server.js";

async function main() {
  startUnityBridge();
  startUnrealBridge();
  startBlenderBridge();

  await Promise.all([
    startLuauRuntimeBridge(),
    startDashboardServer()
  ]);

  const server = createServer();
  const transport = new StdioServerTransport();

  const shutdown = async () => {
    console.error("gamedev-all-in-one shutting down...");
    stopUnityBridge();
    stopUnrealBridge();
    stopBlenderBridge();
    await Promise.allSettled([
      server.close(),
      stopLuauRuntimeBridge(),
      stopDashboardServer()
    ]);
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await server.connect(transport);
  console.error("gamedev-all-in-one running on stdio");
}

main().catch(async (error) => {
  stopUnityBridge();
  stopUnrealBridge();
  stopBlenderBridge();
  await Promise.allSettled([
    stopLuauRuntimeBridge(),
    stopDashboardServer()
  ]);
  console.error("gamedev-all-in-one failed:", error);
  process.exit(1);
});
