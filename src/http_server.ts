import { log } from "./loggers/logger.ts";
import type { SimAircraftEntry } from "./shared/types.ts";
import { BRIDGE_HTTP_PORT } from "./shared/types.ts";
import * as S from "./state.ts";

// ===== HTTP Server =====
export function httpServerThread(): void {
  try {
    Bun.serve({
      port: BRIDGE_HTTP_PORT,
      async fetch(req) {
        const url = new URL(req.url);
        const headers = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        };

        if (req.method === "OPTIONS" && url.pathname === "/aircraft") {
          return new Response(null, { status: 204, headers });
        }

        if (req.method === "GET" && url.pathname === "/aircraft") {
          const arr: SimAircraftEntry[] = [];
          for (const [, obj] of S.simAircraftMap) {
            if (obj.callsign) {
              arr.push(obj);
            }
          }
          const response = { aircraft: arr, camera: S.cameraJson.current };
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: { ...headers, "Content-Type": "application/json" },
          });
        }

        return new Response("Not Found", { status: 404 });
      },
    });

    log(`HTTP server running on http://localhost:${BRIDGE_HTTP_PORT}/aircraft`);
  } catch (err) {
    log("HTTP server failed: " + (err instanceof Error ? err.message : err));
  }
}
