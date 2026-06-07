import type { LogEntry } from "@rezi-ui/core";
import { appendFileSync } from "fs";

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
  const line = `${new Date(d).toISOString()} [${label}] ${msg}\n`;
  try {
    appendFileSync("proxy_packets.log", line, "utf-8");
  } catch {
    process.stderr.write(`Failed to write to proxy_packets.log: ${line}`);
  }
  _packetLogs = [..._packetLogs, entry];
}
