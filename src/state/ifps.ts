import type { IfpsDepAirportFlight } from "../shared/types.ts";
import type { MutableRef } from "./common.ts";

/** Airport ICAO → (callsign → departure flight record) from the latest fetch. */
export const ifpsDepAirportFlights: MutableRef<
  Map<string, Map<string, IfpsDepAirportFlight>>
> = { value: new Map() };
export const ifpsDepAirportUpdatedAt: MutableRef<number> = { value: 0 };
export const ifpsDepAirportTimer: MutableRef<Timer | undefined> = {
  value: undefined,
};
