import { describe, expect, test } from "bun:test";
import { Protocol } from "node-simconnect";
import { openSimConnectWithFallback } from "./simconnect_protocol.ts";

describe("openSimConnectWithFallback", () => {
  test("uses the MSFS 2024 protocol when it opens", async () => {
    const attempts: Protocol[] = [];
    const result = await openSimConnectWithFallback(
      async (protocol) => {
        attempts.push(protocol);
        return "connected";
      },
      () => {
        throw new Error("fallback should not run");
      },
    );

    expect(attempts).toEqual([Protocol.SunRise]);
    expect(result).toEqual({ result: "connected", protocol: Protocol.SunRise });
  });

  test("falls back to the MSFS 2020 protocol if 2024 negotiation fails", async () => {
    const attempts: Protocol[] = [];
    const failure = new Error("protocol mismatch");
    const fallbackErrors: unknown[] = [];
    const result = await openSimConnectWithFallback(
      async (protocol) => {
        attempts.push(protocol);
        if (protocol === Protocol.SunRise) throw failure;
        return "connected";
      },
      (error) => fallbackErrors.push(error),
    );

    expect(attempts).toEqual([Protocol.SunRise, Protocol.KittyHawk]);
    expect(fallbackErrors).toEqual([failure]);
    expect(result).toEqual({ result: "connected", protocol: Protocol.KittyHawk });
  });
});
