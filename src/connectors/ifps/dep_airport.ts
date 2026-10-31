import {
  ifpsDepAirportRefreshIntervalSec,
  ifpsDepAirportUrl,
} from "../../config.ts";
import { log } from "../../loggers/logger.ts";
import type { IfpsDepAirportFlight } from "../../shared/types.ts";
import * as S from "../../state.ts";

/** Airports whose IFPS departure (CDM/ATFCM) feeds are polled and served. */
export const IFPS_DEP_AIRPORTS = ["VHHH", "VMMC"] as const;

const REQUEST_TIMEOUT_MS = 10_000;

export async function ifpsDepAirportLoop(): Promise<void> {
  if (S.shouldExit.value) return;
  await fetchIfpsDepAirportFlights();
  S.ifpsDepAirportTimer.value = setTimeout(
    ifpsDepAirportLoop,
    ifpsDepAirportRefreshIntervalSec * 1000,
  );
}

export async function fetchIfpsDepAirportFlights(): Promise<void> {
  const results = await Promise.all(
    IFPS_DEP_AIRPORTS.map(async (airport) =>
      [airport, await fetchAirport(airport)] as const
    ),
  );

  const next = new Map<string, Map<string, IfpsDepAirportFlight>>();
  let anySucceeded = false;
  for (const [airport, byCallsign] of results) {
    if (byCallsign) {
      next.set(airport, byCallsign);
      anySucceeded = true;
      continue;
    }
    // Failed fetch: keep the previous snapshot for this airport instead of
    // blanking every aircraft that depends on it.
    const previous = S.ifpsDepAirportFlights.value.get(airport);
    if (previous) next.set(airport, previous);
  }

  if (!anySucceeded && S.ifpsDepAirportFlights.value.size > 0) return;
  S.ifpsDepAirportFlights.value = next;
  S.ifpsDepAirportUpdatedAt.value = Date.now();
}

async function fetchAirport(
  airport: string,
): Promise<Map<string, IfpsDepAirportFlight> | undefined> {
  try {
    const url = new URL(ifpsDepAirportUrl);
    url.searchParams.set("airport", airport);
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      log(`IFPS ${airport} departures fetch failed: HTTP ${response.status}`);
      return undefined;
    }

    const parsed: unknown = await response.json();
    if (!Array.isArray(parsed)) {
      log(`IFPS ${airport} departures fetch failed: expected an array`);
      return undefined;
    }

    const byCallsign = new Map<string, IfpsDepAirportFlight>();
    for (const raw of parsed) {
      const flight = toDepAirportFlight(raw);
      if (flight) byCallsign.set(flight.callsign.trim().toUpperCase(), flight);
    }
    return byCallsign;
  } catch (err) {
    log(`IFPS ${airport} departures fetch error: ${err}`);
    return undefined;
  }
}

function toDepAirportFlight(value: unknown): IfpsDepAirportFlight | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Partial<IfpsDepAirportFlight>;
  return typeof candidate.callsign === "string" && candidate.callsign.trim()
    ? candidate as IfpsDepAirportFlight
    : null;
}

/** Departure flight record for this aircraft, chosen by its departure airport. */
export function findIfpsDeparture(
  dep: string | undefined,
  callsign: string | undefined,
): IfpsDepAirportFlight | null {
  if (!dep?.trim() || !callsign?.trim()) return null;
  const byCallsign = S.ifpsDepAirportFlights.value.get(
    dep.trim().toUpperCase(),
  );
  return byCallsign?.get(callsign.trim().toUpperCase()) ?? null;
}
