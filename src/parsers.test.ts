import { expect, test } from "bun:test";
import { extractArrivalRunway, extractDepartureRunway } from "./parsers.ts";

test("extracts two-digit runways with optional L/C/R suffix", () => {
  for (const runway of ["07", "07L", "25C", "36R"]) {
    expect(extractDepartureRunway(`SID/${runway} DCT FIX`)).toBe(runway);
    expect(extractDepartureRunway(`SID/${runway}`)).toBe(runway);
    expect(extractArrivalRunway(`FIX DCT STAR/${runway}`)).toBe(runway);
    expect(extractArrivalRunway(`STAR/${runway}`)).toBe(runway);
  }
});

test("rejects non-runway alphanumeric route suffixes", () => {
  for (const suffix of ["", "7", "007", "07X", "07LR", "07L1", "N0450F350", "ABC", "07l"]) {
    expect(extractDepartureRunway(`SID/${suffix} DCT FIX`)).toBe("");
    expect(extractDepartureRunway(`SID/${suffix}`)).toBe("");
    expect(extractArrivalRunway(`FIX DCT STAR/${suffix}`)).toBe("");
    expect(extractArrivalRunway(`STAR/${suffix}`)).toBe("");
  }
});
