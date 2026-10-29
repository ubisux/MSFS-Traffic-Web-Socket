# SimConnect + VATSIM Bridge

This project is a TypeScript bridge for Microsoft Flight Simulator (MSFS). It reads aircraft from SimConnect, correlates them with EuroScope/FSD and VATSIM data, and exposes the result to the TowerView frontend.

## Features

- Reads live aircraft and camera data from MSFS through `node-simconnect`.
- Uses SimConnect `ATC ID` as the authoritative callsign when available; positional correlation is a guarded fallback, and unmatched EuroScope pilots remain proxy-only entries. The TUI `CORR` column shows `Y` for a SimConnect aircraft matched by callsign or proxy position, `P` for a proxy-only entry, and `N` for stale or uncorrelated entries.
- Fetches VATSIM/FSD data to refill metadata and exposes aircraft and camera data at `http://localhost:8080/aircraft`.
- Provides aircraft movement and camera reset endpoints on port 8081; see [AIRCRAFT_MOVEMENT_API.md](AIRCRAFT_MOVEMENT_API.md).
- Displays bridge, proxy, FSD, and SimConnect status in a terminal UI.

## TrackAudio station receive API

With TrackAudio running on its SDK websocket (default `ws://127.0.0.1:49080/ws`), select the stations to receive:

```text
GET http://localhost:8080/stations?stations=KSEA_TWR,SEA_E_GND
```

The bridge connects for the request, disables RX on all existing TrackAudio stations, enables RX on the requested callsigns, and closes the websocket. Configure `TRACKAUDIO_WS_URL`, `TRACKAUDIO_CONNECT_TIMEOUT_MS`, and `TRACKAUDIO_MESSAGE_TIMEOUT_MS` through the environment when needed.

## Requirements

- Windows x64.
- [Bun](https://bun.sh/) for development and packaging.
- Microsoft Flight Simulator with SimConnect available.
- EuroScope and the appropriate profile when using `launch.bat`.

`node-simconnect` uses Node-compatible networking APIs and connects to the SimConnect service; keep the dependency files installed beside the source during development. The lexe package is an LLRT-based Node runtime and does not provide Bun APIs, so the packaged bridge is produced from a Node-compatible bundle rather than directly from TypeScript.

## Install and run from source

Install dependencies with Bun:

```sh
bun install
bun run typecheck
bun run lint
bun run start
```

The source application still uses Bun during development because its HTTP servers and TUI currently depend on Bun APIs. Lexe packaging is intended for the release artifact and requires the bundle step described below.

## Build a Windows release

Install the pinned lexe CLI from the project dependencies, then build:

```sh
bun install
bun run build
```

The default build uses Bun's Windows executable compiler and writes `out/fsd-bridge.exe`. The optional `bun run build:lexe` command creates an experimental LLRT executable, but it is not suitable for the complete bridge because the application depends on Bun APIs, Rezi native modules, and Node APIs that LLRT does not implement. Lexe does not support Bun's `--compile`, `--bytecode`, or `--windows-icon` flags; `app.ico` is used by the Bun build.

Lexe is based on LLRT and supports a smaller Node API surface than Node.js. In particular, its upstream documentation does not recommend it for HTTP services and it does not support Bun-specific APIs. Before distributing the executable, verify the generated artifact against the complete bridge runtime. If lexe cannot run the full bridge because of `Bun.serve`, the Rezi TUI, or native/runtime loading, retain the source Bun workflow and treat the lexe output as experimental rather than a drop-in replacement.

## Runtime files and launchers

Run the packaged bridge directly with:

```bat
run.bat
```

`run.bat` expects `out\\fsd-bridge.exe` and runs it with the output directory as the working directory. `launch.bat` starts the bridge, launches EuroScope with its profile, and terminates only the bridge executable when EuroScope exits. Set `BRIDGE_PATH`, `EUROSCOPE_PATH`, and `PROFILE_PATH` to override the defaults.

Keep any SimConnect runtime DLLs required by the installed MSFS/SimConnect setup in the location expected by the native dependency and Windows loader. A lexe executable is not assumed to embed arbitrary native DLLs or native Node addons; if the packaged runtime requires external files, distribute those files beside `out\\fsd-bridge.exe` and document their exact layout.

The following environment variables may be used to tune polling:

- `SIMCONNECT_FETCH_INTERVAL` (default `0.01` seconds)
- `FSD_DATA_FETCH_INTERVAL` (default `15` seconds)
- `FSD_DATA_REFILL_INTERVAL` (default `15` seconds)
- `PROXY_CORRELATION_INTERVAL` (default `1` second)
- `AIRCRAFT_TTL_SECONDS` (default `30` seconds)
- `SIMCONNECT_RECONNECT_DELAY` (default `5` seconds)

## APIs

- `GET http://localhost:8080/aircraft` returns `{ aircraft, camera }`.
- Movement and reset APIs are documented in [AIRCRAFT_MOVEMENT_API.md](AIRCRAFT_MOVEMENT_API.md).
- The TowerView frontend consumes the aircraft endpoint and can be run separately from the bridge.

## Development notes

The TypeScript implementation lives under [src/](src/) and the executable entrypoint is [index.ts](index.ts). Correlation logic is split between the FSD, proxy, and state modules. The old C++/CMake build is no longer the release path for the TypeScript branch.

## License

See the project license. SimConnect SDK components are subject to Microsoft's license terms.
