import { cleanupAircraftByTtl } from "../../aircraft_store.ts";
import {
  fsdDataRefillIntervalSec,
  proxyCorrelationIntervalSec,
} from "../../config.ts";
import { log } from "../../loggers/logger.ts";
import type { ProxyPilot, SimAircraftEntry } from "../../shared/types.ts";
import * as S from "../../state.ts";
import { nextProxyId } from "../../state/proxy.ts";
import {
  getProxyPilotsData,
  hasProxyData,
  isProxyActive,
  cleanupStaleProxyPilots,
} from "./proxy_bridge.ts";
import { evaluateProxyMatch } from "./proxy_match.ts";

// ===== Proxy Correlation =====

// SimConnect is the position authority and its ATC ID (aircraft callsign) is the
// identity signal; the positional gate in ./proxy_match.ts is only the fallback.
/**
 * Positional bindings stay tentative for this many consecutive ticks. A callsign
 * identity binding is exact and is promoted immediately.
 */
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

function evaluateCandidate(
  pilot: ProxyPilot,
  simId: number,
  entry: SimAircraftEntry,
  nowMs: number,
): ProxyMatchCandidate | undefined {
  const match = evaluateProxyMatch(pilot, entry, nowMs);
  if (!match) return undefined;
  return { pilot, simId, entry, ...match };
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

/** Applies proxy data while retaining why the binding was accepted. */
function refreshProxyCorrelation(
  entry: SimAircraftEntry,
  pilot: ProxyPilot,
  nowSec: number,
  basis: "callsign" | "position" | "proxy-only",
): void {
  applyProxyPilotToSimAircraft(entry, pilot, nowSec);
  entry.proxyCorrelationCandidate = pilot.callsign;
  entry.proxyCorrelationBasis = basis;
  entry.proxyCorrelationMisses = 0;
  entry.proxyCorrelationStreak = (entry.proxyCorrelationStreak ?? 0) + 1;
  entry.proxyLastCorrelationEpochSec = nowSec;
  entry.proxyCorrelationState = basis === "position" &&
      entry.proxyCorrelationStreak < PROXY_CORRELATION_PROMOTE_STREAK
    ? "tentative"
    : "correlated";
}

/**
 * Entry bound to a callsign, preferring a real SimConnect object over a stub so a
 * stub is never mistaken for the aircraft once the object has been identified.
 */
function findEntryByCallsign(callsign: string): [number, SimAircraftEntry] | undefined {
  let stub: [number, SimAircraftEntry] | undefined;
  for (const [id, entry] of S.simAircraftMap) {
    if (entry.callsign !== callsign) continue;
    if (id >= 0) return [id, entry];
    stub ??= [id, entry];
  }
  return stub;
}

/**
 * The callsign SimConnect itself reports for this object, normalised. Empty for
 * default (non-multiplayer) AI traffic.
 */
function atcIdCallsign(entry: SimAircraftEntry): string {
  return (entry.atcId ?? "").trim().toUpperCase();
}

function revalidateExistingProxyCorrelations(
  pilots: ProxyPilot[],
  simIds: number[],
  assignedCallsigns: Set<string>,
  assignedSimIds: Set<number>,
  nowSec: number,
  nowMs: number,
): void {
  const pilotsByCallsign = new Map(
    pilots.map((pilot) => [pilot.callsign.toUpperCase(), pilot]),
  );

  for (const simId of simIds) {
    if (simId < 0) continue;

    const entry = S.simAircraftMap.get(simId);
    if (!entry) continue;

    const atc = atcIdCallsign(entry);
    // `ATC ID` is authoritative: it is the callsign the aircraft itself is squawking
    // as, so a positional guess must never be allowed to override it.
    const identityCallsign = atc || entry.callsign.toUpperCase();
    if (!identityCallsign) continue;

    const pilot = pilotsByCallsign.get(identityCallsign);
    if (!pilot || pilot.lastPacketReceived === undefined) {
      if (entry.callsign) markProxyCorrelationMiss(entry);
      continue;
    }

    if (atc) {
      refreshProxyCorrelation(entry, pilot, nowSec, "callsign");
      assignedCallsigns.add(pilot.callsign);
      assignedSimIds.add(simId);
      continue;
    }

    if (!entry.callsign) continue;

    const candidate = evaluateCandidate(pilot, simId, entry, nowMs);
    if (!candidate) {
      markProxyCorrelationMiss(entry);
      continue;
    }

    refreshProxyCorrelation(entry, pilot, nowSec, "position");
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
  // A stub that already sits on the proxy fix is the better owner than a distant
  // SimConnect object; drop it and let the positional pass decide.
  if (existingId < 0) {
    S.simAircraftMap.delete(existingId);
    return true;
  }
  // Never take a callsign away from the object that reports it as its own ATC ID.
  if (atcIdCallsign(existingEntry)) return false;

  const existingSwitchable =
    (existingEntry.proxyCorrelationMisses ?? 0) >= PROXY_CORRELATION_SWITCH_MISSES ||
    existingEntry.proxyCorrelationState === "stale";
  if (!existingSwitchable) return false;

  markProxyCorrelationMiss(existingEntry);
  existingEntry.callsign = "";
  existingEntry.proxyCorrelationCandidate = undefined;
  existingEntry.proxyCorrelationBasis = undefined;
  existingEntry.proxyLastCorrelationEpochSec = nowSec;
  return true;
}

function correlateFreshProxyPacketsToNearestSimConnect(
  pilots: ProxyPilot[],
  simIds: number[],
  assignedCallsigns: Set<string>,
  assignedSimIds: Set<number>,
  nowSec: number,
  nowMs: number,
): void {
  const candidates: ProxyMatchCandidate[] = [];

  for (const pilot of pilots) {
    if (!pilot.callsign || pilot.lastPacketReceived === undefined) continue;
    if (assignedCallsigns.has(pilot.callsign)) continue;

    for (const simId of simIds) {
      if (assignedSimIds.has(simId)) continue;

      const entry = S.simAircraftMap.get(simId);
      if (!entry || simId < 0) continue;
      if (atcIdCallsign(entry) && atcIdCallsign(entry) !== pilot.callsign) {
        continue;
      }
      if (!canAssignEntry(entry, pilot)) continue;

      const candidate = evaluateCandidate(pilot, simId, entry, nowMs);
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

    refreshProxyCorrelation(candidate.entry, candidate.pilot, nowSec, "position");

    log(
      previousCallsign && previousCallsign !== callsign
        ? `Proxy re-correlated ${candidate.simId}: ${previousCallsign} -> ${callsign} (dist2d=${candidate.dist2d.toFixed(0)}m, alt_diff=${candidate.altDiff.toFixed(0)}ft)`
        : `Proxy correlated ${callsign} (simobjectid ${candidate.simId}, dist2d=${candidate.dist2d.toFixed(0)}m, alt_diff=${candidate.altDiff.toFixed(0)}ft)`,
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
  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  const assignedCallsigns = new Set<string>();
  const assignedSimIds = new Set<number>();

  revalidateExistingProxyCorrelations(
    proxyData.pilots,
    simIds,
    assignedCallsigns,
    assignedSimIds,
    nowSec,
    nowMs,
  );

  correlateFreshProxyPacketsToNearestSimConnect(
    proxyData.pilots,
    simIds,
    assignedCallsigns,
    assignedSimIds,
    nowSec,
    nowMs,
  );

  // Proxy pilot sync - create entries for unmatched proxy pilots and update proxy-only ones
  for (const pilot of proxyData.pilots) {
    if (!pilot.callsign || pilot.lastPacketReceived === undefined) continue;

    const existing = findEntryByCallsign(pilot.callsign);
    if (existing) {
      if (existing[0] < 0) refreshProxyCorrelation(existing[1], pilot, nowSec, "proxy-only");
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
        // A proxy-only aircraft has no attitude data at all; derive ground state from
        // the fix instead of asserting airborne, which the frontend renders as truth.
        on_ground: pilot.altitude < 100 && pilot.groundspeed < 40 ? 1 : 0,
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
        proxyCorrelationState: "correlated",
        proxyCorrelationBasis: "proxy-only",
        proxyCorrelationCandidate: pilot.callsign,
        proxyCorrelationMisses: 0,
        proxyCorrelationStreak: 1,
        proxyLastCorrelationEpochSec: nowSec,
        last_proxy_update: nowSec,
      };
      S.simAircraftMap.set(id, entry);
    }
  }

  // Cleanup: drop a stub once its callsign is gone from the proxy feed, or once a
  // real SimConnect object carries that callsign - otherwise the same aircraft is
  // rendered twice, once with authoritative data and once with stale stub data.
  const activeProxyCallsigns = new Set(proxyData.pilots.map((p) => p.callsign));
  const ownedBySimConnect = new Set<string>();
  for (const [simId, entry] of S.simAircraftMap) {
    if (simId < 0) continue;
    if (entry.callsign) ownedBySimConnect.add(entry.callsign);
    const atc = atcIdCallsign(entry);
    if (atc) ownedBySimConnect.add(atc);
  }
  for (const [simId, entry] of S.simAircraftMap) {
    if (simId >= 0 || !entry.callsign) continue;
    if (activeProxyCallsigns.has(entry.callsign) && !ownedBySimConnect.has(entry.callsign)) {
      continue;
    }
    log(`Removing stale proxy ${simId} (${entry.callsign})`, "debug");
    S.simAircraftMap.delete(simId);
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
