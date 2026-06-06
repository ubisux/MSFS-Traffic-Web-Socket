import { startAircraftMovementControl } from "./src/aircraft_movement.ts";
import { updateTuiState } from "./src/bridge.ts";
import { readEnvConfig } from "./src/config.ts";
import { fsdDataLoop } from "./src/connectors/fsd-data/fsd_data_corr.ts";
import { startProxyThreads } from "./src/connectors/proxy/proxy_bridge.ts";
import { proxyCorrLoop } from "./src/connectors/proxy/proxy_corr.ts";
import {
  connectAndSetup,
  stopPollLoop,
} from "./src/connectors/simconnect/simconnect_setup.ts";
import { httpServerThread } from "./src/http_server.ts";
import { log } from "./src/loggers/logger.ts";
import * as S from "./src/state.ts";
import { startTui } from "./src/tui.ts";

try {
  readEnvConfig();

  // Start long-lived background services
  httpServerThread();
  startProxyThreads(S.quit);
  startAircraftMovementControl(S.quit);
  S.fsdDataTimer.value = setTimeout(fsdDataLoop, 0);
  S.proxyCorrTimer.value = setTimeout(proxyCorrLoop, 0);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    log("Shutting down...");
    S.shouldExit.value = true;
    stopPollLoop();
    if (S.fsdDataTimer.value) clearTimeout(S.fsdDataTimer.value);
    if (S.proxyCorrTimer.value) clearTimeout(S.proxyCorrTimer.value);
    if (S.tuiTimer.value) clearTimeout(S.tuiTimer.value);
    S.handle.value?.close();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    S.shouldExit.value = true;
    stopPollLoop();
    if (S.tuiTimer.value) clearTimeout(S.tuiTimer.value);
    S.handle.value?.close();
    process.exit(0);
  });

  // Connect to SimConnect with auto-reconnect (background)
  connectAndSetup();

  // Periodic TUI state refresh
  updateTuiState();
  S.tuiTimer.value = setInterval(updateTuiState, 1000);
} catch (err) {
  log("Bridge failed to start: " + (err instanceof Error ? err.message : err));
}

const app = startTui();
app.run();
