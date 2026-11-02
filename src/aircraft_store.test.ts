import { afterEach, describe, expect, test } from "bun:test";
import { RawBuffer } from "node-simconnect";
import { printAircraftData, printAircraftMotion, printCameraData } from "./aircraft_store.ts";
import * as S from "./state.ts";

function aircraftPacket(latitude: number, identity: boolean): RawBuffer {
  const bytes = Buffer.alloc(60 + (identity ? 512 : 0));
  [1000, latitude, 114, 0, 0, 0].forEach((value, index) => bytes.writeDoubleLE(value, index * 8));
  bytes.writeInt32LE(1, 48);
  bytes.writeInt32LE(120, 52);
  bytes.writeInt32LE(300, 56);
  if (identity) bytes.write("TEST123", 60 + 256, "ascii");
  return new RawBuffer(bytes);
}

afterEach(() => S.simAircraftMap.clear());

describe("SimConnect sample decoding", () => {
  test("motion-only samples retain identity and update the track", () => {
    printAircraftData(42, aircraftPacket(22, true));
    const entry = S.simAircraftMap.get(42)!;
    expect(entry.atcId).toBe("TEST123");
    printAircraftMotion(42, aircraftPacket(23, false));
    expect(entry.atcId).toBe("TEST123");
    expect(entry.latitude).toBe(23);
    expect(entry.simTrack?.at(-1)?.lat).toBe(23);
  });

  test("unknown or truncated motion never changes cached aircraft", () => {
    printAircraftMotion(42, aircraftPacket(22, false));
    expect(S.simAircraftMap.has(42)).toBe(false);
    printAircraftData(42, aircraftPacket(22, true));
    printAircraftMotion(42, new RawBuffer(Buffer.alloc(10)));
    expect(S.simAircraftMap.get(42)?.latitude).toBe(22);
  });

  test("truncated camera samples preserve the previous camera", () => {
    const previous = S.cameraJson.current;
    printCameraData(new RawBuffer(Buffer.alloc(10)));
    expect(S.cameraJson.current).toBe(previous);
  });
});
