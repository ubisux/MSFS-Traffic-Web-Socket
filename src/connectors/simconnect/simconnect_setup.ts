import {
  open,
  Protocol,
  SimConnectConstants,
  SimConnectDataType,
  SimConnectPeriod,
  SimObjectType,
} from "node-simconnect";
import {
  setMovementSimConnectHandle,
  setupAircraftMovementDefinition,
} from "../../aircraft_movement.ts";
import {
  cleanupStaleSimObjects,
  printAircraftData,
  printCameraData,
} from "../../aircraft_store.ts";
import { reconnectDelaySec } from "../../config.ts";
import { log } from "../../loggers/logger.ts";
import {
  DEFINITION_1,
  DEFINITION_2,
  REQUEST_AI_AIRCRAFT,
  REQUEST_CAMERA,
} from "../../shared/types.ts";
import * as S from "../../state.ts";

// ===== SimConnect Setup =====
function setupDataDefinitions(): void {
  if (!S.handle.value) return;
  const sc = SimConnectDataType;
  S.handle.value.addToDataDefinition(
    DEFINITION_1,
    "PLANE ALTITUDE",
    "ft",
    sc.FLOAT64,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_1,
    "PLANE LATITUDE",
    "degrees",
    sc.FLOAT64,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_1,
    "PLANE LONGITUDE",
    "degrees",
    sc.FLOAT64,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_1,
    "PLANE PITCH DEGREES",
    "radian",
    sc.FLOAT64,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_1,
    "PLANE HEADING DEGREES TRUE",
    "radian",
    sc.FLOAT64,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_1,
    "PLANE BANK DEGREES",
    "radian",
    sc.FLOAT64,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_1,
    "SIM ON GROUND",
    "number",
    sc.INT32,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_1,
    "GROUND VELOCITY",
    "knots",
    sc.INT32,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_1,
    "VERTICAL SPEED",
    "ft/min",
    sc.INT32,
  );
  S.handle.value.addToDataDefinition(DEFINITION_1, "TITLE", "", sc.STRING256);

  S.handle.value.addToDataDefinition(
    DEFINITION_2,
    "CAMERA GAMEPLAY PITCH YAW:0",
    "radians",
    sc.FLOAT64,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_2,
    "CAMERA GAMEPLAY PITCH YAW:1",
    "radians",
    sc.FLOAT64,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_2,
    "CAMERA STATE",
    "",
    sc.INT32,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_2,
    "CAMERA VIEW TYPE AND INDEX:0",
    "",
    sc.INT32,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_2,
    "CAMERA VIEW TYPE AND INDEX:1",
    "",
    sc.INT32,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_2,
    "COCKPIT CAMERA ZOOM",
    "Percentage",
    sc.INT32,
  );

  setupAircraftMovementDefinition();
}

function startPollLoop(): void {
  if (!S.handle.value || S.quit.value) return;

  S.handle.value.requestDataOnSimObjectType(
    REQUEST_AI_AIRCRAFT,
    DEFINITION_1,
    50000,
    SimObjectType.AIRCRAFT,
  );
  S.handle.value.requestDataOnSimObject(
    REQUEST_CAMERA,
    DEFINITION_2,
    SimConnectConstants.OBJECT_ID_USER,
    SimConnectPeriod.ONCE,
  );

  S.pollTimer.value = setTimeout(() => {
    cleanupStaleSimObjects(S.seenIds.value);
    S.seenIds.value.clear();
    if (!S.quit.value) {
      startPollLoop();
    }
  }, 10);
}

export function stopPollLoop(): void {
  if (S.pollTimer.value) {
    clearTimeout(S.pollTimer.value);
    S.pollTimer.value = undefined;
  }
}

// ===== Reconnect Loop =====
export async function connectAndSetup(): Promise<void> {
  while (!S.shouldExit.value) {
    try {
      const result = await open("MSFS SimConnect Bridge", Protocol.KittyHawk);
      S.handle.value = result.handle;
      setMovementSimConnectHandle(S.handle.value);
      S.simconnectConnected.value = true;
      log("SimConnect connected.");

      setupDataDefinitions();

      S.seenIds.value.clear();

      S.handle.value.on("simObjectDataByType", (recv) => {
        if (recv.requestID === REQUEST_AI_AIRCRAFT) {
          printAircraftData(recv.objectID, recv.data);
          S.seenIds.value.add(recv.objectID);
        }
      });

      S.handle.value.on("simObjectData", (recv) => {
        if (recv.requestID === REQUEST_CAMERA) {
          printCameraData(recv.data);
        }
      });

      S.handle.value.on("exception", (recv) => {
        log("SimConnect Exception: " + JSON.stringify(recv));
      });

      S.handle.value.on("quit", () => {
        log("SimConnect quit received.");
        S.simconnectConnected.value = false;
        S.quit.value = true;
      });

      startPollLoop();

      // Wait until disconnected
      while (S.simconnectConnected.value && !S.shouldExit.value) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Cleanup
      stopPollLoop();
      S.handle.value.close();
      S.handle.value = null;
      setMovementSimConnectHandle(null!);
      S.quit.value = false;

      if (S.shouldExit.value) break;

      log(`Reconnecting in ${reconnectDelaySec} seconds...`);
      for (let i = 0; i < reconnectDelaySec * 10 && !S.shouldExit.value; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (err) {
      // log(
      //   "Failed to connect to SimConnect: " +
      //     (err instanceof Error ? err.message : err) + `. Retrying in ${reconnectDelaySec} seconds...`,
      // );
      for (let i = 0; i < reconnectDelaySec * 10 && !S.shouldExit.value; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }
}
