import { ui } from "@rezi-ui/core";
import { createNodeApp } from "@rezi-ui/node";
import { getLogs } from "./logger.ts";
import { getPacketLogs } from "./proxy_packet_logger.ts";
import type { TuiState } from "./shared/types.ts";
import type { CorrelatedAircraftInfo } from "./simconnect_bridge.ts";
import { getCorrelatedAircraftData } from "./simconnect_bridge.ts";

let app: ReturnType<typeof createNodeApp<TuiState>> | null = null;

function formatDist(nm: number): string {
  return `${nm.toFixed(1)}nm`;
}

export function startTui(): ReturnType<typeof createNodeApp<TuiState>> {
  app = createNodeApp<TuiState>({
    initialState: {
      connected: false,
      aircraftCount: 0,
      aircraftCorrelated: 0,
      proxyActive: false,
      proxyCount: 0,
      vatsimUpdateAgo: 0,
      vatsimDataReceived: false,
      proxyUpdateAgo: 0,
      simconnectUpdateAgo: 0,
      logKey: 0,
      logsScrollTop: 0,
      packetLogKey: 0,
      packetLogsScrollTop: 0,
    },
  });

  app.view((state) => {
    const logs = getLogs();
    const aircraft = getCorrelatedAircraftData();

    return ui.page({
      p: 1,
      gap: 1,
      header: ui.row(
        {
          width: "full",
          gap: 2,
        },
        [
          ui.text("MSFS Traffic Bridge", { bold: true }),
          ui.spacer({ flex: 1 }),
          ui.text(
            "VATSIM (" +
              state.vatsimUpdateAgo +
              "s) " +
              (state.vatsimDataReceived ? "\u25CF" : "\u25CB"),
            {
              style: { fg: state.vatsimDataReceived ? 0x00ff00 : 0xff0000 },
            },
          ),
          ui.text(
            "EuroScope (" +
              state.proxyUpdateAgo +
              "s) " +
              (state.proxyActive ? "\u25CF" : "\u25CB"),
            {
              style: { fg: state.proxyActive ? 0x00ff00 : 0xff0000 },
            },
          ),
          ui.text(
            "SimConnect (" +
              state.simconnectUpdateAgo +
              "s) " +
              (state.connected ? "\u25CF" : "\u25CB"),
            {
              style: { fg: state.connected ? 0x00ff00 : 0xff0000 },
            },
          ),
        ],
      ),
      body: ui.row({ gap: 1, flex: 1 }, [
        ui.box(
          {
            border: "rounded",
            title:
              "Aircraft (" +
              state.aircraftCorrelated +
              "/" +
              state.aircraftCount +
              ")",
            flex: 1,
            height: "full",
          },
          [
            ...(aircraft.length > 0
              ? [
                  ui.table({
                    id: "ac-table",
                    columns: [
                      { key: "callsign", header: "CS", width: 10 },
                      { key: "type", header: "TYPE", width: 6 },
                      { key: "dep", header: "DEP", width: 6 },
                      { key: "arr", header: "DEST", width: 6 },
                      {
                        key: "distNm",
                        header: "DIST",
                        width: 9,
                        render: (_v: unknown, r: CorrelatedAircraftInfo) =>
                          ui.text(formatDist(r.distNm)),
                      },
                      { key: "altitude", header: "ALT", width: 7 },
                      { key: "heading", header: "HDG", width: 5 },
                      { key: "groundspeed", header: "GS", width: 5 },
                      {
                        key: "onGround",
                        header: "GND",
                        width: 4,
                        render: (_v: unknown, r: CorrelatedAircraftInfo) =>
                          ui.text(r.onGround ? "Y" : "N"),
                      },
                      { key: "scratchpad", header: "TXT", width: 12 },
                    ],
                    data: aircraft,
                    getRowKey: (r: CorrelatedAircraftInfo, _i: number) =>
                      r.callsign,
                    showHeader: true,
                    border: "none",
                  }),
                ]
              : [ui.text("(no correlated aircraft)", { dim: true })]),
          ],
        ),
        ui.column({ flex: 1 }, [
          ui.box({ border: "rounded", title: "Log", flex: 1 }, [
            [
              ui.logsConsole({
                id: "logs",
                autoScroll: true,
                scrollTop: state.logsScrollTop,
                onScroll: (top) =>
                  app!.update((s) => ({ ...s, logsScrollTop: top })),
                entries: logs,
              }),
            ],
          ]),
          ui.box({ border: "rounded", title: "Proxy Packets", flex: 1 }, [
            [
              ui.logsConsole({
                id: "packet-logs",
                autoScroll: true,
                scrollTop: state.packetLogsScrollTop,
                onScroll: (top) =>
                  app!.update((s) => ({ ...s, packetLogsScrollTop: top })),
                entries: getPacketLogs(),
              }),
            ],
          ]),
        ]),
      ]),
      footer: ui.statusBar({
        left: [ui.text("q: quit")],
        right: [ui.text("© 2026 VATSIM Hong Kong vACC.")],
      }),
    });
  });

  app.keys({
    q: () => process.exit(0),
  });

  return app;
}

export function updateTui(partial: Partial<TuiState>): void {
  if (!app) return;
  app.update((s) => ({ ...s, ...partial }));
}
