import { afterEach, expect, test } from "bun:test";
import { EventEmitter } from "node:events";
import { Protocol, RawBuffer, SimConnectPeriod } from "node-simconnect";
import { connectAndSetup, stopPollLoop } from "./simconnect_setup.ts";
import { REQUEST_AI_AIRCRAFT, REQUEST_CAMERA } from "../../shared/types.ts";
import * as S from "../../state.ts";

class RecordingHandle extends EventEmitter {
  requests: Array<[number, number, number, SimConnectPeriod]> = [];
  addToDataDefinition() {}
  subscribeToSystemEvent() {}
  requestDataOnSimObjectType() {}
  requestDataOnSimObject(request: number, definition: number, object: number, period: SimConnectPeriod) {
    this.requests.push([request, definition, object, period]);
  }
  close() { this.emit("close"); }
}

function packet(latitude = 22): RawBuffer {
  const bytes = Buffer.alloc(572);
  [1000, latitude, 114, 0, 0, 0].forEach((value, i) => bytes.writeDoubleLE(value, i * 8));
  bytes.write("TEST123", 316, "ascii");
  return new RawBuffer(bytes);
}

function discovery(handle: RecordingHandle, id: number, entryNumber: number, outOf: number) {
  handle.emit("simObjectDataByType", { requestID: REQUEST_AI_AIRCRAFT, objectID: id, entryNumber, outOf, data: packet() });
}

afterEach(() => {
  stopPollLoop();
  S.simAircraftMap.clear();
  S.seenIds.value.clear();
  S.shouldExit.value = false;
});

test("frame subscriptions reconcile completed discovery and reconnect without retired callbacks", async () => {
  const first = new RecordingHandle();
  const second = new RecordingHandle();
  const handles = [first, second];
  let opened = 0;
  let wake: (() => void) | undefined;
  const run = connectAndSetup({
    connect: async () => ({ result: { handle: handles[opened++]! } as never, protocol: Protocol.SunRise }),
    reconnectSeconds: 0,
    wait: () => {
      const deferred = Promise.withResolvers<void>();
      wake = deferred.resolve;
      return deferred.promise;
    },
  });
  await Promise.resolve();
  expect(first.requests.filter(([request]) => request === REQUEST_CAMERA)).toHaveLength(1);
  discovery(first, 1, 1, 2);
  discovery(first, 2, 2, 2);
  discovery(first, 1, 1, 2);
  expect(first.requests.filter(([, definition, , period]) => definition === 6 && period === SimConnectPeriod.SIM_FRAME)).toHaveLength(2);
  expect(first.requests.filter(([, , , period]) => period === SimConnectPeriod.NEVER)).toHaveLength(0);
  discovery(first, 1, 1, 1);
  expect(first.requests.filter(([, , id, period]) => id === 2 && period === SimConnectPeriod.NEVER)).toHaveLength(1);
  discovery(first, 2, 1, 2);
  discovery(first, 1, 2, 2);
  first.emit("eventAddRemove", { clientEventId: 100, data: 2 });
  expect(S.simAircraftMap.has(2)).toBe(false);
  expect(first.requests.filter(([, , id, period]) => id === 2 && period === SimConnectPeriod.NEVER)).toHaveLength(2);
  first.emit("quit");
  wake!();
  await Promise.resolve();
  await Promise.resolve();
  expect(opened).toBe(2);
  expect(second.requests.filter(([request]) => request === REQUEST_CAMERA)).toHaveLength(1);
  discovery(first, 3, 1, 1);
  expect(S.simAircraftMap.has(3)).toBe(false);
  discovery(second, 1, 1, 1);
  expect(second.requests.filter(([, definition, id, period]) => definition === 6 && id === 1 && period === SimConnectPeriod.SIM_FRAME)).toHaveLength(1);
  S.shouldExit.value = true;
  wake!();
  await run;
});
