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
import { toApiAircraftEntry, type ApiAircraftEntry } from './aircraft_api.ts';
import { createTowerStream, setTowerStream, type TowerPeerData, type TowerStream } from './tower_stream.ts';
import { dispatchTowerMove, dispatchTowerReset } from './aircraft_movement.ts';

export function towerOriginAllowed(origin: string | null, address: string | undefined): boolean {
  return (origin === 'https://vathk.com' || origin === 'http://localhost:3000') &&
    (address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1');
}


type ApiAircraftWithIfpsEntry = ApiAircraftEntry & {
  /** IFPS departure record for this aircraft's `dep` airport, or null. */
  ifps: IfpsDepAirportFlight | null;
  /** Latest accumulated ACC configuration patch for this callsign, or null. */
  config: AircraftConfig | null;
};


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
export function httpServerThread(options: {port?:number; stream?:TowerStream} = {}) {
  const stream = options.stream ?? createTowerStream({move:dispatchTowerMove,reset:dispatchTowerReset});
  setTowerStream(stream);
  const server = Bun.serve<TowerPeerData>({
    port: options.port ?? BRIDGE_HTTP_PORT,
    fetch(req, server) {
      if(new URL(req.url).pathname !== '/ws/tower') return handleHttpRequest(req);
      if(!towerOriginAllowed(req.headers.get('origin'),server.requestIP(req)?.address)) return new Response('Forbidden',{status:403});
      if(req.headers.get('upgrade')?.toLowerCase() !== 'websocket') return new Response('WebSocket required',{status:426});
      if(server.upgrade(req,{data:{blocked:false,results:[],lastCommand:0}})) return;
      return new Response('Invalid upgrade',{status:400});
    },
    websocket: {
      perMessageDeflate:false,maxPayloadLength:65536,backpressureLimit:1048576,closeOnBackpressureLimit:true,sendPings:true,
      open:peer=>stream.open(peer),close:peer=>stream.close(peer),drain:peer=>stream.drain(peer),message:(peer,bytes)=>stream.message(peer,bytes),
    },
  });
  log(`HTTP/tower WebSocket server running on localhost:${server.port}`);
  return {server,stop(){stream.stop();setTowerStream(undefined);server.stop(true);}};
}
