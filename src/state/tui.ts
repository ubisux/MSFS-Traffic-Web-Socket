import type { MutableRef } from "./common.ts";

export const _tuiLogKey: MutableRef<number> = { value: 0 };
export const _tuiPacketLogKey: MutableRef<number> = { value: 0 };
export const tuiTimer: MutableRef<Timer | undefined> = { value: undefined };
