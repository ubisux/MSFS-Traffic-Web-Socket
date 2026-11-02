import type { SimAircraftEntry, VatsimTransceiver } from './shared/types.ts';
export type ApiAircraftEntry = Omit<SimAircraftEntry, "position_history" | "lastFSDDataUpdate" | "fsdCorrelationMisses" | "fsdCorrelationCandidate" | "fsdLastCorrelationEpochSec" | "fsdLatitude" | "fsdLongitude" | "fsdAltitude" | "fsdHeading" | "fsdGroundspeed" | "proxyLatitude" | "proxyLongitude" | "proxyAltitude" | "proxyGroundspeed" | "proxyCorrelationState" | "proxyCorrelationCandidate" | "proxyCorrelationMisses" | "proxyCorrelationStreak" | "proxyLastCorrelationEpochSec"> & {
  transceivers: VatsimTransceiver[];
};
export function toApiAircraftEntry(
  obj: SimAircraftEntry,
  audioClients: Map<string, VatsimTransceiver[]>,
): ApiAircraftEntry {
  const {
    position_history: _positionHistory,
    lastFSDDataUpdate: _lastFSDDataUpdate,
    fsdCorrelationMisses: _fsdCorrelationMisses,
    fsdCorrelationCandidate: _fsdCorrelationCandidate,
    fsdLastCorrelationEpochSec: _fsdLastCorrelationEpochSec,
    fsdLatitude,
    fsdLongitude,
    fsdAltitude,
    fsdHeading,
    fsdGroundspeed,
    proxyLatitude,
    proxyLongitude,
    proxyAltitude,
    proxyGroundspeed,
    proxyCorrelationState: _proxyCorrelationState,
    proxyCorrelationCandidate: _proxyCorrelationCandidate,
    proxyCorrelationMisses: _proxyCorrelationMisses,
    proxyCorrelationStreak: _proxyCorrelationStreak,
    proxyLastCorrelationEpochSec: _proxyLastCorrelationEpochSec,
    ...apiEntry
  } = obj;

  if (!Number.isFinite(apiEntry.latitude)) {
    if (typeof proxyLatitude === "number") apiEntry.latitude = proxyLatitude;
    else if (typeof fsdLatitude === "number") apiEntry.latitude = fsdLatitude;
  }
  if (!Number.isFinite(apiEntry.longitude)) {
    if (typeof proxyLongitude === "number") apiEntry.longitude = proxyLongitude;
    else if (typeof fsdLongitude === "number") apiEntry.longitude = fsdLongitude;
  }
  if (!Number.isFinite(apiEntry.altitude)) {
    if (typeof proxyAltitude === "number") apiEntry.altitude = proxyAltitude;
    else if (typeof fsdAltitude === "number") apiEntry.altitude = fsdAltitude;
  }
  if (!Number.isFinite(apiEntry.heading) && typeof fsdHeading === "number") {
    apiEntry.heading = fsdHeading;
  }
  if (!Number.isFinite(apiEntry.groundspeed)) {
    if (typeof proxyGroundspeed === "number") apiEntry.groundspeed = proxyGroundspeed;
    else if (typeof fsdGroundspeed === "number") apiEntry.groundspeed = fsdGroundspeed;
  }

  const key = obj.callsign.trim().toUpperCase();
  return {
    ...apiEntry,
    transceivers: audioClients.get(key) ?? [],
  };
}
