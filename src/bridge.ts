import {
  getLastProxyUpdateTime,
  getProxyPilotsData,
  isProxyActive,
} from "./connectors/proxy/proxy_bridge.ts";
import { haversine } from "./shared/types.ts";
import * as S from "./state.ts";
import { euroScopeState } from "./state/proxy.ts";
import { updateTui } from "./tui.ts";

// ===== TUI state =====
export function updateTuiState(): void {
  S._tuiLogKey.value++;
  S._tuiPacketLogKey.value++;
  const now = Math.floor(Date.now() / 1000);
  const aircraftCorrelated = Array.from(S.simAircraftMap.values()).filter(
    (entry) => entry.callsign,
  ).length;
  updateTui({
    connected: S.simconnectConnected.value,
    aircraftCount: S.simAircraftMap.size,
    aircraftCorrelated,
    proxyActive: isProxyActive(),
    proxyCount: getProxyPilotsData().pilots.length,
    proxyUpdateAgo: now - getLastProxyUpdateTime(),
    simconnectUpdateAgo: now - S.lastSimconnectUpdateTime.value,
    fsdDataUpdateAgo: S.fsdDataReceived.value
      ? now - S.fsdDataUpdateEpochSec.value
      : 0,
    fsdDataReceived: S.fsdDataReceived.value,
    logKey: S._tuiLogKey.value,
    packetLogKey: S._tuiPacketLogKey.value,
    userLat: S.cameraJson.current.aircraft_latitude,
    userLon: S.cameraJson.current.aircraft_longitude,
  });
}

// ===== Correlated aircraft data =====
export interface CorrelatedAircraftInfo {
  id: number;
  callsign: string;
  correlationStatus: string;
  type: string;
  dep: string;
  arr: string;
  distNm: number;
  heading: number;
  groundspeed: number;
  altitude: number;
  onGround: boolean;
  scratchpad: string;
}

function formatCorrelationStatus(entry: { callsign: string; proxyCorrelationState?: string }): string {
  if (!entry.callsign) return "uncorr";
  return entry.proxyCorrelationState ?? "called";
}

export function getCorrelatedAircraftData(): CorrelatedAircraftInfo[] {
  const userLat =
    typeof S.cameraJson.current.aircraft_latitude !== "undefined"
      ? S.cameraJson.current.aircraft_latitude
      : euroScopeState?.lat;
  const userLon =
    typeof S.cameraJson.current.aircraft_longitude !== "undefined"
      ? S.cameraJson.current.aircraft_longitude
      : euroScopeState?.lon;
  if (typeof userLat === "undefined" || typeof userLon === "undefined")
    return [];

  const byKey = new Map<string, CorrelatedAircraftInfo>();
  for (const [id, entry] of S.simAircraftMap) {
    const distM = haversine(userLat, userLon, entry.latitude, entry.longitude);
    const distNm = distM / 1852;

    const aircraftInfo: CorrelatedAircraftInfo = {
      id,
      callsign: entry.callsign || `#${id}`,
      correlationStatus: formatCorrelationStatus(entry),
      type: entry.type || "?",
      dep: entry.dep || "?",
      arr: entry.arr || "?",
      distNm: Math.round(distNm * 10) / 10,
      heading: Math.round(entry.heading),
      groundspeed: entry.groundspeed,
      altitude: entry.altitude,
      onGround: entry.on_ground === 1,
      scratchpad: entry.scratchpad,
    };

    const key = entry.callsign || `id:${id}`;
    const existing = byKey.get(key);
    if (!existing || aircraftInfo.distNm < existing.distNm) {
      byKey.set(key, aircraftInfo);
    }
  }

  const result = Array.from(byKey.values());

  result.sort((a, b) => a.distNm - b.distNm);
  return result;
}
