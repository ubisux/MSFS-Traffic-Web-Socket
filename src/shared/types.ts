export const EARTH_RADIUS_METERS = 6371000.0;

export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

export function radiansToDegrees(rad: number): number {
  return (rad * 180.0) / Math.PI;
}

export function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180.0;
}

export interface AircraftData {
  altitude: number;
  latitude: number;
  longitude: number;
  pitch: number;
  heading: number;
  bank: number;
  on_ground: number;
  ground_velocity: number;
  vertical_speed: number;
  title: string;
}

export interface CameraData {
  gameplay_pitch_yaw_0: number;
  gameplay_pitch_yaw_1: number;
  camera_state: number;
  camera_view_type_and_index_0: number;
  camera_view_type_and_index_1: number;
  cockpit_camera_zoom: number;
}

export interface PositionHistoryEntry {
  timestamp: number;
  lat: number;
  lon: number;
  alt: number;
  hdg: number;
  gs: number;
  gnd: number;
  vs: number;
}

export type ProxyCorrelationState = "tentative" | "correlated" | "stale";

export interface SimAircraftEntry {
  simobjectid: number;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  groundspeed: number;
  verticalSpeed: number;
  on_ground: number;
  type: string;
  dep: string;
  arr: string;
  heading: number;
  transponder: string;
  transponder_asgn: string;
  deptime: string;
  depRwy: string;
  depSID: string;
  gate: string;
  scratchpad: string;
  arrRwy: string;
  arrSTAR: string;
  position_history?: PositionHistoryEntry[];
  last_seen?: number;
  lastFSDDataUpdate?: number;
  fsdCorrelationMisses?: number;
  fsdCorrelationCandidate?: string;
  fsdLastCorrelationEpochSec?: number;
  fsdLatitude?: number;
  fsdLongitude?: number;
  fsdAltitude?: number;
  fsdHeading?: number;
  fsdGroundspeed?: number;
  proxyLatitude?: number;
  proxyLongitude?: number;
  proxyAltitude?: number;
  proxyGroundspeed?: number;
  proxyCorrelationState?: ProxyCorrelationState;
  proxyCorrelationCandidate?: string;
  proxyCorrelationMisses?: number;
  proxyCorrelationStreak?: number;
  proxyLastCorrelationEpochSec?: number;
  last_proxy_update?: number;
  last_proxy_refill?: number;
  [key: string]: unknown;
}

export interface FSDDataPilot {
  callsign?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  heading?: number | string;
  groundspeed?: number;
  transponder?: string;
  aircraft_short?: string;
  flight_plan?: {
    aircraft?: string;
    aircraft_short?: string;
    departure?: string;
    arrival?: string;
    deptime?: string;
    assigned_transponder?: string;
    route?: string;
  };
}

export interface FSDDataResponse {
  general?: {
    update_timestamp?: string;
    [key: string]: unknown;
  };
  pilots?: FSDDataPilot[];
  [key: string]: unknown;
}

export interface ProxyPilot {
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  groundspeed: number;
  transponder: string;
  type?: string;
  dep?: string;
  arr?: string;
  deptime?: string;
  gate?: string;
  scratchpad?: string;
  lastPacketReceived?: number;
}

export interface ProxyData {
  pilots: ProxyPilot[];
}

export interface CameraJson {
  gameplay_pitch_yaw_0?: number;
  gameplay_pitch_yaw_1?: number;
  camera_state?: number;
  camera_view_type_and_index_0?: number;
  camera_view_type_and_index_1?: number;
  cockpit_camera_zoom?: number;
  aircraft_latitude?: number;
  aircraft_longitude?: number;
  aircraft_altitude?: number;
  aircraft_heading?: number;
  aircraft_pitch?: number;
}

// Data definition IDs
export const DEFINITION_1 = 1;
export const REQUEST_AI_AIRCRAFT = 1;

export const DEFINITION_2 = 2;
export const REQUEST_CAMERA = 2;

export const DEFINITION_3 = 3;
export const DEFINITION_4 = 4;

export const PROXY_HOST = "127.0.0.1";
export const PROXY_PORT = 6810;
export const PROXY_ACTIVE_TIMEOUT_SEC = 15;
export const PROXY_PACKET_TIMEOUT_SEC = 5;

export const BRIDGE_HTTP_PORT = 8080;
export const MOVEMENT_HTTP_PORT = 8081;

export interface TuiState {
  connected: boolean;
  aircraftCount: number;
  aircraftCorrelated: number;
  proxyActive: boolean;
  proxyCount: number;
  proxyUpdateAgo: number;
  simconnectUpdateAgo: number;
  fsdDataUpdateAgo: number;
  fsdDataReceived: boolean;
  logKey: number;
  logsScrollTop: number;
  packetLogKey: number;
  packetLogsScrollTop: number;
  userLat?: number;
  userLon?: number;
}
