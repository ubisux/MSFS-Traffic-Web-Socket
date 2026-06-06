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
export const nextProxyId: MutableRef<number> = { value: 0 };
