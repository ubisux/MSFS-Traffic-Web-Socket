import type { FSDDataResponse, VatsimAudioClient } from "../shared/types.ts";
import type { MutableRef } from "./common.ts";

export const fsdData: MutableRef<FSDDataResponse> = { value: {} };
export const fsdDataUpdateEpochSec: MutableRef<number> = { value: 0 };
export const fsdDataReceived: MutableRef<boolean> = { value: false };
export const fsdDataTimer: MutableRef<Timer | undefined> = { value: undefined };

export const transceiversData: MutableRef<VatsimAudioClient[]> = { value: [] };
export const transceiversDataUpdatedAt: MutableRef<number> = { value: 0 };
export const transceiversDataTimer: MutableRef<Timer | undefined> = {
  value: undefined,
};
