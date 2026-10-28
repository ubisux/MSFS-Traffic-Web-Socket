import { describe, expect, test } from "bun:test";
import type { ProxyPilot, SimTrackSample } from "../../shared/types.ts";
import {
  evaluateProxyMatch,
  projectSimPosition,
  proxyMatchTolerances,
} from "./proxy_match.ts";

const METERS_PER_DEG_LAT = 111_320;

/** Straight northbound track starting at the given time, one sample per `stepMs`. */
function northboundTrack(
  startMs: number,
  count: number,
  stepMs: number,
  speedKt: number,
  options: { lat?: number; lon?: number; altFt?: number; vsFpm?: number } = {},
): SimTrackSample[] {
  const lat0 = options.lat ?? 22.3;
  const lon0 = options.lon ?? 113.9;
  const alt0 = options.altFt ?? 30_000;
  const vs = options.vsFpm ?? 0;
  const metersPerStep = speedKt * 0.514444 * (stepMs / 1000);
  return Array.from({ length: count }, (_, i) => ({
    timestamp: startMs + i * stepMs,
    lat: lat0 + (i * metersPerStep) / METERS_PER_DEG_LAT,
    lon: lon0,
    alt: alt0 + (vs * (i * stepMs)) / 60_000,
    gs: speedKt,
    vs,
    onGround: 0,
  }));
}

function pilotAt(
  lat: number,
  lon: number,
  alt: number,
  fixTimeMs: number,
  callsign = "TEST123",
): ProxyPilot {
  return {
    callsign,
    latitude: lat,
    longitude: lon,
    altitude: alt,
    groundspeed: 480,
    transponder: "2000",
    fixTimeMs,
    lastPacketReceived: Math.floor(fixTimeMs / 1000),
  };
}

describe("projectSimPosition", () => {
  test("interpolates between bracketing samples", () => {
    const track = northboundTrack(0, 5, 1000, 360);
    const snapshot = projectSimPosition(track, 2500);
    expect(snapshot).toBeDefined();
    // 2.5 steps of 185.2 m at 360 kt.
    const expected = 22.3 + (2.5 * 185.2) / METERS_PER_DEG_LAT;
    expect(snapshot!.lat).toBeCloseTo(expected, 8);
    expect(snapshot!.gs).toBeCloseTo(360, 5);
  });

  test("rejects a time outside the retained track", () => {
    const track = northboundTrack(0, 5, 1000, 360);
    expect(projectSimPosition(track, -1)).toBeUndefined();
    expect(projectSimPosition(track, 9000)).toBeUndefined();
  });

  test("rejects an empty track", () => {
    expect(projectSimPosition([], 0)).toBeUndefined();
    expect(projectSimPosition(undefined, 0)).toBeUndefined();
  });
});

describe("evaluateProxyMatch", () => {
  // The regression this guards: a proxy fix that is one packet interval old must not
  // be compared against the *current* position. At 480 kt, 5 s of lag is ~1235 m,
  // which the old fixed-tolerance gate rejected on every tick.
  test("accepts a fix that is one packet interval old", () => {
    const nowMs = 100_000;
    const track = northboundTrack(nowMs - 30_000, 60, 1000, 480);
    const fixTimeMs = nowMs - 5_000;
    const atFix = projectSimPosition(track, fixTimeMs)!;

    const match = evaluateProxyMatch(
      pilotAt(atFix.lat, atFix.lon, atFix.alt, fixTimeMs),
      { simobjectid: 42, simTrack: track } as never,
      nowMs,
    );
    expect(match).toBeDefined();
    expect(match!.dist2d).toBeLessThan(1);
  });

  test("rejects a candidate that only matches at the wrong time", () => {
    const nowMs = 100_000;
    const track = northboundTrack(nowMs - 30_000, 60, 1000, 480);
    const fixTimeMs = nowMs - 5_000;
    const atFix = projectSimPosition(track, fixTimeMs)!;
    const elsewhere = pilotAt(atFix.lat + 0.05, atFix.lon, atFix.alt, fixTimeMs);

    expect(
      evaluateProxyMatch(elsewhere, { simobjectid: 43, simTrack: track } as never, nowMs),
    ).toBeUndefined();
  });

  test("rejects a fix older than the age horizon", () => {
    const nowMs = 100_000;
    const track = northboundTrack(nowMs - 60_000, 90, 1000, 480);
    const stale = nowMs - 20_000;
    const atStale = projectSimPosition(track, stale)!;

    expect(
      evaluateProxyMatch(
        pilotAt(atStale.lat, atStale.lon, atStale.alt, stale),
        { simobjectid: 44, simTrack: track } as never,
        nowMs,
      ),
    ).toBeUndefined();
  });

  test("rejects an altitude mismatch beyond the vertical-rate tolerance", () => {
    const nowMs = 100_000;
    const track = northboundTrack(nowMs - 30_000, 60, 1000, 480);
    const fixTimeMs = nowMs - 2_000;
    const atFix = projectSimPosition(track, fixTimeMs)!;

    expect(
      evaluateProxyMatch(
        pilotAt(atFix.lat, atFix.lon, atFix.alt + 2_000, fixTimeMs),
        { simobjectid: 45, simTrack: track } as never,
        nowMs,
      ),
    ).toBeUndefined();
  });
});

describe("proxyMatchTolerances", () => {
  test("keeps a floor for a parked aircraft", () => {
    const parked = proxyMatchTolerances({
      lat: 22.3,
      lon: 113.9,
      alt: 40,
      gs: 0,
      vs: 0,
      onGround: 1,
      ageMs: 0,
    });
    expect(parked.radiusM).toBeGreaterThanOrEqual(150);
    expect(parked.altM).toBeGreaterThanOrEqual(150);
  });

  test("widens with speed and vertical rate", () => {
    const fast = proxyMatchTolerances({
      lat: 22.3,
      lon: 113.9,
      alt: 30_000,
      gs: 480,
      vs: -2_000,
      onGround: 0,
      ageMs: 0,
    });
    const slow = proxyMatchTolerances({
      lat: 22.3,
      lon: 113.9,
      alt: 30_000,
      gs: 0,
      vs: 0,
      onGround: 0,
      ageMs: 0,
    });
    expect(fast.radiusM).toBeGreaterThan(slow.radiusM);
    expect(fast.altM).toBeGreaterThan(slow.altM);
  });
});
