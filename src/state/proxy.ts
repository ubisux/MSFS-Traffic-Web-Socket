import type { AircraftConfig } from "../shared/types.ts";
import type { MutableRef } from "./common.ts";
import type { ProxyPilot } from "../shared/types.ts";

export const proxyPilots: ProxyPilot[] = [];
export let proxyConnected = false;
export let lastProxyUpdateTime = 0;
export let euroScopeState:
  | { callsign: string; lat: number; lon: number }
  | undefined = undefined;

export function setProxyConnected(v: boolean): void {
  proxyConnected = v;
}
export function setLastProxyUpdateTime(v: number): void {
  lastProxyUpdateTime = v;
}
export function setEuroScopeState(
  v: typeof euroScopeState,
): void {
  euroScopeState = v;
}

export const proxyCorrTimer: MutableRef<Timer | undefined> = {
  value: undefined,
};

/** Latest ACC config patch by normalized VATSIM callsign; survives disconnects. */
export const aircraftConfigs = new Map<string, AircraftConfig>();
export const nextProxyId: MutableRef<number> = { value: 0 };
