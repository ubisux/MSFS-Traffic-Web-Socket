import { log } from "./loggers/logger.ts";
import type { SimAircraftEntry } from "./shared/types.ts";
import { BRIDGE_HTTP_PORT } from "./shared/types.ts";
import * as S from "./state.ts";

type ApiAircraftEntry = Omit<SimAircraftEntry, "position_history" | "lastFSDDataUpdate" | "fsdCorrelationMisses" | "fsdCorrelationCandidate" | "fsdLastCorrelationEpochSec" | "fsdLatitude" | "fsdLongitude" | "fsdAltitude" | "fsdHeading" | "fsdGroundspeed" | "proxyLatitude" | "proxyLongitude" | "proxyAltitude" | "proxyGroundspeed" | "proxyCorrelationState" | "proxyCorrelationCandidate" | "proxyCorrelationMisses" | "proxyCorrelationStreak" | "proxyLastCorrelationEpochSec">;

function toApiAircraftEntry(obj: SimAircraftEntry): ApiAircraftEntry {
  const {
    position_history: _positionHistory,
    lastFSDDataUpdate: _lastFSDDataUpdate,
    fsdCorrelationMisses: _fsdCorrelationMisses,
    fsdCorrelationCandidate: _fsdCorrelationCandidate,
    fsdLastCorrelationEpochSec: _fsdLastCorrelationEpochSec,
    fsdLatitude,
    fsdLongitude,
    fsdAltitude,
    fsdHeading,
    fsdGroundspeed,
    proxyLatitude,
    proxyLongitude,
    proxyAltitude,
    proxyGroundspeed,
    proxyCorrelationState: _proxyCorrelationState,
    proxyCorrelationCandidate: _proxyCorrelationCandidate,
    proxyCorrelationMisses: _proxyCorrelationMisses,
    proxyCorrelationStreak: _proxyCorrelationStreak,
    proxyLastCorrelationEpochSec: _proxyLastCorrelationEpochSec,
    ...apiEntry
  } = obj;

  if (!Number.isFinite(apiEntry.latitude)) {
    if (typeof proxyLatitude === "number") apiEntry.latitude = proxyLatitude;
    else if (typeof fsdLatitude === "number") apiEntry.latitude = fsdLatitude;
  }
  if (!Number.isFinite(apiEntry.longitude)) {
    if (typeof proxyLongitude === "number") apiEntry.longitude = proxyLongitude;
    else if (typeof fsdLongitude === "number") apiEntry.longitude = fsdLongitude;
  }
  if (!Number.isFinite(apiEntry.altitude)) {
    if (typeof proxyAltitude === "number") apiEntry.altitude = proxyAltitude;
    else if (typeof fsdAltitude === "number") apiEntry.altitude = fsdAltitude;
  }
  if (!Number.isFinite(apiEntry.heading) && typeof fsdHeading === "number") {
    apiEntry.heading = fsdHeading;
  }
  if (!Number.isFinite(apiEntry.groundspeed)) {
    if (typeof proxyGroundspeed === "number") apiEntry.groundspeed = proxyGroundspeed;
    else if (typeof fsdGroundspeed === "number") apiEntry.groundspeed = fsdGroundspeed;
  }

  return apiEntry;
}

// ===== HTTP Server =====
export function httpServerThread(): void {
  try {
    Bun.serve({
      port: BRIDGE_HTTP_PORT,
      async fetch(req) {
        const url = new URL(req.url);
        const headers = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        };

        if (req.method === "OPTIONS" && url.pathname === "/aircraft") {
          return new Response(null, { status: 204, headers });
        }

        if (req.method === "GET" && url.pathname === "/aircraft") {
          const arr: ApiAircraftEntry[] = [];
          for (const [, obj] of S.simAircraftMap) {
            if (obj.callsign) {
              arr.push(toApiAircraftEntry(obj));
            }
          }
          const response = { aircraft: arr, camera: S.cameraJson.current };
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: { ...headers, "Content-Type": "application/json" },
          });
        }

        return new Response("Not Found", { status: 404 });
      },
    });

    log(`HTTP server running on http://localhost:${BRIDGE_HTTP_PORT}/aircraft`);
  } catch (err) {
    log("HTTP server failed: " + (err instanceof Error ? err.message : err));
  }
}
