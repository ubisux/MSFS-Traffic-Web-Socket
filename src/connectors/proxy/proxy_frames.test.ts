import { describe, expect, test } from "bun:test";
import { MAX_PROXY_FRAME_BYTES, splitProxyFrames } from "./proxy_frames.ts";

describe("splitProxyFrames", () => {
  test("retains unterminated data until the delimiter arrives", () => {
    const first = splitProxyFrames("@N:CPA156:2000");
    expect(first.frames).toEqual([]);
    expect(first.remainder).toBe("@N:CPA156:2000");

    const second = splitProxyFrames(first.remainder + ":1\r\n");
    expect(second.frames).toEqual(["@N:CPA156:2000:1\r\n"]);
    expect(second.remainder).toBe("");
  });

  test("splits multiple complete frames and retains only final fragment", () => {
    const result = splitProxyFrames("one\r\ntwo\r\npart");
    expect(result.frames).toEqual(["one\r\n", "two\r\n"]);
    expect(result.remainder).toBe("part");
  });

  test("drops an oversized unterminated fragment", () => {
    const result = splitProxyFrames("x".repeat(MAX_PROXY_FRAME_BYTES + 1));
    expect(result.frames).toEqual([]);
    expect(result.remainder).toBe("");
  });
});
