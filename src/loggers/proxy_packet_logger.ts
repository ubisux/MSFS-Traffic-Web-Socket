import type { LogEntry } from "@rezi-ui/core";

let _packetLogs: LogEntry[] = [];

export function getPacketLogs(): LogEntry[] {
  return _packetLogs;
}

export function logPacket(label: string, msg: string): void {
  const d = new Date().getTime();
  const entry: LogEntry = {
    id: (_packetLogs.length + 1).toString(),
    timestamp: d,
    message: msg,
    level: "info",
    source: label,
  };
  // appendFileSync(
  //   "proxy_packets.log",
  //   `${new Date(d).toISOString()} [${label}] ${msg}\n`,
  //   "utf-8",
  // );
  _packetLogs = [..._packetLogs, entry];
}
