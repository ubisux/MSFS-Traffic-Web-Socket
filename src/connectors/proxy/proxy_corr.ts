import { cleanupAircraftByTtl } from "../../aircraft_store.ts";
import {
  fsdDataRefillIntervalSec,
  proxyCorrelationIntervalSec,
} from "../../config.ts";
import { log } from "../../loggers/logger.ts";
import type { ProxyPilot, SimAircraftEntry } from "../../shared/types.ts";
import { haversine } from "../../shared/types.ts";
import * as S from "../../state.ts";
import { nextProxyId } from "../../state/proxy.ts";
import {
  getProxyPilotsData,
  hasProxyData,
  isProxyActive,
  cleanupStaleProxyPilots,
} from "./proxy_bridge.ts";

// ===== Proxy Correlation =====

const PROXY_CORRELATION_PROMOTE_STREAK = 2;
const PROXY_CORRELATION_SWITCH_MISSES = 3;

interface ProxyMatchCandidate {
  pilot: ProxyPilot;
  simId: number;
  entry: SimAircraftEntry;
  dist2d: number;
  altDiff: number;
  score: number;
}

interface SimSnapshot {
  lat: number;
  lon: number;
  alt: number;
  gs: number;
  onGround: number;
}

export function proxyCorrLoop(): void {
  if (S.shouldExit.value) return;
  cleanupStaleProxyPilots();
  correlateProxyToSimConnect();
  refillAircraftFieldsFromProxy();
  cleanupAircraftByTtl();
  S.proxyCorrTimer.value = setTimeout(
    proxyCorrLoop,
    proxyCorrelationIntervalSec * 1000,
  );
}

function getSimSnapshot(entry: SimAircraftEntry): SimSnapshot {
  return {
    lat: entry.latitude,
    lon: entry.longitude,
    alt: entry.altitude,
    gs: entry.groundspeed,
    onGround: entry.on_ground,
  };
}

function proxyCorrelationRadius(snapshot: SimSnapshot): number {
  if (snapshot.onGround === 1 || snapshot.gs < 30) {
    const minRadiusM = 15.0 * 0.3048;
    const radius = 2.0 * snapshot.gs;
    return radius < minRadiusM ? minRadiusM : radius;
  }
  return 4.0 * snapshot.gs;
}

function evaluateProxyMatch(
  pilot: ProxyPilot,
  simId: number,
  entry: SimAircraftEntry,
): ProxyMatchCandidate | undefined {
  const snapshot = getSimSnapshot(entry);
  const dist2d = haversine(
    snapshot.lat,
    snapshot.lon,
    pilot.latitude,
    pilot.longitude,
  );
  const altDiff = Math.abs(snapshot.alt - pilot.altitude);
  const radius = proxyCorrelationRadius(snapshot);
  const altOk = snapshot.onGround === 1 || snapshot.gs < 30
    ? altDiff <= 30.0
    : altDiff <= 100.0;

  if (dist2d >= radius || !altOk) return undefined;

  return {
    pilot,
    simId,
    entry,
    dist2d,
    altDiff,
    score: dist2d + altDiff * 2.0,
  };
}

function markProxyCorrelationMiss(entry: SimAircraftEntry): void {
  entry.proxyCorrelationState = "stale";
  entry.proxyCorrelationMisses = (entry.proxyCorrelationMisses ?? 0) + 1;
  entry.proxyCorrelationStreak = 0;
}

function applyProxyPilotToSimAircraft(
  entry: SimAircraftEntry,
  pilot: ProxyPilot,
  nowSec: number,
): void {
  entry.callsign = pilot.callsign;
  entry.proxyLatitude = pilot.latitude;
  entry.proxyLongitude = pilot.longitude;
  entry.proxyAltitude = pilot.altitude;
  entry.proxyGroundspeed = pilot.groundspeed;
  entry.last_proxy_update = nowSec;
  entry.fsdLastCorrelationEpochSec = undefined;
  entry.gate = pilot.gate ?? entry.gate;
  entry.scratchpad = pilot.scratchpad ?? entry.scratchpad;
  entry.transponder = pilot.transponder ?? entry.transponder;
  if (pilot.type) entry.type = pilot.type;
  if (pilot.dep) entry.dep = pilot.dep;
  if (pilot.arr) entry.arr = pilot.arr;
  if (pilot.deptime) entry.deptime = pilot.deptime;

  if (entry.simobjectid < 0) {
    entry.latitude = pilot.latitude;
    entry.longitude = pilot.longitude;
    entry.altitude = pilot.altitude;
    entry.groundspeed = pilot.groundspeed;
  }
}

function refreshProxyCorrelation(
  entry: SimAircraftEntry,
  pilot: ProxyPilot,
  nowSec: number,
): void {
  applyProxyPilotToSimAircraft(entry, pilot, nowSec);
  entry.proxyCorrelationCandidate = pilot.callsign;
  entry.proxyCorrelationMisses = 0;
  entry.proxyCorrelationStreak = (entry.proxyCorrelationStreak ?? 0) + 1;
  entry.proxyLastCorrelationEpochSec = nowSec;
  entry.proxyCorrelationState = entry.proxyCorrelationStreak >=
      PROXY_CORRELATION_PROMOTE_STREAK
    ? "correlated"
    : "tentative";
}

function findEntryByCallsign(callsign: string): [number, SimAircraftEntry] | undefined {
  for (const [id, entry] of S.simAircraftMap) {
    if (entry.callsign === callsign) return [id, entry];
  }
  return undefined;
}

function revalidateExistingProxyCorrelations(
  pilots: ProxyPilot[],
  simIds: number[],
  assignedCallsigns: Set<string>,
  assignedSimIds: Set<number>,
  nowSec: number,
): void {
  const pilotsByCallsign = new Map(pilots.map((pilot) => [pilot.callsign, pilot]));

  for (const simId of simIds) {
    if (simId < 0) continue;

    const entry = S.simAircraftMap.get(simId);
    if (!entry?.callsign) continue;

    const pilot = pilotsByCallsign.get(entry.callsign);
    if (!pilot || pilot.lastPacketReceived === undefined) {
      markProxyCorrelationMiss(entry);
      continue;
    }

    const candidate = evaluateProxyMatch(pilot, simId, entry);
    if (!candidate) {
      markProxyCorrelationMiss(entry);
      continue;
    }

    refreshProxyCorrelation(entry, pilot, nowSec);
    assignedCallsigns.add(pilot.callsign);
    assignedSimIds.add(simId);
  }
}

function canAssignEntry(entry: SimAircraftEntry, pilot: ProxyPilot): boolean {
  if (!entry.callsign) return true;
  if (entry.callsign === pilot.callsign) return true;

  return (entry.proxyCorrelationMisses ?? 0) >= PROXY_CORRELATION_SWITCH_MISSES;
}

function handleExistingCallsignOwner(
  candidate: ProxyMatchCandidate,
  nowSec: number,
): boolean {
  const existing = findEntryByCallsign(candidate.pilot.callsign);
  if (!existing || existing[0] === candidate.simId) return true;

  const [existingId, existingEntry] = existing;
  if (existingId < 0) {
    S.simAircraftMap.delete(existingId);
    return true;
  }

  const existingSwitchable =
    (existingEntry.proxyCorrelationMisses ?? 0) >= PROXY_CORRELATION_SWITCH_MISSES ||
    existingEntry.proxyCorrelationState === "stale";
  if (!existingSwitchable) return false;

  markProxyCorrelationMiss(existingEntry);
  existingEntry.callsign = "";
  existingEntry.proxyCorrelationCandidate = undefined;
  existingEntry.proxyLastCorrelationEpochSec = nowSec;
  return true;
}

function correlateFreshProxyPacketsToNearestSimConnect(
  pilots: ProxyPilot[],
  simIds: number[],
  assignedCallsigns: Set<string>,
  assignedSimIds: Set<number>,
  nowSec: number,
): void {
  const candidates: ProxyMatchCandidate[] = [];

  for (const pilot of pilots) {
    if (!pilot.callsign || pilot.lastPacketReceived === undefined) continue;
    if (assignedCallsigns.has(pilot.callsign)) continue;

    for (const simId of simIds) {
      if (assignedSimIds.has(simId)) continue;

      const entry = S.simAircraftMap.get(simId);
      if (!entry || simId < 0 || !canAssignEntry(entry, pilot)) continue;

      const candidate = evaluateProxyMatch(pilot, simId, entry);
      if (candidate) candidates.push(candidate);
    }
  }

  candidates.sort((a, b) => a.score - b.score);

  for (const candidate of candidates) {
    const callsign = candidate.pilot.callsign;
    if (assignedCallsigns.has(callsign) || assignedSimIds.has(candidate.simId)) {
      continue;
    }
    if (!canAssignEntry(candidate.entry, candidate.pilot)) continue;
    if (!handleExistingCallsignOwner(candidate, nowSec)) continue;

    const previousCallsign = candidate.entry.callsign;
    assignedCallsigns.add(callsign);
    assignedSimIds.add(candidate.simId);

    refreshProxyCorrelation(candidate.entry, candidate.pilot, nowSec);

    log(
      previousCallsign && previousCallsign !== callsign
        ? `Proxy re-correlated ${candidate.simId}: ${previousCallsign} -> ${callsign} (dist2d=${candidate.dist2d}m, alt_diff=${candidate.altDiff}ft)`
        : `Proxy correlated ${callsign} (simobjectid ${candidate.simId}, dist2d=${candidate.dist2d}m, alt_diff=${candidate.altDiff}ft)`,
      "debug",
    );
  }
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
  const nowSec = Math.floor(Date.now() / 1000);
  const assignedCallsigns = new Set<string>();
  const assignedSimIds = new Set<number>();

  revalidateExistingProxyCorrelations(
    proxyData.pilots,
    simIds,
    assignedCallsigns,
    assignedSimIds,
    nowSec,
  );

  correlateFreshProxyPacketsToNearestSimConnect(
    proxyData.pilots,
    simIds,
    assignedCallsigns,
    assignedSimIds,
    nowSec,
  );

  // Proxy pilot sync - create entries for unmatched proxy pilots and update proxy-only ones
  for (const pilot of proxyData.pilots) {
    if (!pilot.callsign || pilot.lastPacketReceived === undefined) continue;

    const existing = findEntryByCallsign(pilot.callsign);
    if (existing) {
      if (existing[0] < 0) refreshProxyCorrelation(existing[1], pilot, nowSec);
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
        type: pilot.type ?? "",
        dep: pilot.dep ?? "",
        arr: pilot.arr ?? "",
        heading: 0,
        transponder: pilot.transponder ?? "",
        transponder_asgn: "",
        deptime: pilot.deptime ?? "",
        depRwy: "",
        depSID: "",
        gate: pilot.gate ?? "",
        scratchpad: pilot.scratchpad ?? "",
        arrRwy: "",
        arrSTAR: "",
        proxyLatitude: pilot.latitude,
        proxyLongitude: pilot.longitude,
        proxyAltitude: pilot.altitude,
        proxyGroundspeed: pilot.groundspeed,
        proxyCorrelationState: "tentative",
        proxyCorrelationCandidate: pilot.callsign,
        proxyCorrelationMisses: 0,
        proxyCorrelationStreak: 1,
        proxyLastCorrelationEpochSec: nowSec,
        last_proxy_update: nowSec,
      };
      S.simAircraftMap.set(id, entry);
    }
  }

  // Cleanup stale proxy-only entries
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
        const proxyFieldsEmpty = !simjson.gate && !simjson.transponder;
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
        if (pilot.type && !simjson.type) simjson.type = pilot.type;
        if (pilot.dep && !simjson.dep) simjson.dep = pilot.dep;
        if (pilot.arr && !simjson.arr) simjson.arr = pilot.arr;
        if (pilot.deptime && !simjson.deptime) simjson.deptime = pilot.deptime;
        break;
      }
    }
  }
}
