import type { SimConnectConnection } from "node-simconnect";
import type { MutableRef } from "./common.ts";

export const handle: MutableRef<SimConnectConnection | null> = { value: null };
export const simconnectConnected: MutableRef<boolean> = { value: false };
export const pollTimer: MutableRef<Timer | undefined> = { value: undefined };
export const seenIds: MutableRef<Set<number>> = { value: new Set() };
export const lastSimconnectUpdateTime: MutableRef<number> = { value: 0 };
