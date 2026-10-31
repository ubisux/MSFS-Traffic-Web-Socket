import { log } from "./loggers/logger.ts";
import {
  TrackAudioError,
  setTrackAudioStations,
} from "./connectors/trackaudio/trackaudio_client.ts";
import { transceiversByCallsign } from "./connectors/fsd-data/transceivers_match.ts";
import { findIfpsDeparture } from "./connectors/ifps/dep_airport.ts";
import type {
  IfpsDepAirportFlight,
  SimAircraftEntry,
  VatsimTransceiver,
} from "./shared/types.ts";
import type { AircraftConfig } from "./shared/types.ts";
import { BRIDGE_HTTP_PORT } from "./shared/types.ts";
import * as S from "./state.ts";

type ApiAircraftEntry = Omit<SimAircraftEntry, "position_history" | "lastFSDDataUpdate" | "fsdCorrelationMisses" | "fsdCorrelationCandidate" | "fsdLastCorrelationEpochSec" | "fsdLatitude" | "fsdLongitude" | "fsdAltitude" | "fsdHeading" | "fsdGroundspeed" | "proxyLatitude" | "proxyLongitude" | "proxyAltitude" | "proxyGroundspeed" | "proxyCorrelationState" | "proxyCorrelationCandidate" | "proxyCorrelationMisses" | "proxyCorrelationStreak" | "proxyLastCorrelationEpochSec"> & {
  transceivers: VatsimTransceiver[];
};

type ApiAircraftWithIfpsEntry = ApiAircraftEntry & {
  /** IFPS departure record for this aircraft's `dep` airport, or null. */
  ifps: IfpsDepAirportFlight | null;
  /** Latest accumulated ACC configuration patch for this callsign, or null. */
  config: AircraftConfig | null;
};

function toApiAircraftEntry(
  obj: SimAircraftEntry,
  audioClients: Map<string, VatsimTransceiver[]>,
): ApiAircraftEntry {
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

  const key = obj.callsign.trim().toUpperCase();
  return {
    ...apiEntry,
    transceivers: audioClients.get(key) ?? [],
  };
}

function toApiAircraftWithIfpsEntry(
  obj: SimAircraftEntry,
  audioClients: Map<string, VatsimTransceiver[]>,
): ApiAircraftWithIfpsEntry {
  return {
    ...toApiAircraftEntry(obj, audioClients),
    ifps: findIfpsDeparture(obj.dep, obj.callsign),
    config: S.aircraftConfigs.get(obj.callsign.trim().toUpperCase()) ?? null,
  };
}

export async function handleHttpRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS" &&
    (url.pathname === "/aircraft" || url.pathname === "/aircrafts" ||
      url.pathname === "/stations")) {
    return new Response(null, { status: 204, headers });
  }

  if (req.method === "GET" && url.pathname === "/stations") {
    const rawStations = url.searchParams.get("stations");
    const stations = rawStations
      ?.split(",")
      .map((station) => station.trim().toUpperCase())
      .filter(Boolean);
    const uniqueStations = stations ? [...new Set(stations)] : [];

    if (!rawStations || uniqueStations.length === 0 ||
      uniqueStations.some((station) => !/^[A-Z0-9_]+$/.test(station))) {
      return new Response(JSON.stringify({
        error: "stations must be a comma-separated list of station callsigns",
      }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    try {
      await setTrackAudioStations(uniqueStations);
      return new Response(JSON.stringify({
        status: "ok",
        stations: uniqueStations,
      }), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    } catch (err) {
      const status = err instanceof TrackAudioError && err.kind === "timeout"
        ? 504
        : err instanceof TrackAudioError && err.kind === "unavailable"
          ? 503
          : 502;
      return new Response(JSON.stringify({
        error: err instanceof TrackAudioError ? err.message : "TrackAudio request failed",
      }), {
        status,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
  }

  if (
    req.method === "GET" &&
    (url.pathname === "/aircraft" || url.pathname === "/aircrafts")
  ) {
    const audioClients = transceiversByCallsign(S.transceiversData.value);
    const withIfps = url.pathname === "/aircrafts";
    const arr: (ApiAircraftEntry | ApiAircraftWithIfpsEntry)[] = [];
    for (const [, obj] of S.simAircraftMap) {
      if (!obj.callsign) continue;
      arr.push(
        withIfps
          ? toApiAircraftWithIfpsEntry(obj, audioClients)
          : toApiAircraftEntry(obj, audioClients),
      );
    }
    const response = { aircraft: arr, camera: S.cameraJson.current };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  return new Response("Not Found", { status: 404 });
}

// ===== HTTP Server =====
export function httpServerThread(): void {
  try {
    Bun.serve({
      port: BRIDGE_HTTP_PORT,
      fetch: handleHttpRequest,
    });

    log(`HTTP server running on http://localhost:${BRIDGE_HTTP_PORT}/aircraft`);
  } catch (err) {
    log("HTTP server failed: " + (err instanceof Error ? err.message : err));
  }
}
