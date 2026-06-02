import {
  open,
  Protocol,
  RawBuffer,
  SimConnectConstants,
  SimConnectDataType,
  SimConnectPeriod,
  SimObjectType,
  type SimConnectConnection,
} from "node-simconnect";
import {
  setMovementSimConnectHandle,
  setupAircraftMovementDefinition,
  startAircraftMovementControl,
} from "./aircraft_movement.ts";
import { log } from "./logger.ts";
import {
  getLastProxyUpdateTime,
  getProxyPilotsData,
  hasProxyData,
  isProxyActive,
  startProxyThreads,
} from "./proxy_bridge.ts";
import type {
  CameraJson,
  SimAircraftEntry,
  VatsimResponse,
} from "./shared/types.ts";
import {
  BRIDGE_HTTP_PORT,
  DEFINITION_1,
  DEFINITION_2,
  haversine,
  radiansToDegrees,
  REQUEST_AI_AIRCRAFT,
  REQUEST_CAMERA,
} from "./shared/types.ts";
import { updateTui } from "./tui.ts";

// ===== Configuration (from env vars) =====
let simconnectFetchIntervalSec = 0.01;
let vatsimFetchIntervalSec = 15.0;
let vatsimRefillIntervalSec = 15.0;
let proxyCorrelationIntervalSec = 1.0;
let aircraftTtlSeconds = 30.0;
let reconnectDelaySec = 5.0;

function readEnvConfig(): void {
  const simEnv = Bun.env["SIMCONNECT_FETCH_INTERVAL"];
  if (simEnv) {
    const val = parseFloat(simEnv);
    if (val >= 0.1) simconnectFetchIntervalSec = val;
  }
  if (simconnectFetchIntervalSec < 0.01) simconnectFetchIntervalSec = 0.01;

  const vatsimFetchEnv = Bun.env["VATSIM_FETCH_INTERVAL"];
  if (vatsimFetchEnv) {
    const val = parseFloat(vatsimFetchEnv);
    if (val >= 4.0) vatsimFetchIntervalSec = val;
  }
  if (vatsimFetchIntervalSec < 4.0) vatsimFetchIntervalSec = 4.0;

  const vatsimRefillEnv = Bun.env["VATSIM_REFILL_INTERVAL"];
  if (vatsimRefillEnv) {
    const val = parseFloat(vatsimRefillEnv);
    if (val >= 4.0) vatsimRefillIntervalSec = val;
  }
  if (vatsimRefillIntervalSec < 4.0) vatsimRefillIntervalSec = 4.0;

  const aircraftTtlEnv = Bun.env["AIRCRAFT_TTL_SECONDS"];
  if (aircraftTtlEnv) {
    const val = parseFloat(aircraftTtlEnv);
    if (val >= 0.0) aircraftTtlSeconds = val;
  }
  if (aircraftTtlSeconds < 0.0) aircraftTtlSeconds = 0.0;

  const proxyCorrelationEnv = Bun.env["PROXY_CORRELATION_INTERVAL"];
  if (proxyCorrelationEnv) {
    const val = parseFloat(proxyCorrelationEnv);
    if (val >= 1.0) proxyCorrelationIntervalSec = val;
  }
  if (proxyCorrelationIntervalSec < 1.0) proxyCorrelationIntervalSec = 1.0;

  const reconnectEnv = Bun.env["SIMCONNECT_RECONNECT_DELAY"];
  if (reconnectEnv) {
    const val = parseFloat(reconnectEnv);
    if (val >= 1.0) reconnectDelaySec = val;
  }

  log("Configuration:");
  log(`  SimConnect fetch interval: ${simconnectFetchIntervalSec} seconds`);
  log(`  VATSIM fetch/correlate interval: ${vatsimFetchIntervalSec} seconds`);
  log(`  VATSIM refill interval: ${vatsimRefillIntervalSec} seconds`);
  log(`  Proxy correlation interval: ${proxyCorrelationIntervalSec} seconds`);
  log(`  Aircraft TTL: ${aircraftTtlSeconds} seconds`);
  log(`  Reconnect delay: ${reconnectDelaySec} seconds`);
}

// ===== Global State =====
let quit = { value: false };
let shouldExit = { value: false };
let handle: SimConnectConnection | null = null;
let simconnectConnected = false;

let vatsimData: VatsimResponse = {};
let vatsimUpdateEpochSec = 0;
let vatsimDataReceived = false;

const simAircraftMap = new Map<number, SimAircraftEntry>();
let nextProxyId = 0;

let lastSimconnectUpdateTime = 0;

let cameraJson: CameraJson = {
  gameplay_pitch_yaw_0: 0,
  gameplay_pitch_yaw_1: 0,
  camera_state: 0,
  camera_view_type_and_index_0: 0,
  camera_view_type_and_index_1: 0,
  cockpit_camera_zoom: 0,
  aircraft_latitude: 0,
  aircraft_longitude: 0,
  aircraft_altitude: 0,
  aircraft_heading: 0,
  aircraft_pitch: 0,
};

// ===== Route Parsing Helpers =====
function extractDepartureSID(route: string): string {
  if (!route) return "";
  const spacePos = route.indexOf(" ");
  if (spacePos === -1) return route;
  return route.substring(0, spacePos);
}

function extractDepartureRunway(route: string): string {
  if (!route) return "";
  const spacePos = route.indexOf(" ");
  if (spacePos === -1) {
    const slashPos = route.indexOf("/");
    if (slashPos === -1) return "";
    const afterSlash = route.substring(slashPos + 1);
    let runway = "";
    for (const c of afterSlash) {
      if (/[a-zA-Z0-9]/.test(c)) runway += c;
      else break;
    }
    return runway;
  }
  const firstWord = route.substring(0, spacePos);
  const slashPos = firstWord.indexOf("/");
  if (slashPos === -1) return "";
  const afterSlash = firstWord.substring(slashPos + 1);
  let runway = "";
  for (const c of afterSlash) {
    if (/[a-zA-Z0-9]/.test(c)) runway += c;
    else break;
  }
  return runway;
}

function extractArrivalSTAR(route: string): string {
  if (!route) return "";
  const spacePos = route.lastIndexOf(" ");
  const lastWord = spacePos === -1 ? route : route.substring(spacePos + 1);
  const slashPos = lastWord.indexOf("/");
  if (slashPos === -1) return lastWord;
  return lastWord.substring(0, slashPos);
}

function extractArrivalRunway(route: string): string {
  if (!route) return "";
  const spacePos = route.lastIndexOf(" ");
  const lastWord = spacePos === -1 ? route : route.substring(spacePos + 1);
  const slashPos = lastWord.indexOf("/");
  if (slashPos === -1) return "";
  const afterSlash = lastWord.substring(slashPos + 1);
  let runway = "";
  for (const c of afterSlash) {
    if (/[a-zA-Z0-9]/.test(c)) runway += c;
    else break;
  }
  return runway;
}

function parseIso8601ToEpochSec(iso8601: string): number {
  const ms = Date.parse(iso8601);
  if (isNaN(ms)) return 0;
  return Math.floor(ms / 1000);
}

// ===== Build Aircraft JSON =====
function buildAircraftJson(
  simobjectid: number,
  callsign: string,
  latitude: number,
  longitude: number,
  altitude: number,
  groundspeed: number,
  verticalSpeed: number,
  onGround: number,
  type: string,
  dep: string,
  arr: string,
  heading: number,
  transponder: string,
  transponderAsgn: string,
  deptime: string,
  depRwy: string,
  depSID: string,
  gate: string,
  arrRwy: string,
  arrSTAR: string,
  scratchpad: string,
): SimAircraftEntry {
  return {
    simobjectid,
    callsign,
    latitude,
    longitude,
    altitude,
    groundspeed,
    verticalSpeed,
    on_ground: onGround,
    type,
    dep,
    arr,
    heading: radiansToDegrees(heading),
    transponder,
    transponder_asgn: transponderAsgn,
    deptime,
    depRwy,
    depSID,
    gate,
    scratchpad,
    arrRwy,
    arrSTAR,
  };
}

// ===== Process Aircraft Data (called from event handler) =====
function printAircraftData(objectId: number, data: RawBuffer): void {
  lastSimconnectUpdateTime = Math.floor(Date.now() / 1000);
  const altitude = data.readFloat64();
  const latitude = data.readFloat64();
  const longitude = data.readFloat64();
  const pitch = data.readFloat64();
  const heading = data.readFloat64();
  const bank = data.readFloat64();
  const onGround = data.readInt32();
  const groundVelocity = data.readInt32();
  const verticalSpeed = data.readInt32();
  const title = data.readString256();

  let obj = simAircraftMap.get(objectId);
  if (!obj) {
    obj = buildAircraftJson(
      objectId,
      "",
      latitude,
      longitude,
      Math.round(altitude),
      groundVelocity,
      verticalSpeed,
      onGround,
      "",
      "",
      "",
      heading,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    );
    simAircraftMap.set(objectId, obj);

    for (const [id, entry] of simAircraftMap) {
      if (id < 0 && entry.callsign) {
        const dist = haversine(
          latitude,
          longitude,
          entry.latitude,
          entry.longitude,
        );
        if (dist < 500) {
          obj.callsign = entry.callsign;
          obj.gate = entry.gate;
          obj.scratchpad = entry.scratchpad;
          obj.transponder = entry.transponder;
          obj.type = entry.type;
          obj.dep = entry.dep;
          obj.arr = entry.arr;
          obj.transponder_asgn = entry.transponder_asgn;
          obj.deptime = entry.deptime;
          obj.depRwy = entry.depRwy;
          obj.depSID = entry.depSID;
          obj.arrRwy = entry.arrRwy;
          obj.arrSTAR = entry.arrSTAR;
          if (entry.last_proxy_update !== undefined)
            obj.last_proxy_update = entry.last_proxy_update;
          if (entry.last_vatsim_update !== undefined)
            obj.last_vatsim_update = entry.last_vatsim_update;
          if (entry.last_proxy_refill !== undefined)
            obj.last_proxy_refill = entry.last_proxy_refill;
          simAircraftMap.delete(id);
          log(
            `Merged proxy ${entry.callsign} (id ${id}) into SimConnect ${objectId}`,
          );
          break;
        }
      }
    }
  }

  obj.simobjectid = objectId;
  obj.latitude = latitude;
  obj.longitude = longitude;
  obj.altitude = Math.round(altitude);
  obj.groundspeed = groundVelocity;
  obj.verticalSpeed = verticalSpeed;
  obj.on_ground = onGround;
  obj.heading = radiansToDegrees(heading);

  const nowSec = Math.floor(Date.now() / 1000);
  obj.last_seen = nowSec;

  if (!obj.callsign) obj.callsign = "";
  if (!obj.type) obj.type = "";
  if (!obj.dep) obj.dep = "";
  if (!obj.arr) obj.arr = "";
  if (!obj.transponder) obj.transponder = "";
  if (!obj.transponder_asgn) obj.transponder_asgn = "";
  if (!obj.deptime) obj.deptime = "";
  if (!obj.depRwy) obj.depRwy = "";
  if (!obj.depSID) obj.depSID = "";
  if (!obj.gate) obj.gate = "";
  if (!obj.scratchpad) obj.scratchpad = "";
  if (!obj.arrRwy) obj.arrRwy = "";
  if (!obj.arrSTAR) obj.arrSTAR = "";

  // Position history for uncorrelated aircraft
  if (!obj.callsign) {
    const pos = {
      timestamp: nowSec,
      lat: latitude,
      lon: longitude,
      alt: altitude,
      hdg: heading,
      gs: groundVelocity,
      gnd: onGround,
      vs: verticalSpeed,
    };
    if (!obj.position_history) obj.position_history = [];
    if (
      obj.position_history.length === 0 ||
      obj.position_history[obj.position_history.length - 1]!.timestamp !==
        nowSec
    ) {
      obj.position_history.push(pos);
    }
    while (
      obj.position_history.length > 0 &&
      nowSec - obj.position_history[0]!.timestamp > 60
    ) {
      obj.position_history.shift();
    }
  } else {
    delete obj.position_history;
  }

  // User aircraft (objectId === 1) updates camera position
  if (objectId === 1) {
    cameraJson.aircraft_latitude = latitude;
    cameraJson.aircraft_longitude = longitude;
    cameraJson.aircraft_altitude = altitude;
    cameraJson.aircraft_heading = radiansToDegrees(heading);
    cameraJson.aircraft_pitch = -1 * radiansToDegrees(pitch);
  }
}

// ===== Process Camera Data =====
function printCameraData(data: RawBuffer): void {
  const gppYaw0 = data.readFloat64();
  const gppYaw1 = data.readFloat64();
  const camState = data.readInt32();
  const camView0 = data.readInt32();
  const camView1 = data.readInt32();
  const cockpitZoom = data.readInt32();

  cameraJson = {
    gameplay_pitch_yaw_0: radiansToDegrees(gppYaw0),
    gameplay_pitch_yaw_1: radiansToDegrees(gppYaw1),
    camera_state: camState,
    camera_view_type_and_index_0: camView0,
    camera_view_type_and_index_1: camView1,
    cockpit_camera_zoom: cockpitZoom,
    aircraft_latitude: cameraJson.aircraft_latitude,
    aircraft_longitude: cameraJson.aircraft_longitude,
    aircraft_altitude: cameraJson.aircraft_altitude,
    aircraft_heading: cameraJson.aircraft_heading,
    aircraft_pitch: cameraJson.aircraft_pitch,
  };
}

// ===== VATSIM Correlation =====
function correlateVatsimToSimConnect(): void {
  if (isProxyActive()) return;

  const simIds = Array.from(simAircraftMap.keys());
  const now = Date.now();

  if (!vatsimData.pilots) return;
  const targetTs = vatsimUpdateEpochSec;

  for (const simId of simIds) {
    const simjson = simAircraftMap.get(simId);
    if (!simjson) continue;

    if (
      !simjson.callsign &&
      simjson.position_history &&
      simjson.position_history.length > 0
    ) {
      const history = simjson.position_history;

      // Find exact timestamp match in history
      const exactEntry = history.find((e) => e.timestamp === targetTs);
      if (!exactEntry) continue;

      const slat = exactEntry.lat;
      const slon = exactEntry.lon;
      const salt = exactEntry.alt;
      const shdg = exactEntry.hdg;
      const sgs = exactEntry.gs;
      const onGround = exactEntry.gnd;
      const svs = exactEntry.vs;

      let radius = 500.0;
      if (onGround === 1 || sgs < 30) {
        const minRadiusM = 15.0 * 0.3048;
        radius = 2.0 * sgs;
        if (radius < minRadiusM) radius = minRadiusM;
      } else {
        radius = 4.0 * sgs;
      }

      let bestPilotIdx = -1;
      let bestDist = 1e9;

      for (let i = 0; i < (vatsimData.pilots ?? []).length; i++) {
        const pilot = vatsimData.pilots[i]!;
        if (
          pilot.latitude === undefined ||
          pilot.longitude === undefined ||
          pilot.altitude === undefined ||
          pilot.heading === undefined
        )
          continue;
        const vlat = pilot.latitude;
        const vlon = pilot.longitude;
        const valt = pilot.altitude;
        const vhdg = typeof pilot.heading === "number" ? pilot.heading : 0;
        const dist2d = haversine(slat, slon, vlat, vlon);
        const altDiff = Math.abs(salt - valt);

        let altOk = false;
        if (onGround === 1 || sgs < 30) {
          altOk = altDiff <= 30.0;
        } else {
          const altLimit = svs !== 0 ? (4.0 * Math.abs(svs)) / 60.0 : 100.0;
          altOk = altDiff <= altLimit;
        }

        if (dist2d < radius && dist2d < bestDist && altOk) {
          bestDist = dist2d;
          bestPilotIdx = i;
        }
      }

      if (bestPilotIdx !== -1) {
        const pilot = vatsimData.pilots![bestPilotIdx]!;
        const vatsimFieldsEmpty = !simjson.callsign;
        const lastUpdate = simjson.last_vatsim_update;
        let canUpdate = vatsimFieldsEmpty;
        if (!canUpdate && lastUpdate !== undefined) {
          const elapsed = Math.floor(now / 1000) - lastUpdate;
          if (elapsed >= vatsimRefillIntervalSec) canUpdate = true;
        }
        if (canUpdate) {
          simjson.callsign = pilot.callsign ?? "";
          if (
            pilot.aircraft_short &&
            typeof pilot.aircraft_short === "string"
          ) {
            simjson.type = pilot.aircraft_short;
          } else if (
            pilot.flight_plan?.aircraft_short &&
            typeof pilot.flight_plan.aircraft_short === "string"
          ) {
            simjson.type = pilot.flight_plan.aircraft_short;
          } else {
            simjson.type = "";
          }
          if (pilot.flight_plan) {
            const fp = pilot.flight_plan;
            simjson.dep = typeof fp.departure === "string" ? fp.departure : "";
            simjson.arr = typeof fp.arrival === "string" ? fp.arrival : "";
            simjson.deptime = typeof fp.deptime === "string" ? fp.deptime : "";
            simjson.transponder_asgn =
              typeof fp.assigned_transponder === "string"
                ? fp.assigned_transponder
                : "";
            const route = typeof fp.route === "string" ? fp.route : "";
            simjson.depRwy = extractDepartureRunway(route);
            simjson.depSID = extractDepartureSID(route);
            simjson.arrRwy = extractArrivalRunway(route);
            simjson.arrSTAR = extractArrivalSTAR(route);
          } else {
            simjson.dep = "";
            simjson.arr = "";
            simjson.deptime = "";
            simjson.transponder_asgn = "";
            simjson.depRwy = "";
            simjson.depSID = "";
            simjson.arrRwy = "";
            simjson.arrSTAR = "";
          }
          simjson.transponder = pilot.transponder ?? "";
          simjson.last_vatsim_update = Math.floor(now / 1000);
          log(`Correlated: ${JSON.stringify(simjson)}`);
        }
      } else {
        let closestDist = 1e9;
        let closestPilotIdx = -1;
        let closestAltDiff = 0;
        let closestHdgDiff = 0;

        for (let i = 0; i < (vatsimData.pilots ?? []).length; i++) {
          const pilot = vatsimData.pilots[i]!;
          if (
            pilot.latitude === undefined ||
            pilot.longitude === undefined ||
            pilot.altitude === undefined ||
            pilot.heading === undefined
          )
            continue;
          const vlat = pilot.latitude;
          const vlon = pilot.longitude;
          const valt = pilot.altitude;
          const vhdg = typeof pilot.heading === "number" ? pilot.heading : 0;
          const dist2d = haversine(slat, slon, vlat, vlon);
          const altDiff = Math.abs(salt - valt);
          const hdgDiff = Math.abs(
            ((((shdg - vhdg + 180) % 360) + 360) % 360) - 180,
          );
          if (dist2d < closestDist) {
            closestDist = dist2d;
            closestPilotIdx = i;
            closestAltDiff = altDiff;
            closestHdgDiff = hdgDiff;
          }
        }

        let closestCallsign = "";
        if (closestPilotIdx !== -1) {
          closestCallsign = vatsimData.pilots![closestPilotIdx]?.callsign ?? "";
        }
        log(`Not Correlated: ${JSON.stringify(simjson)}`);
        log(
          `  Closest VATSIM: callsign=${closestCallsign}, dist2d=${closestDist}m, alt_diff=${closestAltDiff}ft, hdg_diff=${closestHdgDiff} deg`,
        );
      }
    }
  }
}

// ===== Proxy Correlation =====
function correlateProxyToSimConnect(): void {
  if (!hasProxyData()) {
    return;
  }

  if (!isProxyActive()) {
    return;
  }

  const proxyData = getProxyPilotsData();
  if (!proxyData.pilots || proxyData.pilots.length === 0) return;

  const simIds = Array.from(simAircraftMap.keys());
  const now = Date.now();
  const nowSec = Math.floor(now / 1000);

  // Phase 1: Proximity match - match uncorrelated SimConnect entries to proxy pilots
  for (const simId of simIds) {
    const simjson = simAircraftMap.get(simId);
    if (!simjson) continue;
    if (simjson.callsign) continue;

    let slat: number, slon: number, salt: number;
    let sgs: number, onGround: number;

    if (simjson.position_history && simjson.position_history.length > 0) {
      const latest =
        simjson.position_history[simjson.position_history.length - 1]!;
      slat = latest.lat;
      slon = latest.lon;
      salt = latest.alt;
      sgs = latest.gs;
      onGround = latest.gnd;
    } else {
      slat = simjson.latitude;
      slon = simjson.longitude;
      salt = simjson.altitude;
      sgs = simjson.groundspeed;
      onGround = simjson.on_ground;
    }

    let radius = 500.0;
    if (onGround === 1 || sgs < 30) {
      const minRadiusM = 15.0 * 0.3048;
      radius = 2.0 * sgs;
      if (radius < minRadiusM) radius = minRadiusM;
    } else {
      radius = 4.0 * sgs;
    }

    let bestPilotIdx = -1;
    let bestDist = 1e9;

    for (let i = 0; i < proxyData.pilots.length; i++) {
      const pilot = proxyData.pilots[i]!;
      if (
        pilot.latitude === undefined ||
        pilot.longitude === undefined ||
        pilot.altitude === undefined
      )
        continue;

      const plat = pilot.latitude;
      const plon = pilot.longitude;
      const palt = pilot.altitude;

      const dist2d = haversine(slat, slon, plat, plon);
      const altDiff = Math.abs(salt - palt);

      let altOk = false;
      if (onGround === 1 || sgs < 30) {
        altOk = altDiff <= 30.0;
      } else {
        altOk = altDiff <= 100.0;
      }

      if (dist2d < radius && dist2d < bestDist && altOk) {
        bestDist = dist2d;
        bestPilotIdx = i;
      }
    }

    if (bestPilotIdx !== -1) {
      const pilot = proxyData.pilots[bestPilotIdx]!;
      simjson.callsign = pilot.callsign ?? "";
      simjson.last_proxy_update = nowSec;
      if (simjson.position_history) delete simjson.position_history;
      log(
        `Proxy Correlated ${simjson.callsign} (simobjectid ${simjson.simobjectid})`,
        "debug",
      );
    }
  }

  // Phase 2: Proxy pilot sync - create entries for unmatched proxy pilots and update existing ones
  for (const pilot of proxyData.pilots) {
    if (!pilot.callsign) continue;

    let existing: SimAircraftEntry | undefined;
    for (const [, entry] of simAircraftMap) {
      if (entry.callsign === pilot.callsign) {
        existing = entry;
        break;
      }
    }

    if (existing) {
      existing.gate = pilot.gate ?? existing.gate;
      existing.scratchpad = pilot.scratchpad ?? existing.scratchpad;
      existing.transponder = pilot.transponder ?? existing.transponder;
      existing.last_proxy_update = nowSec;
      existing.last_seen = nowSec;

      if (existing.simobjectid < 0) {
        existing.latitude = pilot.latitude;
        existing.longitude = pilot.longitude;
        existing.altitude = pilot.altitude;
        existing.groundspeed = pilot.groundspeed;
      }
    } else {
      if (pilot.latitude === 0 && pilot.longitude === 0) continue;

      let nearUncorrelated = false;
      for (const [simId, entry] of simAircraftMap) {
        if (simId > 0 && !entry.callsign) {
          let eLat = entry.latitude;
          let eLon = entry.longitude;
          if (entry.position_history && entry.position_history.length > 0) {
            const latest =
              entry.position_history[entry.position_history.length - 1]!;
            eLat = latest.lat;
            eLon = latest.lon;
          }
          const dist = haversine(pilot.latitude, pilot.longitude, eLat, eLon);
          if (dist < 2000) {
            nearUncorrelated = true;
            break;
          }
        }
      }
      if (nearUncorrelated) continue;

      nextProxyId--;
      const id = nextProxyId;
      const entry = buildAircraftJson(
        id,
        pilot.callsign,
        pilot.latitude,
        pilot.longitude,
        pilot.altitude,
        pilot.groundspeed,
        0,
        0,
        "",
        "",
        "",
        0,
        pilot.transponder,
        "",
        "",
        "",
        pilot.gate ?? "",
        "",
        "",
        "",
        pilot.scratchpad ?? "",
      );
      entry.last_seen = nowSec;
      entry.last_proxy_update = nowSec;
      simAircraftMap.set(id, entry);
    }
  }

  // Phase 3: Clean up duplicate proxy entries where SimConnect now has the aircraft
  const positiveCallsigns = new Set<string>();
  for (const [, entry] of simAircraftMap) {
    if (entry.simobjectid > 0 && entry.callsign) {
      positiveCallsigns.add(entry.callsign);
    }
  }

  const toDelete: number[] = [];
  for (const [id, entry] of simAircraftMap) {
    if (id < 0 && entry.callsign && positiveCallsigns.has(entry.callsign)) {
      toDelete.push(id);
    }
  }

  for (const id of toDelete) {
    simAircraftMap.delete(id);
  }
}

// ===== VATSIM Refill =====
function refillAircraftFieldsFromVatsim(): void {
  if (!vatsimData.pilots) return;

  const now = Date.now();

  for (const [, simjson] of simAircraftMap) {
    if (!simjson.callsign) continue;

    const callsign = simjson.callsign;
    for (const pilot of vatsimData.pilots) {
      if (pilot.callsign === callsign) {
        const vatsimFieldsEmpty =
          !simjson.type &&
          !simjson.dep &&
          !simjson.arr &&
          !simjson.depRwy &&
          !simjson.depSID;
        const lastUpdate = simjson.last_vatsim_update;
        let canUpdate = vatsimFieldsEmpty;
        if (!canUpdate && lastUpdate !== undefined) {
          const elapsed = Math.floor(now / 1000) - lastUpdate;
          if (elapsed >= vatsimRefillIntervalSec) canUpdate = true;
        }
        if (canUpdate) {
          if (
            pilot.aircraft_short &&
            typeof pilot.aircraft_short === "string"
          ) {
            simjson.type = pilot.aircraft_short;
          } else if (
            pilot.flight_plan?.aircraft_short &&
            typeof pilot.flight_plan.aircraft_short === "string"
          ) {
            simjson.type = pilot.flight_plan.aircraft_short;
          }
          if (pilot.flight_plan) {
            const fp = pilot.flight_plan;
            simjson.dep = typeof fp.departure === "string" ? fp.departure : "";
            simjson.arr = typeof fp.arrival === "string" ? fp.arrival : "";
            simjson.deptime = typeof fp.deptime === "string" ? fp.deptime : "";
            simjson.transponder_asgn =
              typeof fp.assigned_transponder === "string"
                ? fp.assigned_transponder
                : "";
            const route = typeof fp.route === "string" ? fp.route : "";
            simjson.depRwy = extractDepartureRunway(route);
            simjson.depSID = extractDepartureSID(route);
            simjson.arrRwy = extractArrivalRunway(route);
            simjson.arrSTAR = extractArrivalSTAR(route);
          }
          simjson.last_vatsim_update = Math.floor(now / 1000);
        }
        break;
      }
    }
  }
}

// ===== Proxy Refill =====
function refillAircraftFieldsFromProxy(): void {
  const proxyData = getProxyPilotsData();
  if (!proxyData.pilots) return;

  const now = Date.now();

  for (const [, simjson] of simAircraftMap) {
    if (!simjson.callsign) continue;

    const callsign = simjson.callsign;
    for (const pilot of proxyData.pilots) {
      if (pilot.callsign === callsign) {
        const proxyFieldsEmpty =
          (!simjson.gate || !simjson.gate) &&
          (!simjson.transponder || !simjson.transponder);
        const lastRefill = simjson.last_proxy_refill;
        let canUpdate = proxyFieldsEmpty;
        if (!canUpdate && lastRefill !== undefined) {
          const elapsed = Math.floor(now / 1000) - lastRefill;
          if (elapsed >= vatsimRefillIntervalSec) canUpdate = true;
        }
        if (canUpdate) {
          simjson.gate = pilot.gate ?? "";
          simjson.scratchpad = pilot.scratchpad ?? simjson.scratchpad;
          simjson.transponder = pilot.transponder ?? "";
          simjson.last_proxy_refill = Math.floor(now / 1000);
        }
        break;
      }
    }
  }
}

// ===== Fetch VATSIM Data =====
async function fetchVatsimData(): Promise<void> {
  try {
    const response = await fetch("https://data.vatsim.net/v3/vatsim-data.json");
    if (!response.ok) return;

    const text = await response.text();
    if (text.length > 0 && text[0] === "{") {
      const parsed = JSON.parse(text) as VatsimResponse;
      vatsimData = parsed;
      if (parsed.general?.update_timestamp) {
        vatsimUpdateEpochSec = parseIso8601ToEpochSec(
          parsed.general.update_timestamp,
        );
      }
      if (parsed.pilots) vatsimDataReceived = true;
      correlateVatsimToSimConnect();
    }
  } catch (e) {
    log("VATSIM fetch error: " + e);
  }
}

// ===== Cleanup Stale SimObjects =====
function cleanupStaleSimObjects(seenIds: Set<number>): void {
  const nowSec = Math.floor(Date.now() / 1000);

  for (const [id, obj] of simAircraftMap) {
    let shouldRemove = false;

    if (!seenIds.has(id)) {
      if (obj.last_seen !== undefined) {
        if (nowSec - obj.last_seen > aircraftTtlSeconds) {
          shouldRemove = true;
        }
      } else {
        shouldRemove = true;
      }
    }

    if (shouldRemove) {
      log(`Removing stale aircraft ${id} (TTL expired)`);
      simAircraftMap.delete(id);
    }
  }
}

function cleanupAircraftByTtl(): void {
  const nowSec = Math.floor(Date.now() / 1000);
  for (const [id, obj] of simAircraftMap) {
    if (
      obj.last_seen !== undefined &&
      nowSec - obj.last_seen > aircraftTtlSeconds
    ) {
      log(
        `Removing stale aircraft ${id} (${obj.callsign || ""}) (TTL expired)`,
      );
      simAircraftMap.delete(id);
    }
  }
}

// ===== HTTP Server =====
function httpServerThread(): void {
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
          const arr: SimAircraftEntry[] = [];
          for (const [, obj] of simAircraftMap) {
            if (obj.callsign) {
              arr.push(obj);
            }
          }
          const response = { aircraft: arr, camera: cameraJson };
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

// ===== SimConnect Setup =====
function setupDataDefinitions(): void {
  if (!handle) return;
  const sc = SimConnectDataType;
  handle.addToDataDefinition(DEFINITION_1, "PLANE ALTITUDE", "ft", sc.FLOAT64);
  handle.addToDataDefinition(
    DEFINITION_1,
    "PLANE LATITUDE",
    "degrees",
    sc.FLOAT64,
  );
  handle.addToDataDefinition(
    DEFINITION_1,
    "PLANE LONGITUDE",
    "degrees",
    sc.FLOAT64,
  );
  handle.addToDataDefinition(
    DEFINITION_1,
    "PLANE PITCH DEGREES",
    "radian",
    sc.FLOAT64,
  );
  handle.addToDataDefinition(
    DEFINITION_1,
    "PLANE HEADING DEGREES TRUE",
    "radian",
    sc.FLOAT64,
  );
  handle.addToDataDefinition(
    DEFINITION_1,
    "PLANE BANK DEGREES",
    "radian",
    sc.FLOAT64,
  );
  handle.addToDataDefinition(DEFINITION_1, "SIM ON GROUND", "number", sc.INT32);
  handle.addToDataDefinition(
    DEFINITION_1,
    "GROUND VELOCITY",
    "knots",
    sc.INT32,
  );
  handle.addToDataDefinition(
    DEFINITION_1,
    "VERTICAL SPEED",
    "ft/min",
    sc.INT32,
  );
  handle.addToDataDefinition(DEFINITION_1, "TITLE", "", sc.STRING256);

  handle.addToDataDefinition(
    DEFINITION_2,
    "CAMERA GAMEPLAY PITCH YAW:0",
    "radians",
    sc.FLOAT64,
  );
  handle.addToDataDefinition(
    DEFINITION_2,
    "CAMERA GAMEPLAY PITCH YAW:1",
    "radians",
    sc.FLOAT64,
  );
  handle.addToDataDefinition(DEFINITION_2, "CAMERA STATE", "", sc.INT32);
  handle.addToDataDefinition(
    DEFINITION_2,
    "CAMERA VIEW TYPE AND INDEX:0",
    "",
    sc.INT32,
  );
  handle.addToDataDefinition(
    DEFINITION_2,
    "CAMERA VIEW TYPE AND INDEX:1",
    "",
    sc.INT32,
  );
  handle.addToDataDefinition(
    DEFINITION_2,
    "COCKPIT CAMERA ZOOM",
    "Percentage",
    sc.INT32,
  );

  setupAircraftMovementDefinition();
}

let pollTimer: Timer | undefined;
let seenIds = new Set<number>();

function startPollLoop(): void {
  if (!handle || quit.value) return;

  handle.requestDataOnSimObjectType(
    REQUEST_AI_AIRCRAFT,
    DEFINITION_1,
    50000,
    SimObjectType.AIRCRAFT,
  );
  handle.requestDataOnSimObject(
    REQUEST_CAMERA,
    DEFINITION_2,
    SimConnectConstants.OBJECT_ID_USER,
    SimConnectPeriod.ONCE,
  );

  pollTimer = setTimeout(() => {
    cleanupStaleSimObjects(seenIds);
    seenIds.clear();
    if (!quit.value) {
      startPollLoop();
    }
  }, 10);
}

function stopPollLoop(): void {
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = undefined;
  }
}

// ===== Reconnect Loop =====
async function connectAndSetup(): Promise<void> {
  while (!shouldExit.value) {
    try {
      const result = await open("MSFS SimConnect Bridge", Protocol.KittyHawk);
      handle = result.handle;
      setMovementSimConnectHandle(handle);
      simconnectConnected = true;
      log("SimConnect connected.");

      setupDataDefinitions();

      seenIds.clear();

      handle.on("simObjectDataByType", (recv) => {
        if (recv.requestID === REQUEST_AI_AIRCRAFT) {
          printAircraftData(recv.objectID, recv.data);
          seenIds.add(recv.objectID);
        }
      });

      handle.on("simObjectData", (recv) => {
        if (recv.requestID === REQUEST_CAMERA) {
          printCameraData(recv.data);
        }
      });

      handle.on("exception", (recv) => {
        log("SimConnect Exception: " + JSON.stringify(recv));
      });

      handle.on("quit", () => {
        log("SimConnect quit received.");
        simconnectConnected = false;
        quit.value = true;
      });

      startPollLoop();

      // Wait until disconnected
      while (simconnectConnected && !shouldExit.value) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Cleanup
      stopPollLoop();
      handle.close();
      handle = null;
      setMovementSimConnectHandle(null!);
      quit.value = false;

      if (shouldExit.value) break;

      log(`Reconnecting in ${reconnectDelaySec} seconds...`);
      for (let i = 0; i < reconnectDelaySec * 10 && !shouldExit.value; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (err) {
      log(
        "Failed to connect to SimConnect: " +
          (err instanceof Error ? err.message : err),
      );
      log(`Retrying in ${reconnectDelaySec} seconds...`);
      for (let i = 0; i < reconnectDelaySec * 10 && !shouldExit.value; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }
}

// ===== Background Loops =====
let vatsimTimer: Timer | undefined;
let proxyCorrTimer: Timer | undefined;

async function vatsimLoop(): Promise<void> {
  if (shouldExit.value) return;
  await fetchVatsimData();
  refillAircraftFieldsFromVatsim();
  refillAircraftFieldsFromProxy();
  vatsimTimer = setTimeout(vatsimLoop, vatsimFetchIntervalSec * 1000);
}

function proxyCorrLoop(): void {
  if (shouldExit.value) return;
  correlateProxyToSimConnect();
  cleanupAircraftByTtl();
  proxyCorrTimer = setTimeout(
    proxyCorrLoop,
    proxyCorrelationIntervalSec * 1000,
  );
}

// ===== TUI state =====
let tuiTimer: Timer | undefined;

let _tuiLogKey = 0;
let _tuiPacketLogKey = 0;

function updateTuiState(): void {
  _tuiLogKey++;
  _tuiPacketLogKey++;
  const now = Math.floor(Date.now() / 1000);
  updateTui({
    connected: simconnectConnected,
    aircraftCount: simAircraftMap.size,
    aircraftCorrelated: simAircraftMap.size,
    proxyActive: isProxyActive(),
    proxyCount: getProxyPilotsData().pilots.length,
    proxyUpdateAgo: now - getLastProxyUpdateTime(),
    simconnectUpdateAgo: now - lastSimconnectUpdateTime,
    vatsimUpdateAgo: vatsimDataReceived ? now - vatsimUpdateEpochSec : 0,
    vatsimDataReceived: vatsimDataReceived,
    logKey: _tuiLogKey,
    packetLogKey: _tuiPacketLogKey,
  });
}

// ===== Main =====
export function startBridge(): void {
  readEnvConfig();

  // Start long-lived background services (independent of SimConnect)
  httpServerThread();
  startProxyThreads(quit);
  startAircraftMovementControl(quit);
  vatsimTimer = setTimeout(vatsimLoop, 0);
  proxyCorrTimer = setTimeout(proxyCorrLoop, 0);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    log("Shutting down...");
    shouldExit.value = true;
    stopPollLoop();
    if (vatsimTimer) clearTimeout(vatsimTimer);
    if (proxyCorrTimer) clearTimeout(proxyCorrTimer);
    if (tuiTimer) clearTimeout(tuiTimer);
    handle?.close();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    shouldExit.value = true;
    stopPollLoop();
    if (tuiTimer) clearTimeout(tuiTimer);
    handle?.close();
    process.exit(0);
  });

  // Connect to SimConnect with auto-reconnect (background)
  connectAndSetup();

  // Periodic TUI state refresh
  updateTuiState();
  tuiTimer = setInterval(updateTuiState, 1000);
}

// ===== Exported data for TUI =====
export interface CorrelatedAircraftInfo {
  callsign: string;
  type: string;
  dep: string;
  arr: string;
  distNm: number;
  heading: number;
  groundspeed: number;
  altitude: number;
  onGround: boolean;
  scratchpad: string;
}

export function getCorrelatedAircraftData(): CorrelatedAircraftInfo[] {
  const userLat = cameraJson.aircraft_latitude;
  const userLon = cameraJson.aircraft_longitude;
  const userAlt = cameraJson.aircraft_altitude;
  if (userLat === 0 && userLon === 0) return [];

  const result: CorrelatedAircraftInfo[] = [];
  for (const [, entry] of simAircraftMap) {
    if (!entry.callsign) continue;

    const distM = haversine(userLat, userLon, entry.latitude, entry.longitude);
    const distNm = distM / 1852;

    result.push({
      callsign: entry.callsign,
      type: entry.type || "?",
      dep: entry.dep || "?",
      arr: entry.arr || "?",
      distNm: Math.round(distNm * 10) / 10,
      heading: Math.round(entry.heading),
      groundspeed: entry.groundspeed,
      altitude: entry.altitude,
      onGround: entry.on_ground === 1,
      scratchpad: entry.scratchpad,
    });
  }

  result.sort((a, b) => a.distNm - b.distNm);
  return result;
}
