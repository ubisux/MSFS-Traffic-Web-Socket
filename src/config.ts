import { log } from "./loggers/logger.ts";

// ===== Configuration (from env vars) =====
export let simconnectFetchIntervalSec = 0.01;
export let fsdDataFetchIntervalSec = 15.0;
export let fsdDataRefillIntervalSec = 15.0;
export let proxyCorrelationIntervalSec = 1.0;
export let aircraftTtlSeconds = 30.0;
export let reconnectDelaySec = 5.0;

export function readEnvConfig(): void {
  const simEnv = Bun.env["SIMCONNECT_FETCH_INTERVAL"];
  if (simEnv) {
    const val = parseFloat(simEnv);
    if (val >= 0.1) simconnectFetchIntervalSec = val;
  }
  if (simconnectFetchIntervalSec < 0.01) simconnectFetchIntervalSec = 0.01;

  const fsdDataFetchEnv = Bun.env["FSD_DATA_FETCH_INTERVAL"];
  if (fsdDataFetchEnv) {
    const val = parseFloat(fsdDataFetchEnv);
    if (val >= 4.0) fsdDataFetchIntervalSec = val;
  }
  if (fsdDataFetchIntervalSec < 4.0) fsdDataFetchIntervalSec = 4.0;

  const fsdDataRefillEnv = Bun.env["FSD_DATA_REFILL_INTERVAL"];
  if (fsdDataRefillEnv) {
    const val = parseFloat(fsdDataRefillEnv);
    if (val >= 4.0) fsdDataRefillIntervalSec = val;
  }
  if (fsdDataRefillIntervalSec < 4.0) fsdDataRefillIntervalSec = 4.0;

  const aircraftTtlEnv = Bun.env["AIRCRAFT_TTL_SECONDS"];
  if (aircraftTtlEnv) {
    const val = parseFloat(aircraftTtlEnv);
    if (val >= 0.0) aircraftTtlSeconds = val;
  }
  if (aircraftTtlSeconds < 0.0) aircraftTtlSeconds = 0.0;

  const proxyCorrelationEnv = Bun.env["PROXY_CORRELATION_INTERVAL"];
  if (proxyCorrelationEnv) {
    const val = parseFloat(proxyCorrelationEnv);
    if (val >= 1.0) proxyCorrelationIntervalSec = val;
  }
  if (proxyCorrelationIntervalSec < 1.0) proxyCorrelationIntervalSec = 1.0;

  const reconnectEnv = Bun.env["SIMCONNECT_RECONNECT_DELAY"];
  if (reconnectEnv) {
    const val = parseFloat(reconnectEnv);
    if (val >= 1.0) reconnectDelaySec = val;
  }

  log("Configuration:");
  log(`  SimConnect fetch interval: ${simconnectFetchIntervalSec} seconds`);
  log(
    `  FSD Data fetch/correlate interval: ${fsdDataFetchIntervalSec} seconds`,
  );
  log(`  FSD Data refill interval: ${fsdDataRefillIntervalSec} seconds`);
  log(`  Proxy correlation interval: ${proxyCorrelationIntervalSec} seconds`);
  log(`  Aircraft TTL: ${aircraftTtlSeconds} seconds`);
  log(`  Reconnect delay: ${reconnectDelaySec} seconds`);
}
