import type { LogEntry, LogLevel } from "@rezi-ui/core";
import { appendFileSync } from "fs";

const LOG_BUFFER_LIMIT = 100;
const _logs: LogEntry[] = [];
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
  const line = `${new Date(d).toISOString()} ${msg}\n`;
  try {
    appendFileSync("bridge.log", line, "utf-8");
  } catch {
    process.stderr.write(`Failed to write to bridge.log: ${line}`);
  }
  if (_logs.length === LOG_BUFFER_LIMIT) _logs.shift();
  _logs.push(entry);
}
