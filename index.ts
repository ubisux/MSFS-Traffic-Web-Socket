import { log } from "./src/logger.ts";
import { startBridge } from "./src/simconnect_bridge.ts";
import { startTui } from "./src/tui.ts";

try {
  startBridge();
} catch (err) {
  log("Bridge failed to start: " + (err instanceof Error ? err.message : err));
}

const app = startTui();
await app.run();
