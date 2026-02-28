# SimConnect + VATSIM Bridge

This project is a C++ bridge that connects Microsoft Flight Simulator (MSFS) via SimConnect to live VATSIM data, correlates aircraft, and exposes the merged data to a browser frontend via a WebSocket server.

## Features

- Polls live aircraft data from MSFS using SimConnect.
- Fetches and parses ES Proxy data and VATSIM JSON data at a configurable interval.
- Correlates SimConnect and ES+VATSIM aircraft using proximity logic.
- Maintains a live, thread-safe JSON map of all aircraft with both SimConnect and VATSIM fields.
- Exposes the full correlated aircraft JSON map via a WebSocket server on localhost.
- Exposes current user aircraft and camera via a WebSocket server on localhost.
- Teleports user aircraft and reset camera location using SimConnect via a WebSocket server on localhost.

## Version History

0.7.2

- Fixed esproxy port permission issues by using dynamic port allocation

0.7.1

- Fixed Camera Reset button using "CAMERA REQUEST ACTION" simvar.

0.7

- Added added aircraft object TTL to avoid JSON object being deleted when MSFS redraws simobjects.
- Now using cockpit camera. Use with blank aircraft mod with no cockpit if required.
- Added injection of camera position from endpoint <http://localhost:8081/move> through teleporting the aircraft, triggered through button, with 3DOF position, heading, pitch, cockpit cam zoom factor.
- Added camera reset through endpoint <http://localhost:8081/reset>

0.6

- Added camera position detection, served as "camera" object in websocket.
- Added arrival (Star and Gates) detection.

0.5

- Added ES Proxy as main callsign correlation source, falling back to VATSIM data if no ES Proxy connection.
- Added detection of depRwy and depSID.
- Fixed tags with Towerview frontend.

0.4.1

- Adjusted correlation logic due to on_ground status from Simconnect being inaccurate.
- Updated Towerview (Typescript) code.

0.4

- Added logging of position history for the past 60s to correlate with Vatsim due to vatsim update frequency, using lateral and vertical distance factors, giving better accuracy.
- Removed recorrelation logic.

0.3

- Added Typesrcript (Node.js) frontend

0.2.1

- Added 'heading', 'transponder', 'transponder_asgn', and 'deptime' fields for aircraft JSON object.
- Removed 'registration' from the JSON output.
- VATSIM callsign-based refilling now updates all VATSIM fields every 60s for all aircraft with callsigns, not just those with empty fields.

0.2

- Added websocket at <http://localhost:8080/aircraft>
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

## Running the TypeScript/React Frontend Locally

To run and test the web frontend (TypeScript/React) locally:

1. **Install Dependencies**

   Open a terminal in the project root (where your `package.json` is) and run:

   ```sh
   npm install
   ```

   This will install all dependencies listed in `package.json`.

   If you do not have a `package.json`, you can create one and install the necessary packages for a React + TypeScript project:

   ```sh
   npm init -y
   npm install react react-dom
   npm install --save-dev typescript @types/react @types/react-dom
   ```

   If you are using Next.js (recommended for this project):

   ```sh
   npm install next
   npm install --save-dev typescript @types/react @types/node
   ```

2. **Check/Initialize TypeScript**

   If you don't have a `tsconfig.json`, create one:

   ```sh
   npx tsc --init
   ```

   Or, if using Next.js, just run `npm run dev` once and it will create a default `tsconfig.json` for you.

3. **Start the Development Server**
   - For Next.js:

     ```sh
     npm run dev
     ```

     (If you don't have a `package.json` with scripts, add this to your `package.json` under "scripts":)

     ```json
     "scripts": {
       "dev": "next dev"
     }
     ```

   - For Create React App:

     ```sh
     npm start
     ```

     (If you don't have a `package.json` with scripts, add this:)

     ```json
     "scripts": {
       "start": "react-scripts start"
     }
     ```

4. **Open in Browser**

   Once the server is running, open your browser and go to:

   ```
   http://localhost:3000
   ```

   (or whatever port your dev server reports).

5. **Troubleshooting**
   - If you see errors about missing modules, install them with `npm install <module-name>`.
   - If you see TypeScript errors about missing types, install them with `npm install --save-dev @types/<module-name>`.

**Summary:**

- Run `npm install`
- Run `npm run dev` (for Next.js) or `npm start` (for Create React App)
- Open your browser to `http://localhost:3000`
