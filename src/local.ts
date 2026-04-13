import { createLocalControlPlaneServer } from "./control-plane/server.js";
import { loadLocalControlPlaneConfig } from "./control-plane/config.js";

async function main() {
  const config = loadLocalControlPlaneConfig();
  const server = createLocalControlPlaneServer(config);

  const shutdown = async () => {
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  const address = await server.listen({
    host: "127.0.0.1",
    port: config.localPort
  });
  console.error(`gamedev-all-in-one-local running at ${address}`);
}

main().catch((error) => {
  console.error("gamedev-all-in-one-local failed:", error);
  process.exit(1);
});
