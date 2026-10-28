import type { ProxyPilot, SimAircraftEntry, SimTrackSample } from "../../shared/types.ts";
import { haversine } from "../../shared/types.ts";

// SimConnect is the position authority: it refreshes far faster than the EuroScope
// proxy, so a proxy fix describes where the aircraft *was* one packet interval ago.
// Everything here therefore compares a proxy fix against the SimConnect position at
// the fix's own timestamp, instead of comparing a stale fix against a fresh position.

/** Hard horizon: a fix older than this cannot be projected reliably. */
export const PROXY_FIX_MAX_AGE_MS = 12_000;
/** Extra slack for track sampling and turn error, metres. */
const PROXY_MATCH_PAD_M = 60;
/** Floor for the positional radius so a parked aircraft never fails on jitter. */
const PROXY_MATCH_MIN_RADIUS_M = 150;
/** Altitude slack on top of the vertical-rate prediction, feet. */
const PROXY_MATCH_ALT_PAD_FT = 150;
/** One proxy packet interval, used to widen tolerances for sampling lag. */
const PROXY_MATCH_LAG_SEC = 2.0;

const MPS_PER_KNOT = 0.514444;

export interface SimSnapshot {
  lat: number;
  lon: number;
  alt: number;
  gs: number;
  vs: number;
  onGround: number;
  /** Distance from the requested time to the nearest retained sample. */
  ageMs: number;
}

export interface ProxyMatchResult {
  dist2d: number;
  altDiff: number;
  /** Normalised mismatch, so distance and altitude are comparable across speeds. */
  score: number;
}

/**
 * SimConnect position at an arbitrary wall-clock time, linearly interpolated between
 * the bracketing track samples. Returns undefined when the time falls outside the
 * retained track, so the caller treats the comparison as unknown rather than
 * comparing a stale fix against a fresh position.
 */
export function projectSimPosition(
  track: readonly SimTrackSample[] | undefined,
  fixTimeMs: number,
): SimSnapshot | undefined {
  if (!track || track.length === 0) return undefined;

  const first = track[0]!;
  const last = track[track.length - 1]!;
  // Outside the retained range there is nothing to interpolate: the caller must
  // treat the comparison as unknown, not reuse an endpoint as if it were "now".
  if (fixTimeMs < first.timestamp || fixTimeMs > last.timestamp) {
    return undefined;
  }

  let before = first;
  let after = last;
  for (let i = 1; i < track.length; i++) {
    if (track[i]!.timestamp >= fixTimeMs) {
      after = track[i]!;
      before = track[i - 1]!;
      break;
    }
  }

  const spanMs = after.timestamp - before.timestamp;
  if (spanMs <= 0) {
    return {
      lat: before.lat,
      lon: before.lon,
      alt: before.alt,
      gs: before.gs,
      vs: before.vs,
      onGround: before.onGround,
      ageMs: Math.abs(before.timestamp - fixTimeMs),
    };
  }

  const f = (fixTimeMs - before.timestamp) / spanMs;
  return {
    lat: before.lat + (after.lat - before.lat) * f,
    lon: before.lon + (after.lon - before.lon) * f,
    alt: before.alt + (after.alt - before.alt) * f,
    gs: before.gs + (after.gs - before.gs) * f,
    vs: before.vs + (after.vs - before.vs) * f,
    onGround: before.onGround,
    ageMs: Math.abs(fixTimeMs - (f < 0.5 ? before.timestamp : after.timestamp)),
  };
}

/**
 * Position/altitude tolerance for one comparison. The fix is already projected onto
 * the SimConnect track, so what remains is sampling and turn error: one update of
 * lag at 480 kt is ~250 m. A parked aircraft keeps a floor so apron jitter never
 * breaks a good correlation.
 */
export function proxyMatchTolerances(
  snapshot: SimSnapshot,
): { radiusM: number; altM: number } {
  const speedMps = Math.max(snapshot.gs, 0) * MPS_PER_KNOT;
  return {
    radiusM: Math.max(
      PROXY_MATCH_MIN_RADIUS_M,
      speedMps * PROXY_MATCH_LAG_SEC + PROXY_MATCH_PAD_M,
    ),
    altM: PROXY_MATCH_ALT_PAD_FT + (Math.abs(snapshot.vs) * PROXY_MATCH_LAG_SEC) / 60,
  };
}

/**
 * Compares one proxy fix against one SimConnect object at the fix's own timestamp.
 * Returns undefined when the fix is too old or the object's track does not cover the
 * fix time; both mean "not comparable", never "matched".
 */
export function evaluateProxyMatch(
  pilot: ProxyPilot,
  entry: SimAircraftEntry,
  nowMs: number,
): ProxyMatchResult | undefined {
  const fixTimeMs = pilot.fixTimeMs ??
    nowMs - (pilot.lastPacketReceived !== undefined
      ? (nowMs / 1000 - pilot.lastPacketReceived) * 1000
      : PROXY_FIX_MAX_AGE_MS);
  if (nowMs - fixTimeMs > PROXY_FIX_MAX_AGE_MS) return undefined;

  const snapshot = projectSimPosition(entry.simTrack, fixTimeMs);
  if (!snapshot) return undefined;

  const dist2d = haversine(
    snapshot.lat,
    snapshot.lon,
    pilot.latitude,
    pilot.longitude,
  );
  const altDiff = Math.abs(snapshot.alt - pilot.altitude);
  const { radiusM, altM } = proxyMatchTolerances(snapshot);

  if (dist2d >= radiusM || altDiff > altM) return undefined;

  return { dist2d, altDiff, score: dist2d / radiusM + altDiff / altM };
}
