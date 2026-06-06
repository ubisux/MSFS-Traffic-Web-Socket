import type { LogEntry, LogLevel } from "@rezi-ui/core";
import { appendFileSync } from "fs";

let _logs: LogEntry[] = [];
export function getLogs(): LogEntry[] {
  return _logs;
}

export function log(msg: string, level: LogLevel = "info"): void {
  const d = new Date().getTime();
  const entry: LogEntry = {
    id: (_logs.length + 1).toString(),
    timestamp: d,
    message: msg,
    level: level,
    source: "",
  };
  appendFileSync(
    "bridge.log",
    `${new Date(d).toISOString()} ${msg}\n`,
    "utf-8",
  );
  _logs = [..._logs, entry];
}
