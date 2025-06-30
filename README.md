# SimConnect + VATSIM Bridge

This project is a C++ bridge that connects Microsoft Flight Simulator (MSFS) via SimConnect to live VATSIM data, correlates aircraft, and exposes the merged data to a browser frontend via a WebSocket server.

## Features
- Polls live aircraft data from MSFS using SimConnect.
- Fetches and parses VATSIM JSON data every 10 seconds.
- Correlates SimConnect and VATSIM aircraft using configurable proximity logic.
- Maintains a live, thread-safe JSON map of all aircraft with both SimConnect and VATSIM fields.
- Exposes the full aircraft JSON map via a WebSocket server on `localhost`.

## Building

1. **Requirements:**
   - CMake 3.10+
   - MSVC or compatible C++17 compiler
   - SimConnect SDK (headers and libraries are included)
   - [nlohmann/json](https://github.com/nlohmann/json) (header included)
   - [cpp-httplib](https://github.com/yhirose/cpp-httplib) (header-only, add `httplib.h` to `src/`)

2. **Build Steps:**
   - Open a terminal in `Towerview/src`.
   - Run:
     ```
     mkdir build
     cd build
     cmake ..
     cmake --build .
     ```
   - The executable `simconnect_bridge` will be created in the build output directory.

3. **DLLs:**
   - Ensure `SimConnect.dll` is present in the same directory as the executable (the build script copies it automatically).

## Running

- Run the bridge executable:
  ```
  ./simconnect_bridge
  ```
- The app will start polling MSFS and VATSIM, correlating aircraft, and serving data.

## Accessing Aircraft Data

- The WebSocket server runs on `ws://localhost:8080` (or the port you configure).
- To get the full aircraft JSON dump, connect to the WebSocket and send a request (see code for endpoint details).
- You can also extend the server to support HTTP GET requests for `/aircraft` if needed.

## Example JSON Output
```json
{
  "123": {
    "simobjectid": 123,
    "callsign": "AAL123",
    "latitude": 37.6188056,
    "longitude": -122.3754167,
    "altitude": 35000,
    "groundspeed": 450,
    "verticalSpeed": 0,
    "on_ground": 0,
    "type": "B738",
    "registration": "N123AA",
    "dep": "KSFO",
    "arr": "KLAX"
  },
  ...
}
```

## Customization
- Edit the correlation logic in `simconnect_bridge.cpp` to adjust matching rules.
- Extend the WebSocket server to support more endpoints or push updates.

## License
- See main project license. SimConnect SDK is subject to Microsoft EULA. 