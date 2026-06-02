import type { AddressInfo } from "node:net";
import * as net from "node:net";
import { log } from "./logger.ts";
import { logPacket } from "./proxy_packet_logger.ts";
import type { ProxyData, ProxyPilot } from "./shared/types.ts";
import { PROXY_HOST, PROXY_PORT } from "./shared/types.ts";

let debug = false;
let debugJson = false;

const pilotsData: ProxyPilot[] = [];
let pilotsMutex = false;
function withPilotsLock<T>(fn: () => T): T {
  while (pilotsMutex) {
    // spin - simple spinlock for single-threaded
  }
  pilotsMutex = true;
  try {
    return fn();
  } finally {
    pilotsMutex = false;
  }
}

let lastProxyUpdateTime = 0;
let partialMessage = "";

function parseAircraftData(data: string): void {
  withPilotsLock(() => {
    lastProxyUpdateTime = Math.floor(Date.now() / 1000);

    // Regex for aircraft position data (@N: or @S: ...)
    const aircraftRegex =
      /(@[NS]:[^:\r\n]+:[^:\r\n]+:[^:\r\n]+:[^:\r\n]+:[^:\r\n]+:[^:\r\n]+:[^:\r\n]+:[^:\r\n]+)\r?\n?/g;
    // Regex for gate/callsign extraction (:SC:CALLSIGN:GRP/S/GATE)
    const grpRegex = /:SC:([^:\r\n]+):GRP\/S\/([^:\r\n]+)/g;
    // Regex for scratchpad ($CQ<station>:@<digits>:SC:<callsign>:<value>)
    const scratchpadRegex = /\$CQ[^:]+:@\d+:SC:([^:]+):(.*)/g;

    for (const line of data.split("\n")) {
      // 1. Aircraft position parsing
      let match: RegExpExecArray | null;
      while ((match = aircraftRegex.exec(line)) !== null) {
        const matchStr = match[1]!;
        const parts = matchStr.split(":");
        if (parts.length >= 8) {
          const type = parts[0];
          const callsign = parts[1]!;
          const transponder = parts[2]!;
          const latStr = parts[4]!;
          const lonStr = parts[5]!;
          const altStr = parts[6]!;
          const groundspeedStr = parts[7]!;
          try {
            const latitude = parseFloat(latStr);
            const longitude = parseFloat(lonStr);
            const altitude = parseInt(altStr, 10);
            const groundspeed = parseInt(groundspeedStr, 10);
            const pilot: Partial<ProxyPilot> = {
              callsign,
              latitude,
              longitude,
              altitude,
              groundspeed,
              transponder,
            };
            const found = false;
            for (const existing of pilotsData) {
              if (existing.callsign === callsign) {
                Object.assign(existing, pilot);
                if (debug) log(`Updated pilot: ${callsign}`);
                break;
              }
            }
            if (!found) {
              pilotsData.push(pilot as ProxyPilot);
              if (debug) log(`Added new pilot: ${callsign}`);
            }
          } catch (e) {
            if (debug) log(`Error parsing aircraft data: ${matchStr} - ${e}`);
          }
        }
      }

      // 2. Gate/callsign parsing
      while ((match = grpRegex.exec(line)) !== null) {
        const callsign = match[1]!;
        const gate = match[2]!;
        let found = false;
        for (const pilot of pilotsData) {
          if (pilot.callsign === callsign) {
            pilot.gate = gate;
            found = true;
            if (debug) log(`Updated gate for pilot: ${callsign} -> ${gate}`);
            break;
          }
        }
        if (!found) {
          pilotsData.push({
            callsign,
            gate,
            latitude: 0,
            longitude: 0,
            altitude: 0,
            groundspeed: 0,
            transponder: "",
          });
          if (debug) log(`Added new pilot with gate: ${callsign} -> ${gate}`);
        }
      }

      // 3. Scratchpad parsing ($CQ<station>:@<digits>:SC:<callsign>:<value>)
      while ((match = scratchpadRegex.exec(line)) !== null) {
        const callsign = match[1]!;
        const scratchpad = match[2]!;
        let found = false;
        for (const pilot of pilotsData) {
          if (pilot.callsign === callsign) {
            pilot.scratchpad = scratchpad;
            found = true;
            if (debug) log(`Updated scratchpad for ${callsign} -> ${scratchpad}`);
            break;
          }
        }
        if (!found) {
          pilotsData.push({
            callsign,
            scratchpad,
            latitude: 0,
            longitude: 0,
            altitude: 0,
            groundspeed: 0,
            transponder: "",
          });
          if (debug) log(`Added pilot with scratchpad: ${callsign} -> ${scratchpad}`);
        }
      }
    }
  });
}

function handleConnection(
  label: string,
  handshake1: string,
  handshake2: string,
): void {
  function connect(): void {
    const sock = new net.Socket();

    sock.on("error", (err) => {
      log(`[${label}] Socket error: ${err.message}`);
      sock.destroy();
      setTimeout(connect, 15000);
    });

    sock.connect(PROXY_PORT, PROXY_HOST, () => {
      const addr = sock.address() as AddressInfo;
      log(`[${label}] Actual local port: ${addr.port}`);
      log(`[${label}] Connected to EuroScope proxy server.`);

      // Send first handshake
      log(`[${label}] Sending handshake1 (${handshake1}) on port ${addr.port}`);
      sock.write(handshake1);
      log(`[${label}] Sent handshake: ${handshake1}`);

      // Wait briefly then send second handshake
      setTimeout(() => {
        log(
          `[${label}] Sending handshake2 (${handshake2}) on port ${addr.port}`,
        );
        sock.write(handshake2);
        log(`[${label}] Sent handshake: ${handshake2}`);
      }, 200);
    });

    let buf = partialMessage;
    partialMessage = "";
    sock.on("data", (chunk) => {
      const received = chunk.toString("binary");
      buf += received;

      let idx: number;
      while ((idx = buf.indexOf("\r\n")) !== -1) {
        const completeMsg = buf.slice(0, idx + 2);
        buf = buf.slice(idx + 2);
        const clean = completeMsg.replace(/\r?\n/g, "");
        logPacket(label, clean);
        parseAircraftData(completeMsg);
      }
      partialMessage = buf;
    });

    sock.on("close", () => {
      log(`[${label}] Disconnected. Retrying in 15 seconds...`);
      setTimeout(connect, 15000);
    });
  }
  connect();
}

export function getProxyPilotsData(): ProxyData {
  return withPilotsLock(() => ({
    pilots: pilotsData.map((p) => ({ ...p })),
  }));
}

export function hasProxyData(): boolean {
  return withPilotsLock(() => pilotsData.length > 0);
}

export function isProxyActive(): boolean {
  return withPilotsLock(() => {
    if (lastProxyUpdateTime === 0) return false;
    const now = Math.floor(Date.now() / 1000);
    return now - lastProxyUpdateTime <= 15;
  });
}

export function getLastProxyUpdateTime(): number {
  return withPilotsLock(() => lastProxyUpdateTime);
}

export function startProxyThreads(quitFlag: { value: boolean }): void {
  handleConnection("CLIENT", "CLIENT", "ESLOCAL:MESSSELECT:Message\r\n");
  handleConnection("VATSIM", "VATSIM", "ESLOCAL:MESSSELECT:Message\r\n");

  const interval = setInterval(() => {
    if (quitFlag.value) {
      clearInterval(interval);
    }
  }, 100);
}
