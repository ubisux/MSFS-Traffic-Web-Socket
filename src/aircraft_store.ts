import { RawBuffer } from "node-simconnect";
import { aircraftTtlSeconds } from "./config.ts";
import { log } from "./loggers/logger.ts";
import type { SimAircraftEntry } from "./shared/types.ts";
import { radiansToDegrees } from "./shared/types.ts";
import * as S from "./state.ts";

// ===== Build Aircraft JSON =====
export function buildAircraftJson(
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
export function printAircraftData(objectId: number, data: RawBuffer): void {
  S.lastSimconnectUpdateTime.value = Math.floor(Date.now() / 1000);
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

  let obj = S.simAircraftMap.get(objectId);
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
    S.simAircraftMap.set(objectId, obj);

    for (const [id, entry] of S.simAircraftMap) {
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
          if (entry.lastFSDDataUpdate !== undefined)
            obj.lastFSDDataUpdate = entry.lastFSDDataUpdate;
          if (entry.last_proxy_refill !== undefined)
            obj.last_proxy_refill = entry.last_proxy_refill;
          S.simAircraftMap.delete(id);
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

  if (!obj.position_history) obj.position_history = [];
  const history = obj.position_history;
  const targetTs = S.fsdDataUpdateEpochSec.value;
  const lastEntry = history.length > 0 ? history[history.length - 1]! : null;

  if (targetTs > 0) {
    if (lastEntry && lastEntry.timestamp === targetTs) {
      lastEntry.lat = latitude;
      lastEntry.lon = longitude;
      lastEntry.alt = Math.round(altitude);
      lastEntry.hdg = radiansToDegrees(heading);
      lastEntry.gs = groundVelocity;
      lastEntry.gnd = onGround;
      lastEntry.vs = verticalSpeed;
    } else {
      history.push({
        timestamp: targetTs,
        lat: latitude,
        lon: longitude,
        alt: Math.round(altitude),
        hdg: radiansToDegrees(heading),
        gs: groundVelocity,
        gnd: onGround,
        vs: verticalSpeed,
      });

      if (history.length > 100) {
        history.shift();
      }
    }
  }

  if (!obj.callsign) return;

  S.cameraJson.current.aircraft_latitude = latitude;
  S.cameraJson.current.aircraft_longitude = longitude;
  S.cameraJson.current.aircraft_altitude = Math.round(altitude);
  S.cameraJson.current.aircraft_heading = radiansToDegrees(heading);
  S.cameraJson.current.aircraft_pitch = pitch;
}

// ===== Process Camera Data =====
export function printCameraData(data: RawBuffer): void {
  const gppYaw0 = data.readFloat64();
  const gppYaw1 = data.readFloat64();
  const camState = data.readInt32();
  const camView0 = data.readInt32();
  const camView1 = data.readInt32();
  const cockpitZoom = data.readInt32();

  S.cameraJson.current = {
    gameplay_pitch_yaw_0: gppYaw0,
    gameplay_pitch_yaw_1: gppYaw1,
    camera_state: camState,
    camera_view_type_and_index_0: camView0,
    camera_view_type_and_index_1: camView1,
    cockpit_camera_zoom: cockpitZoom,
    aircraft_latitude: S.cameraJson.current.aircraft_latitude,
    aircraft_longitude: S.cameraJson.current.aircraft_longitude,
    aircraft_altitude: S.cameraJson.current.aircraft_altitude,
    aircraft_heading: S.cameraJson.current.aircraft_heading,
    aircraft_pitch: S.cameraJson.current.aircraft_pitch,
  };
}

// ===== Cleanup Stale SimObjects =====
export function cleanupStaleSimObjects(seenIds: Set<number>): void {
  const nowSec = Math.floor(Date.now() / 1000);

  for (const [id, obj] of S.simAircraftMap) {
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
      S.simAircraftMap.delete(id);
    }
  }
}

export function cleanupAircraftByTtl(): void {
  const nowSec = Math.floor(Date.now() / 1000);
  for (const [id, obj] of S.simAircraftMap) {
    let shouldRemove = false;

    if (
      obj.last_seen !== undefined &&
      nowSec - obj.last_seen > aircraftTtlSeconds
    ) {
      shouldRemove = true;
    }

    if (
      obj.last_proxy_update !== undefined &&
      nowSec - obj.last_proxy_update > aircraftTtlSeconds
    ) {
      shouldRemove = true;
    }

    if (shouldRemove) {
      log(
        `Removing stale aircraft ${id} (${obj.callsign || ""}) (TTL expired)`,
        "debug",
      );
      S.simAircraftMap.delete(id);
    }
  }
}

function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371000.0 * c;
}
