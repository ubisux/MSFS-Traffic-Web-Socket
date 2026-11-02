import {
  open,
  Protocol,
  SimConnectConstants,
  SimConnectDataType,
  SimConnectPeriod,
  SimObjectType,
} from "node-simconnect";
import type { OpenEvent } from "node-simconnect";
import { openSimConnectWithFallback } from "./simconnect_protocol.ts";
import {
  setMovementSimConnectHandle,
  setupAircraftMovementDefinition,
} from "../../aircraft_movement.ts";
import {
  cleanupStaleSimObjects,
  printAircraftData,
  printAircraftMotion,
  printCameraData,
} from "../../aircraft_store.ts";
import { reconnectDelaySec, simconnectFetchIntervalSec } from "../../config.ts";
import { log } from "../../loggers/logger.ts";
import {
  DEFINITION_1,
  DEFINITION_2,
  REQUEST_AI_AIRCRAFT,
  REQUEST_CAMERA,
} from "../../shared/types.ts";
import * as S from "../../state.ts";
import { publishSimConnectStatus } from "../../tower_stream.ts";

const DEFINITION_MOTION = 6;
const OBJECT_REMOVED_EVENT = 100;
const FIRST_MOTION_REQUEST = 1000;

// ===== SimConnect Setup =====
function setupDataDefinitions(): void {
  if (!S.handle.value) return;
  const sc = SimConnectDataType;
  for (const definition of [DEFINITION_1, DEFINITION_MOTION]) {
    for (const [name, unit, type] of [
      ["PLANE ALTITUDE", "ft", sc.FLOAT64],
      ["PLANE LATITUDE", "degrees", sc.FLOAT64],
      ["PLANE LONGITUDE", "degrees", sc.FLOAT64],
      ["PLANE PITCH DEGREES", "radian", sc.FLOAT64],
      ["PLANE HEADING DEGREES TRUE", "radian", sc.FLOAT64],
      ["PLANE BANK DEGREES", "radian", sc.FLOAT64],
      ["SIM ON GROUND", "number", sc.INT32],
      ["GROUND VELOCITY", "knots", sc.INT32],
      ["VERTICAL SPEED", "ft/min", sc.INT32],
    ] as const) {
      S.handle.value.addToDataDefinition(definition, name, unit, type);
    }
  }
  S.handle.value.addToDataDefinition(DEFINITION_1, "TITLE", "", sc.STRING256);
  // ATC ID carries the VATSIM callsign for model-matched multiplayer traffic, so it
  // is an exact identity signal rather than a proximity guess. Objects without it
  // (default AI traffic) simply return an empty string.
  S.handle.value.addToDataDefinition(
    DEFINITION_1,
    "ATC ID",
    "",
    sc.STRING256,
  );
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
  S.handle.value.addToDataDefinition(
    DEFINITION_2,
    "PLANE LATITUDE",
    "degrees",
    sc.FLOAT64,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_2,
    "PLANE LONGITUDE",
    "degrees",
    sc.FLOAT64,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_2,
    "PLANE ALTITUDE",
    "ft",
    sc.FLOAT64,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_2,
    "PLANE HEADING DEGREES TRUE",
    "radian",
    sc.FLOAT64,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_2,
    "PLANE PITCH DEGREES",
    "radian",
    sc.FLOAT64,
  );
  S.handle.value.addToDataDefinition(
    DEFINITION_2,
    "PLANE BANK DEGREES",
    "radian",
    sc.FLOAT64,
  );

  setupAircraftMovementDefinition();
}

function startPollLoop(prune: () => void): void {
  if (!S.handle.value || S.quit.value) return;
  prune();

  S.handle.value.requestDataOnSimObjectType(
    REQUEST_AI_AIRCRAFT,
    DEFINITION_1,
    50000,
    SimObjectType.AIRCRAFT,
  );

  S.pollTimer.value = setTimeout(() => {
    cleanupStaleSimObjects(S.seenIds.value);
    S.seenIds.value.clear();
    if (!S.quit.value) {
      startPollLoop(prune);
    }
  }, simconnectFetchIntervalSec * 1000);
}

export function stopPollLoop(): void {
  if (S.pollTimer.value) {
    clearTimeout(S.pollTimer.value);
    S.pollTimer.value = undefined;
  }
}

// ===== Reconnect Loop =====
export async function connectAndSetup(options: {
  connect?: () => Promise<{ result: OpenEvent; protocol: Protocol }>;
  wait?: (milliseconds: number) => Promise<void>;
  reconnectSeconds?: number;
} = {}): Promise<void> {
  const connect = options.connect ?? (() => openSimConnectWithFallback(
    (protocol) => open("MSFS SimConnect Bridge", protocol),
    (error) => log(`MSFS 2024 SimConnect unavailable; trying MSFS 2020 protocol: ${error instanceof Error ? error.message : String(error)}`),
  ));
  const wait = options.wait ?? ((milliseconds: number) => {
    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, milliseconds);
    return promise;
  });
  const reconnectSeconds = options.reconnectSeconds ?? reconnectDelaySec;
  while (!S.shouldExit.value) {
    try {
      const { result, protocol } = await connect();
      const handle = result.handle;
      S.handle.value = handle;
      setMovementSimConnectHandle(handle);
      S.simconnectConnected.value = true;
      S.quit.value = false;
      log(`SimConnect connected using ${protocol === Protocol.SunRise ? "MSFS 2024" : "MSFS 2020-compatible"} protocol.`);

      let active = true;
      let nextRequest = FIRST_MOTION_REQUEST;
      const byObject = new Map<number, number>();
      const byRequest = new Map<number, number>();
      let batch: { ids: Set<number>; next: number; total: number } | null = null;
      const current = () => active && S.handle.value === handle;
      const disconnect = () => {
        if (!current()) return;
        active = false;
        stopPollLoop();
        byObject.clear();
        byRequest.clear();
        S.simconnectConnected.value = false;
        S.quit.value = true;
        setMovementSimConnectHandle(null!);
        publishSimConnectStatus(false);
      };
      const cancel = (objectId: number) => {
        const request = byObject.get(objectId);
        if (request === undefined) return;
        byObject.delete(objectId);
        byRequest.delete(request);
        handle.requestDataOnSimObject(request, DEFINITION_MOTION, objectId, SimConnectPeriod.NEVER);
      };
      const prune = () => {
        for (const objectId of byObject.keys()) {
          if (!S.simAircraftMap.has(objectId)) cancel(objectId);
        }
      };
      const subscribe = (objectId: number) => {
        if (byObject.has(objectId)) return;
        const request = nextRequest++;
        handle.requestDataOnSimObject(request, DEFINITION_MOTION, objectId, SimConnectPeriod.SIM_FRAME);
        byObject.set(objectId, request);
        byRequest.set(request, objectId);
      };

      handle.on("simObjectDataByType", (recv) => {
        if (!current() || recv.requestID !== REQUEST_AI_AIRCRAFT) return;
        if (printAircraftData(recv.objectID, recv.data)) {
          S.seenIds.value.add(recv.objectID);
          subscribe(recv.objectID);
        }
        if (recv.entryNumber === 1 && recv.outOf > 0) {
          batch = { ids: new Set(), next: 1, total: recv.outOf };
        }
        if (!batch || recv.outOf !== batch.total || recv.entryNumber !== batch.next) {
          batch = null;
          return;
        }
        batch.ids.add(recv.objectID);
        batch.next++;
        if (batch.next > batch.total) {
          for (const id of byObject.keys()) if (!batch.ids.has(id)) cancel(id);
          batch = null;
        }
      });
      handle.on("simObjectData", (recv) => {
        if (!current()) return;
        if (recv.requestID === REQUEST_CAMERA) printCameraData(recv.data);
        else if (byRequest.get(recv.requestID) === recv.objectID) printAircraftMotion(recv.objectID, recv.data);
      });
      handle.on("eventAddRemove", (recv) => {
        if (!current() || recv.clientEventId !== OBJECT_REMOVED_EVENT) return;
        cancel(recv.data);
        S.simAircraftMap.delete(recv.data);
        S.seenIds.value.delete(recv.data);
        batch?.ids.delete(recv.data);
      });
      handle.on("exception", (recv) => {
        if (!current()) return;
        log("SimConnect Exception: " + JSON.stringify(recv));
        disconnect();
      });
      handle.on("quit", disconnect);
      handle.on("close", disconnect);
      handle.on("error", (error) => {
        if (current()) log(`SimConnect error: ${error.message}`);
        disconnect();
      });

      try {
        setupDataDefinitions();
        S.seenIds.value.clear();
        handle.subscribeToSystemEvent(OBJECT_REMOVED_EVENT, "ObjectRemoved");
        handle.requestDataOnSimObject(REQUEST_CAMERA, DEFINITION_2, SimConnectConstants.OBJECT_ID_USER, SimConnectPeriod.SIM_FRAME);
        publishSimConnectStatus(true);
        startPollLoop(prune);
      } catch (error) {
        disconnect();
        handle.close();
        if (S.handle.value === handle) S.handle.value = null;
        S.quit.value = false;
        throw error;
      }

      // Wait until disconnected
      while (S.simconnectConnected.value && !S.shouldExit.value) {
        await wait(100);
      }

      // Cleanup
      disconnect();
      handle.close();
      if (S.handle.value === handle) S.handle.value = null;
      setMovementSimConnectHandle(null!);
      S.quit.value = false;

      if (S.shouldExit.value) break;

      log(`Reconnecting in ${reconnectSeconds} seconds...`);
      for (let i = 0; i < reconnectSeconds * 10 && !S.shouldExit.value; i++) {
        await wait(100);
      }
    } catch (err) {
      // log(
      //   "Failed to connect to SimConnect: " +
      //     (err instanceof Error ? err.message : err) + `. Retrying in ${reconnectDelaySec} seconds...`,
      // );
      for (let i = 0; i < reconnectSeconds * 10 && !S.shouldExit.value; i++) {
        await wait(100);
      }
    }
  }
}
