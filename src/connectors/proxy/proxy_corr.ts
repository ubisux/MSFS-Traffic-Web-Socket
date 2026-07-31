import { cleanupAircraftByTtl } from "../../aircraft_store.ts";
import {
  fsdDataRefillIntervalSec,
  proxyCorrelationIntervalSec,
} from "../../config.ts";
import { log } from "../../loggers/logger.ts";
import type { SimAircraftEntry } from "../../shared/types.ts";
import { haversine } from "../../shared/types.ts";
import * as S from "../../state.ts";
import { nextProxyId } from "../../state/proxy.ts";
import {
  getProxyPilotsData,
  hasProxyData,
  isProxyActive,
} from "./proxy_bridge.ts";

// ===== Proxy Correlation =====

export function proxyCorrLoop(): void {
  if (S.shouldExit.value) return;
  correlateProxyToSimConnect();
  refillAircraftFieldsFromProxy();
  cleanupAircraftByTtl();
  S.proxyCorrTimer.value = setTimeout(
    proxyCorrLoop,
    proxyCorrelationIntervalSec * 1000,
  );
}

export function correlateProxyToSimConnect(): void {
  if (!hasProxyData()) {
    return;
  }

  if (!isProxyActive()) {
    return;
  }

  const proxyData = getProxyPilotsData();
  if (!proxyData.pilots || proxyData.pilots.length === 0) return;

  const simIds = Array.from(S.simAircraftMap.keys());
  const now = Date.now();
  const nowSec = Math.floor(now / 1000);

  const matchedPilotCallsigns = new Set<string>();
  for (const [simId, entry] of S.simAircraftMap) {
    if (simId >= 0 && entry.callsign) matchedPilotCallsigns.add(entry.callsign);
  }

  // Phase 1: Proximity match - match uncorrelated SimConnect entries to proxy pilots
  for (const simId of simIds) {
    const simjson = S.simAircraftMap.get(simId);
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
      if (!pilot.callsign || matchedPilotCallsigns.has(pilot.callsign)) continue;
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
      matchedPilotCallsigns.add(simjson.callsign);
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

    for (const [, entry] of S.simAircraftMap) {
      if (entry.callsign === pilot.callsign) {
        existing = entry;
        break;
      }
    }

    if (existing) {
      existing.gate = pilot.gate ?? existing.gate;
      existing.scratchpad = pilot.scratchpad ?? existing.scratchpad;
      existing.transponder = pilot.transponder ?? existing.transponder;
      existing.latitude = pilot.latitude;
      existing.longitude = pilot.longitude;
      existing.altitude = pilot.altitude;
      existing.groundspeed = pilot.groundspeed;
      existing.last_proxy_update = nowSec;
    } else {
      const id = nextProxyId.value--;
      const entry: SimAircraftEntry = {
        simobjectid: id,
        callsign: pilot.callsign,
        latitude: pilot.latitude,
        longitude: pilot.longitude,
        altitude: pilot.altitude,
        groundspeed: pilot.groundspeed,
        verticalSpeed: 0,
        on_ground: 0,
        type: "",
        dep: "",
        arr: "",
        heading: 0,
        transponder: pilot.transponder ?? "",
        transponder_asgn: "",
        deptime: "",
        depRwy: "",
        depSID: "",
        gate: pilot.gate ?? "",
        scratchpad: pilot.scratchpad ?? "",
        arrRwy: "",
        arrSTAR: "",
        last_proxy_update: nowSec,
      };
      S.simAircraftMap.set(id, entry);
    }
  }

  // Phase 3: Cleanup stale proxy-only entries
  const activeProxyCallsigns = new Set(proxyData.pilots.map((p) => p.callsign));
  for (const [simId, entry] of S.simAircraftMap) {
    if (simId >= 0) continue;
    if (entry.callsign && !activeProxyCallsigns.has(entry.callsign)) {
      log(`Removing stale proxy ${simId} (${entry.callsign})`, "debug");
      S.simAircraftMap.delete(simId);
    }
  }
}

// ===== Proxy Refill =====
export function refillAircraftFieldsFromProxy(): void {
  const proxyData = getProxyPilotsData();
  if (!proxyData.pilots) return;

  const now = Date.now();

  for (const [, simjson] of S.simAircraftMap) {
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
          if (elapsed >= fsdDataRefillIntervalSec) canUpdate = true;
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
