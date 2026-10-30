import type { VatsimAudioClient, VatsimTransceiver } from "../../shared/types.ts";

export function transceiversByCallsign(
  clients: readonly VatsimAudioClient[],
): Map<string, VatsimTransceiver[]> {
  const byCallsign = new Map<string, VatsimTransceiver[]>();
  for (const client of clients) {
    const callsign = client.callsign.trim().toUpperCase();
    const current = byCallsign.get(callsign);
    if (current) current.push(...client.transceivers);
    else byCallsign.set(callsign, [...client.transceivers]);
  }
  return byCallsign;
}
