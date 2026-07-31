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
  updateTui({
    connected: S.simconnectConnected.value,
    aircraftCount: S.simAircraftMap.size,
    aircraftCorrelated: S.simAircraftMap.size,
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
  callsign: string;
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

export function getCorrelatedAircraftData(): CorrelatedAircraftInfo[] {
  const userLat =
    typeof S.cameraJson.current.aircraft_latitude !== "undefined"
      ? S.cameraJson.current.aircraft_latitude
      : euroScopeState?.lat;
  const userLon =
    typeof S.cameraJson.current.aircraft_longitude !== "undefined"
      ? S.cameraJson.current.aircraft_longitude
      : euroScopeState?.lon;
  const userAlt =
    typeof S.cameraJson.current.aircraft_altitude !== "undefined"
      ? S.cameraJson.current.aircraft_altitude
      : 0;
  if (typeof userLat === "undefined" || typeof userLon === "undefined")
    return [];

  const byCallsign = new Map<string, CorrelatedAircraftInfo>();
  for (const [, entry] of S.simAircraftMap) {
    if (!entry.callsign) continue;

    const distM = haversine(userLat, userLon, entry.latitude, entry.longitude);
    const distNm = distM / 1852;

    const aircraftInfo: CorrelatedAircraftInfo = {
      callsign: entry.callsign,
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

    const existing = byCallsign.get(entry.callsign);
    if (!existing || aircraftInfo.distNm < existing.distNm) {
      byCallsign.set(entry.callsign, aircraftInfo);
    }
  }

  const result = Array.from(byCallsign.values());

  result.sort((a, b) => a.distNm - b.distNm);
  return result;
}
