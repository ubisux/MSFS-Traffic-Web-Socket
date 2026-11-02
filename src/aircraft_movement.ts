import { InitPosition, RawBuffer, SimConnectConnection, SimConnectConstants, SimConnectDataType } from "node-simconnect";
import { log } from "./loggers/logger.ts";
import { DEFINITION_3, DEFINITION_4, MOVEMENT_HTTP_PORT } from "./shared/types.ts";
import * as S from './state.ts';
import { validMove } from './tower_protocol.ts';
import type { mtws } from './protocol/tower.generated.js';

export function dispatchTowerMove(data: mtws.tower.v1.IMove): void {
  if (!validMove(data)) throw new Error('invalid_move');
  if (!movementHandle || !S.simconnectConnected.value) throw new Error('simconnect_unavailable');
  setAircraftPosition({ latitude: data.lat, longitude: data.lon, altitude: data.alt,
    heading: data.heading, pitch: data.pitch, bank: data.bank, cockpitCameraZoom: data.cockpit_camera_zoom });
}

export function dispatchTowerReset(): void {
  if (!movementHandle || !S.simconnectConnected.value) throw new Error('simconnect_unavailable');
  sendCockpitViewReset(1);
}

interface AircraftMovementData {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  pitch: number;
  bank: number;
  cockpitCameraZoom: number;
}

interface CockpitViewResetData {
  reset: number;
}

// Keep camera properties separate from aircraft position/attitude updates.
const COCKPIT_ZOOM_DEFINITION = 5;

let movementHandle: SimConnectConnection | null = null;

let movementMutex = false;
let currentMovementData: AircraftMovementData = {
  latitude: 0,
  longitude: 0,
  altitude: 0,
  heading: 0,
  pitch: 0,
  bank: 0,
  cockpitCameraZoom: 1.0,
};
let hasMovementData = false;

let movementThreadQuit = { value: false };

export function setMovementSimConnectHandle(
  handle: SimConnectConnection,
): void {
  movementHandle = handle;
}

export function setupAircraftMovementDefinition(): void {
  if (!movementHandle) {
    log(
      "SimConnect handle is null, cannot set up aircraft movement definition",
    );
    return;
  }

  movementHandle.addToDataDefinition(DEFINITION_3, "PLANE LATITUDE", "degrees", 4);
  movementHandle.addToDataDefinition(DEFINITION_3, "PLANE LONGITUDE", "degrees", 4);
  movementHandle.addToDataDefinition(DEFINITION_3, "PLANE ALTITUDE", "ft", 4);
  movementHandle.addToDataDefinition(DEFINITION_3, "PLANE HEADING DEGREES TRUE", "radian", 4);
  movementHandle.addToDataDefinition(DEFINITION_3, "PLANE PITCH DEGREES", "radian", 4);
  movementHandle.addToDataDefinition(DEFINITION_3, "PLANE BANK DEGREES", "radian", 4);
  movementHandle.addToDataDefinition(COCKPIT_ZOOM_DEFINITION, "COCKPIT CAMERA ZOOM", "percent", SimConnectDataType.FLOAT64);

  movementHandle.addToDataDefinition(
    DEFINITION_4,
    "CAMERA REQUEST ACTION",
    "number",
    1,
  ); // INT32

  log("Aircraft movement data definitions set up successfully");
}

function setAircraftPosition(data: AircraftMovementData): void {
  if (!movementHandle) {
    log("SimConnect handle is null, cannot set aircraft position");
    return;
  }
  const position = new RawBuffer(48);
  position.writeFloat64(data.latitude);
  position.writeFloat64(data.longitude);
  position.writeFloat64(data.altitude);
  position.writeFloat64((data.heading * Math.PI) / 180);
  position.writeFloat64((data.pitch * Math.PI) / 180);
  position.writeFloat64((data.bank * Math.PI) / 180);
  movementHandle.setDataOnSimObject(DEFINITION_3, SimConnectConstants.OBJECT_ID_USER, { buffer: position, arrayCount: 0, tagged: false });

  const zoom = new RawBuffer(8);
  zoom.writeFloat64(data.cockpitCameraZoom);
  movementHandle.setDataOnSimObject(COCKPIT_ZOOM_DEFINITION, SimConnectConstants.OBJECT_ID_USER, { buffer: zoom, arrayCount: 0, tagged: false });
}

function sendCockpitViewReset(resetValue: number): void {
  if (!movementHandle) {
    log("SimConnect handle is null, cannot send cockpit view reset");
    return;
  }

  const buf = new RawBuffer(4);
  buf.writeInt32(resetValue);
  movementHandle.setDataOnSimObject(
    DEFINITION_4,
    SimConnectConstants.OBJECT_ID_USER,
    {
      buffer: buf,
      arrayCount: 0,
      tagged: false,
    },
  );
  log(`Cockpit view reset sent: reset=${resetValue}`);
}

function processMovementData(): void {
  if (movementThreadQuit.value) return;

  let dataToProcess: AircraftMovementData | null = null;

  if (!movementMutex) {
    movementMutex = true;
    if (hasMovementData) {
      dataToProcess = { ...currentMovementData };
      hasMovementData = false;
    }
    movementMutex = false;
  }

  if (dataToProcess) {
    setAircraftPosition(dataToProcess);
  }

  setTimeout(processMovementData, 100);
}

function aircraftMovementServer(): void {
  Bun.serve({
    port: MOVEMENT_HTTP_PORT,
    async fetch(req) {
      const url = new URL(req.url);
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PUT, GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "86400",
      };

      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
      }

      try {
        if (
          (req.method === "POST" || req.method === "PUT") &&
          url.pathname === "/move"
        ) {
          const body = (await req.json()) as Record<string, unknown>;

          const lat = Number(body["lat"]);
          const lon = Number(body["lon"]);
          const alt = Number(body["alt"]);
          const heading = Number(body["heading"]);
          const pitch = Number(body["pitch"]);
          const bank = Number(body["bank"] ?? 0);
          const cockpitCameraZoom = Number(body["cockpit_camera_zoom"]);

          if (
            isNaN(lat) ||
            isNaN(lon) ||
            isNaN(alt) ||
            isNaN(heading) ||
            isNaN(pitch) ||
            isNaN(bank) ||
            isNaN(cockpitCameraZoom)
          ) {
            return new Response(
              JSON.stringify({
                error:
                  "Missing required fields: lat, lon, alt, heading, pitch, bank, cockpit_camera_zoom",
              }),
              {
                status: 400,
                headers: { ...headers, "Content-Type": "application/json" },
              },
            );
          }

          if (lat < -90 || lat > 90) {
            return new Response(
              JSON.stringify({
                error: "Latitude must be between -90 and 90 degrees",
              }),
              {
                status: 400,
                headers: { ...headers, "Content-Type": "application/json" },
              },
            );
          }
          if (lon < -180 || lon > 180) {
            return new Response(
              JSON.stringify({
                error: "Longitude must be between -180 and 180 degrees",
              }),
              {
                status: 400,
                headers: { ...headers, "Content-Type": "application/json" },
              },
            );
          }
          if (alt < -1000 || alt > 100000) {
            return new Response(
              JSON.stringify({
                error: "Altitude must be between -1000 and 100000 feet",
              }),
              {
                status: 400,
                headers: { ...headers, "Content-Type": "application/json" },
              },
            );
          }
          if (heading < 0 || heading > 360) {
            return new Response(
              JSON.stringify({
                error: "Heading must be between 0 and 360 degrees",
              }),
              {
                status: 400,
                headers: { ...headers, "Content-Type": "application/json" },
              },
            );
          }
          if (pitch < -90 || pitch > 90) {
            return new Response(
              JSON.stringify({
                error: "Pitch must be between -90 and 90 degrees",
              }),
              {
                status: 400,
                headers: { ...headers, "Content-Type": "application/json" },
              },
            );
          }
          if (bank < -180 || bank > 180) {
            return new Response(
              JSON.stringify({
                error: "Bank must be between -180 and 180 degrees",
              }),
              {
                status: 400,
                headers: { ...headers, "Content-Type": "application/json" },
              },
            );
          }
          if (cockpitCameraZoom < 0 || cockpitCameraZoom > 100) {
            return new Response(
              JSON.stringify({
                error: "Cockpit camera zoom must be between 0.0 and 100.0",
              }),
              {
                status: 400,
                headers: { ...headers, "Content-Type": "application/json" },
              },
            );
          }
          movementMutex = true;
          currentMovementData = {
            latitude: lat,
            longitude: lon,
            altitude: alt,
            heading,
            pitch,
            bank,
            cockpitCameraZoom,
          };
          hasMovementData = true;
          movementMutex = false;

          const response = {
            status: "success",
            message: "Aircraft movement command received",
            data: {
              lat,
              lon,
              alt,
              heading,
              pitch,
              bank,
              cockpit_camera_zoom: cockpitCameraZoom,
            },
          };
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: { ...headers, "Content-Type": "application/json" },
          });
        }

        if (req.method === "GET" && url.pathname === "/health") {
          const response = {
            status: "healthy",
            service: "aircraft_movement",
            port: MOVEMENT_HTTP_PORT,
          };
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: { ...headers, "Content-Type": "application/json" },
          });
        }

        if (req.method === "POST" && url.pathname === "/reset") {
          const body = (await req.json()) as Record<string, unknown>;
          const resetValue = Number(body["reset"]);
          if (isNaN(resetValue) || resetValue !== 1) {
            return new Response(JSON.stringify({ error: "reset must be 1" }), {
              status: 400,
              headers: { ...headers, "Content-Type": "application/json" },
            });
          }
          sendCockpitViewReset(resetValue);
          const response = {
            status: "success",
            message: "Cockpit view reset command received",
            data: { reset: resetValue },
          };
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: { ...headers, "Content-Type": "application/json" },
          });
        }

        return new Response("Not Found", { status: 404 });
      } catch (e) {
        const errorResponse = {
          error: "Invalid JSON format",
          details: e instanceof Error ? e.message : String(e),
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }
    },
  });

  log(
    `Aircraft movement server running on http://localhost:${MOVEMENT_HTTP_PORT}`,
  );
  log(`  POST /move - Set aircraft position`);
  log(`  GET /health - Health check`);
}

export function startAircraftMovementControl(quitFlag: {
  value: boolean;
}): void {
  movementThreadQuit = quitFlag;

  processMovementData();

  aircraftMovementServer();
}
