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
import type { FSDDataResponse } from "../../shared/types.ts";
import { haversine } from "../../shared/types.ts";
import * as S from "../../state.ts";

// ===== FSD Data Correlation =====
export async function fsdDataLoop(): Promise<void> {
  if (S.shouldExit.value) return;
  await fetchFsdData();
  correlateFSDDataToSimConnect();
  refillAircraftFieldsFromFSDData();
  S.fsdDataTimer.value = setTimeout(
    fsdDataLoop,
    fsdDataFetchIntervalSec * 1000,
  );
}

export function correlateFSDDataToSimConnect(): void {
  const simIds = Array.from(S.simAircraftMap.keys());
  const now = Date.now();

  if (!S.fsdData.value.pilots) return;
  const targetTs = S.fsdDataUpdateEpochSec.value;

  for (const simId of simIds) {
    const simjson = S.simAircraftMap.get(simId);
    if (!simjson) continue;

    if (
      !simjson.callsign &&
      simjson.position_history &&
      simjson.position_history.length > 0
    ) {
      const history = simjson.position_history;

      const exactEntry = history.find((e) => e.timestamp === targetTs);
      if (!exactEntry) continue;

      const slat = exactEntry.lat;
      const slon = exactEntry.lon;
      const salt = exactEntry.alt;
      const shdg = exactEntry.hdg;
      const sgs = exactEntry.gs;
      const onGround = exactEntry.gnd;
      const svs = exactEntry.vs;

      let radius = 500.0;
      if (onGround === 1 || sgs < 30) {
        const minRadiusM = 15.0 * 0.3048;
        radius = 2.0 * sgs;
        if (radius < minRadiusM) radius = minRadiusM;
      } else {
        radius = 4.0 * sgs;
      }

      let bestPilotIdx = -1;
      let bestDist = 1e9;

      for (let i = 0; i < (S.fsdData.value.pilots ?? []).length; i++) {
        const pilot = S.fsdData.value.pilots[i]!;
        if (
          pilot.latitude === undefined ||
          pilot.longitude === undefined ||
          pilot.altitude === undefined ||
          pilot.heading === undefined
        )
          continue;
        const vlat = pilot.latitude;
        const vlon = pilot.longitude;
        const valt = pilot.altitude;
        const vhdg = typeof pilot.heading === "number" ? pilot.heading : 0;
        const dist2d = haversine(slat, slon, vlat, vlon);
        const altDiff = Math.abs(salt - valt);

        let altOk = false;
        if (onGround === 1 || sgs < 30) {
          altOk = altDiff <= 30.0;
        } else {
          const altLimit = svs !== 0 ? (4.0 * Math.abs(svs)) / 60.0 : 100.0;
          altOk = altDiff <= altLimit;
        }

        if (dist2d < radius && dist2d < bestDist && altOk) {
          bestDist = dist2d;
          bestPilotIdx = i;
        }
      }

      if (bestPilotIdx !== -1) {
        const pilot = S.fsdData.value.pilots![bestPilotIdx]!;
        const fsdDataFieldsEmpty = !simjson.callsign;
        const lastUpdate = simjson.lastFSDDataUpdate;
        let canUpdate = fsdDataFieldsEmpty;
        if (!canUpdate && lastUpdate !== undefined) {
          const elapsed = Math.floor(now / 1000) - lastUpdate;
          if (elapsed >= fsdDataRefillIntervalSec) canUpdate = true;
        }
        if (canUpdate) {
          simjson.callsign = pilot.callsign ?? "";
          if (
            pilot.aircraft_short &&
            typeof pilot.aircraft_short === "string"
          ) {
            simjson.type = pilot.aircraft_short;
          } else if (
            pilot.flight_plan?.aircraft_short &&
            typeof pilot.flight_plan.aircraft_short === "string"
          ) {
            simjson.type = pilot.flight_plan.aircraft_short;
          } else if (
            pilot.flight_plan?.aircraft &&
            typeof pilot.flight_plan.aircraft === "string"
          ) {
            simjson.type = pilot.flight_plan.aircraft;
          } else {
            simjson.type = "";
          }
          if (pilot.flight_plan) {
            const fp = pilot.flight_plan;
            simjson.dep = typeof fp.departure === "string" ? fp.departure : "";
            simjson.arr = typeof fp.arrival === "string" ? fp.arrival : "";
            simjson.deptime = typeof fp.deptime === "string" ? fp.deptime : "";
            simjson.transponder_asgn =
              typeof fp.assigned_transponder === "string"
                ? fp.assigned_transponder
                : "";
            const route = typeof fp.route === "string" ? fp.route : "";
            simjson.depRwy = extractDepartureRunway(route);
            simjson.depSID = extractDepartureSID(route);
            simjson.arrRwy = extractArrivalRunway(route);
            simjson.arrSTAR = extractArrivalSTAR(route);
          } else {
            simjson.dep = "";
            simjson.arr = "";
            simjson.deptime = "";
            simjson.transponder_asgn = "";
            simjson.depRwy = "";
            simjson.depSID = "";
            simjson.arrRwy = "";
            simjson.arrSTAR = "";
          }
          simjson.transponder = pilot.transponder ?? "";
          simjson.lastFSDDataUpdate = Math.floor(now / 1000);
          log(`Correlated: ${JSON.stringify(simjson)}`);
        }
      } else {
        let closestDist = 1e9;
        let closestPilotIdx = -1;
        let closestAltDiff = 0;
        let closestHdgDiff = 0;

        for (let i = 0; i < (S.fsdData.value.pilots ?? []).length; i++) {
          const pilot = S.fsdData.value.pilots[i]!;
          if (
            pilot.latitude === undefined ||
            pilot.longitude === undefined ||
            pilot.altitude === undefined ||
            pilot.heading === undefined
          )
            continue;
          const vlat = pilot.latitude;
          const vlon = pilot.longitude;
          const valt = pilot.altitude;
          const vhdg = typeof pilot.heading === "number" ? pilot.heading : 0;
          const dist2d = haversine(slat, slon, vlat, vlon);
          const altDiff = Math.abs(salt - valt);
          const hdgDiff = Math.abs(
            ((((shdg - vhdg + 180) % 360) + 360) % 360) - 180,
          );
          if (dist2d < closestDist) {
            closestDist = dist2d;
            closestPilotIdx = i;
            closestAltDiff = altDiff;
            closestHdgDiff = hdgDiff;
          }
        }

        let closestCallsign = "";
        if (closestPilotIdx !== -1) {
          closestCallsign =
            S.fsdData.value.pilots![closestPilotIdx]?.callsign ?? "";
        }
        log(`Not Correlated: ${JSON.stringify(simjson)}`);
        log(
          `  Closest on FSD Data: callsign=${closestCallsign}, dist2d=${closestDist}m, alt_diff=${closestAltDiff}ft, hdg_diff=${closestHdgDiff} deg`,
        );
      }
    }
  }

  // Remove aircraft whose callsign is no longer in the data
  const activeCallsigns = new Set<string>();
  for (const p of S.fsdData.value.pilots ?? []) {
    if (p.callsign) activeCallsigns.add(p.callsign);
  }
  for (const [id, entry] of S.simAircraftMap) {
    if (
      entry.callsign &&
      entry.lastFSDDataUpdate !== undefined &&
      !activeCallsigns.has(entry.callsign)
    ) {
      log(`Removing ${id} (${entry.callsign}) - no longer on FSD Data`);
      S.simAircraftMap.delete(id);
    }
  }
}

// ===== FSD Data Refill =====
export function refillAircraftFieldsFromFSDData(): void {
  if (!S.fsdData.value.pilots) return;

  const now = Date.now();

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
          const elapsed = Math.floor(now / 1000) - lastUpdate;
          if (elapsed >= fsdDataRefillIntervalSec) canUpdate = true;
        }
        if (canUpdate) {
          if (
            pilot.aircraft_short &&
            typeof pilot.aircraft_short === "string"
          ) {
            simjson.type = pilot.aircraft_short;
          } else if (
            pilot.flight_plan?.aircraft_short &&
            typeof pilot.flight_plan.aircraft_short === "string"
          ) {
            simjson.type = pilot.flight_plan.aircraft_short;
          } else if (
            pilot.flight_plan?.aircraft &&
            typeof pilot.flight_plan.aircraft === "string"
          ) {
            simjson.type = pilot.flight_plan.aircraft;
          }
          if (pilot.flight_plan) {
            const fp = pilot.flight_plan;
            simjson.dep = typeof fp.departure === "string" ? fp.departure : "";
            simjson.arr = typeof fp.arrival === "string" ? fp.arrival : "";
            simjson.deptime = typeof fp.deptime === "string" ? fp.deptime : "";
            simjson.transponder_asgn =
              typeof fp.assigned_transponder === "string"
                ? fp.assigned_transponder
                : "";
            const route = typeof fp.route === "string" ? fp.route : "";
            simjson.depRwy = extractDepartureRunway(route);
            simjson.depSID = extractDepartureSID(route);
            simjson.arrRwy = extractArrivalRunway(route);
            simjson.arrSTAR = extractArrivalSTAR(route);
          }
          simjson.lastFSDDataUpdate = Math.floor(now / 1000);
        }
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
