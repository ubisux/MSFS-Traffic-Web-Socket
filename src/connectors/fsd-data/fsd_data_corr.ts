import {
  fsdDataFetchIntervalSec,
  fsdDataRefillIntervalSec,
} from "../../config.ts";
import { log } from "../../loggers/logger.ts";
import {
  extractArrivalRunway,
  extractArrivalSTAR,
  extractDepartureRunway,
  extractDepartureSID,
  parseIso8601ToEpochSec,
} from "../../parsers.ts";
import type { FSDDataPilot, FSDDataResponse, SimAircraftEntry } from "../../shared/types.ts";
import * as S from "../../state.ts";

// ===== FSD Data =====
export async function fsdDataLoop(): Promise<void> {
  if (S.shouldExit.value) return;
  await fetchFsdData();
  refillAircraftFieldsFromFSDData();
  S.fsdDataTimer.value = setTimeout(
    fsdDataLoop,
    fsdDataFetchIntervalSec * 1000,
  );
}

function updateFsdFallbackPositionFields(
  simjson: SimAircraftEntry,
  pilot: FSDDataPilot,
): void {
  simjson.fsdLatitude = pilot.latitude;
  simjson.fsdLongitude = pilot.longitude;
  simjson.fsdAltitude = pilot.altitude;
  simjson.fsdHeading = typeof pilot.heading === "number" ? pilot.heading : undefined;
  simjson.fsdGroundspeed = pilot.groundspeed;
}

function refillFromFsdPilot(
  simjson: SimAircraftEntry,
  pilot: FSDDataPilot,
  nowSec: number,
  replaceEmptyType = true,
): void {
  updateFsdFallbackPositionFields(simjson, pilot);

  if (
    pilot.aircraft_short &&
    typeof pilot.aircraft_short === "string" &&
    (replaceEmptyType || !simjson.type)
  ) {
    simjson.type = pilot.aircraft_short;
  } else if (
    pilot.flight_plan?.aircraft_short &&
    typeof pilot.flight_plan.aircraft_short === "string" &&
    (replaceEmptyType || !simjson.type)
  ) {
    simjson.type = pilot.flight_plan.aircraft_short;
  } else if (
    pilot.flight_plan?.aircraft &&
    typeof pilot.flight_plan.aircraft === "string" &&
    (replaceEmptyType || !simjson.type)
  ) {
    simjson.type = pilot.flight_plan.aircraft;
  }

  if (pilot.flight_plan) {
    const fp = pilot.flight_plan;
    simjson.dep = typeof fp.departure === "string" ? fp.departure : "";
    simjson.arr = typeof fp.arrival === "string" ? fp.arrival : "";
    simjson.deptime = typeof fp.deptime === "string" ? fp.deptime : "";
    simjson.transponder_asgn =
      typeof fp.assigned_transponder === "string" ? fp.assigned_transponder : "";
    const route = typeof fp.route === "string" ? fp.route : "";
    simjson.depRwy = extractDepartureRunway(route);
    simjson.depSID = extractDepartureSID(route);
    simjson.arrRwy = extractArrivalRunway(route);
    simjson.arrSTAR = extractArrivalSTAR(route);
  }

  if (pilot.transponder) simjson.transponder = pilot.transponder;
  simjson.lastFSDDataUpdate = nowSec;
}

// FSD data.json is deliberately not used for correlation. Correlation is based on
// SimConnect + EuroScope proxy positions only; FSD only refills metadata and API
// fallback coordinates for already-correlated callsigns.
export function correlateFSDDataToSimConnect(): void {}

// ===== FSD Data Refill =====
export function refillAircraftFieldsFromFSDData(): void {
  if (!S.fsdData.value.pilots) return;

  const nowSec = Math.floor(Date.now() / 1000);

  for (const [, simjson] of S.simAircraftMap) {
    if (!simjson.callsign) continue;

    const callsign = simjson.callsign;
    for (const pilot of S.fsdData.value.pilots) {
      if (pilot.callsign === callsign) {
        const fsdDataFieldsEmpty =
          !simjson.type &&
          !simjson.dep &&
          !simjson.arr &&
          !simjson.depRwy &&
          !simjson.depSID;
        const lastUpdate = simjson.lastFSDDataUpdate;
        let canUpdate = fsdDataFieldsEmpty;
        if (!canUpdate && lastUpdate !== undefined) {
          const elapsed = nowSec - lastUpdate;
          if (elapsed >= fsdDataRefillIntervalSec) canUpdate = true;
        }

        refillFromFsdPilot(simjson, pilot, nowSec, canUpdate);
        break;
      }
    }
  }
}

// ===== Fetch FSD Data =====
export async function fetchFsdData(): Promise<void> {
  try {
    const response = await fetch(
      Bun.env.DATA_URL ?? "https://data.vatsim.net/v3/vatsim-data.json",
    );
    if (!response.ok) return;

    const text = await response.text();
    if (text.length > 0 && text[0] === "{") {
      const parsed = JSON.parse(text) as FSDDataResponse;
      S.fsdData.value = parsed;
      if (parsed.general?.update_timestamp) {
        S.fsdDataUpdateEpochSec.value = parseIso8601ToEpochSec(
          parsed.general.update_timestamp,
        );
      }
      if (parsed.pilots) S.fsdDataReceived.value = true;
    }
  } catch (e) {
    log("FSD data fetch error: " + e);
  }
}
