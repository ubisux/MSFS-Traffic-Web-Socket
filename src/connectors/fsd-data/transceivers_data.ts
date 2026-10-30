import { transceiversDataUrl } from "../../config.ts";
import { log } from "../../loggers/logger.ts";
import type { VatsimAudioClient } from "../../shared/types.ts";
import * as S from "../../state.ts";

const REFRESH_INTERVAL_MS = 15_000;
const REQUEST_TIMEOUT_MS = 10_000;

export async function transceiversDataLoop(): Promise<void> {
  if (S.shouldExit.value) return;
  await fetchTransceiversData();
  S.transceiversDataTimer.value = setTimeout(
    transceiversDataLoop,
    REFRESH_INTERVAL_MS,
  );
}

export async function fetchTransceiversData(): Promise<void> {
  try {
    const response = await fetch(transceiversDataUrl, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      log(`Transceivers data fetch failed: HTTP ${response.status}`);
      return;
    }

    const parsed: unknown = await response.json();
    if (!Array.isArray(parsed)) {
      log("Transceivers data fetch failed: expected an array");
      return;
    }

    S.transceiversData.value = parsed.filter(isAudioClient);
    S.transceiversDataUpdatedAt.value = Date.now();
  } catch (err) {
    log(`Transceivers data fetch error: ${err}`);
  }
}

function isAudioClient(value: unknown): value is VatsimAudioClient {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<VatsimAudioClient>;
  return typeof candidate.callsign === "string" &&
    Array.isArray(candidate.transceivers);
}
