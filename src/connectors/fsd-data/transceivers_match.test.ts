import { describe, expect, test } from "bun:test";
import type { VatsimAudioClient } from "../../shared/types.ts";
import { transceiversByCallsign } from "./transceivers_match.ts";

const client = (
  callsign: string,
  id: number,
  transceivers: VatsimAudioClient["transceivers"] = [],
): VatsimAudioClient => ({
  callsign,
  transceivers: transceivers.length ? transceivers : [{
    id,
    frequency: 121_500_000 + id,
    latDeg: 22 + id,
    lonDeg: 114,
    heightMslM: 100,
    heightAglM: 80,
  }],
});

describe("transceiversByCallsign", () => {
  test("matches callsigns without case or surrounding-space differences", () => {
    const map = transceiversByCallsign([client(" cpa156 ", 1)]);
    expect(map.get("CPA156")?.map((item) => item.id)).toEqual([1]);
  });

  test("combines transceivers when a callsign has multiple audio-client records", () => {
    const map = transceiversByCallsign([client("JFK_GND", 1), client("jfk_gnd", 2)]);
    expect(map.get("JFK_GND")?.map((item) => item.id)).toEqual([1, 2]);
  });

  test("keeps clients with no transmitters mapped to an empty array", () => {
    const map = transceiversByCallsign([{ callsign: "NO_TX", transceivers: [] }]);
    expect(map.get("NO_TX")).toEqual([]);
  });
});
