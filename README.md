# SimConnect + VATSIM Bridge

This project is a C++ bridge that connects Microsoft Flight Simulator (MSFS) via SimConnect to live VATSIM data, correlates aircraft, and exposes the merged data to a browser frontend via a WebSocket server.

## Features
- Polls live aircraft data from MSFS using SimConnect.
- Fetches and parses VATSIM JSON data every 10 seconds.
- Correlates SimConnect and VATSIM aircraft using configurable proximity logic.
- Maintains a live, thread-safe JSON map of all aircraft with both SimConnect and VATSIM fields.
- Exposes the full aircraft JSON map via a WebSocket server on `localhost`.

## Version History
0.2.1
- Added 'heading', 'transponder', 'transponder_asgn', and 'deptime' fields for aircraft JSON object.
- Removed 'registration' from the JSON output.
- VATSIM callsign-based refilling now updates all VATSIM fields every 60s for all aircraft with callsigns, not just those with empty fields.

0.2
- Added websocket at http://localhost:8080/aircraft
- fixed build.bat and CMakeLists.txt

0.1.1
- No longer showing each line of calculation of distance for every VATSIM pilot.
- Moved the build folder out by one level (now at project root).

0.1
- Initial commit.
- Correlation between SimConnect aircraft and VATSIM data.
- Full verbose debug output for calculating each VATSIM pilot's distance from each uncorrelated aircraft.

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
[
  {
    "altitude": 206,
    "arr": "LEPA",
    "callsign": "EXS53MP",
    "dep": "EGKK",
    "deptime": "1940",
    "groundspeed": 0,
    "heading": 1.34990309179687,
    "last_vatsim_update": 51527,
    "latitude": 51.1540300045559,
    "longitude": -0.164100018851852,
    "on_ground": 1,
    "simobjectid": 2599,
    "transponder": "1234",
    "transponder_asgn": "7270",
    "type": "B738",
    "verticalSpeed": 0
  },
  ...
]
```

## Customization
- Edit the correlation logic in `simconnect_bridge.cpp` to adjust matching rules.
- Extend the WebSocket server to support more endpoints or push updates.

## License
- See main project license. SimConnect SDK is subject to Microsoft EULA. 
