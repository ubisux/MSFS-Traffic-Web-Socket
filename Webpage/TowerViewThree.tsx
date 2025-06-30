import CopyButton from "@/app/[locale]/(auth)/dashboard/CopyButton";
import {
  vhhh,
  vhhhGates,
  vhhx,
  vmmc,
} from "@/app/[locale]/(public)/viewer/tower/geojson";
import { useTrackAudio } from "@/lib/trackaudio";
import { Html, Line } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { toMercator, toWgs84 } from "@turf/projection";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Clipboard, Moon, Sun } from "react-feather";
import { PerspectiveCamera } from "three";

// Use the same offset as in the Babylon version.
const offset = [0, 0];
// const offset = toMercator([113.921386, 22.310572]);

// ----- CameraControls -----
// Simple WASD + mouse drag controls (adapted from earlier TowerViewThree.tsx)
function CameraControls() {
  const { camera, gl } = useThree();
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey) return;
      switch (e.code) {
        case "KeyW":
          keys.current.forward = true;
          break;
        case "KeyS":
          keys.current.backward = true;
          break;
        case "KeyA":
          keys.current.left = true;
          break;
        case "KeyD":
          keys.current.right = true;
          break;
        case "Space":
          keys.current.up = true;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.down = true;
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          keys.current.forward = false;
          break;
        case "KeyS":
          keys.current.backward = false;
          break;
        case "KeyA":
          keys.current.left = false;
          break;
        case "KeyD":
          keys.current.right = false;
          break;
        case "Space":
          keys.current.up = false;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.down = false;
          break;
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      const rotationSpeed = 0.005;
      camera.rotation.y -= deltaX * rotationSpeed;
      camera.rotation.x -= deltaY * rotationSpeed;
    };
    const onPointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    gl.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      gl.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [camera, gl]);

  const speed = 10;
  useFrame(() => {
    const cos = Math.cos(camera.rotation.y);
    const sin = Math.sin(camera.rotation.y);
    if (keys.current.forward) {
      camera.position.x += -sin * speed;
      camera.position.z += -cos * speed;
    }
    if (keys.current.backward) {
      camera.position.x += sin * speed;
      camera.position.z += cos * speed;
    }
    if (keys.current.left) {
      camera.position.x += -cos * speed;
      camera.position.z += sin * speed;
    }
    if (keys.current.right) {
      camera.position.x += cos * speed;
      camera.position.z += -sin * speed;
    }
    if (keys.current.up) camera.position.y += speed;
    if (keys.current.down) camera.position.y -= speed;
  });
  return null;
}

// ----- SyncCamera -----
// Syncs the camera parameters from the Three.js camera to local state
interface CameraState {
  lon: number;
  lat: number;
  alt: number;
  heading: number;
  pitch: number;
  roll: number;
  fov: number;
}
function SyncCamera({
  setCameraState,
}: {
  setCameraState: (s: CameraState) => void;
}) {
  const { camera } = useThree();

  useFrame(() => {
    // Convert current position from mercator to WGS84.
    const wgs = toWgs84([
      camera.position.x + offset[0],
      camera.position.z + offset[1],
    ]);
    setCameraState({
      lon: -wgs[0],
      lat: wgs[1],
      alt: camera.position.y,
      heading: -((camera.rotation.y * 180) / Math.PI + 180) % 360,
      pitch: (camera.rotation.x * 180) / Math.PI,
      roll: (camera.rotation.z * 180) / Math.PI,
      fov: (camera as PerspectiveCamera).fov,
    });
  });
  return null;
}

// ----- Aircraft Marker -----
function AircraftMarker({
  id,
  value,
  transmitting,
  dark,
  detailsVisible,
  cdmData,
}: Readonly<{
  id: string;
  value: any;
  transmitting: string[];
  dark: boolean;
  detailsVisible: boolean;
  cdmData?: CDMData;
}>) {
  // Convert lon/lat to mercator and then adjust for global offset.
  const m = toMercator([value.longitude, value.latitude]);
  const position: [number, number, number] = [
    -(m[0] - offset[0]),
    value.altitude * 0.3048 + 30,
    m[1] - offset[1],
  ];

  const { camera } = useThree();
  const dx = position[0] - camera.position.x;
  const dz = position[2] - camera.position.z;
  const distance = Math.sqrt(dx * dx + dz * dz);
  if (distance > 5000) return null; // Hide markers further than 5km.

  const gate =
    (value.dep === "VHHH" || value.arr === "VHHH") &&
    vhhhGates
      .map((gate) => {
        const gatePos = toMercator([gate[2], gate[1]]);
        const dx = gatePos[0] - m[0];
        const dz = gatePos[1] - m[1];
        const distance = Math.sqrt(dx * dx + dz * dz);
        return { gate: gate[0], distance };
      })
      .filter((x) => x.distance < 50)
      .sort((a, b) => a.distance - b.distance)[0]?.gate;

  const content = ["VHHH", "VHHX", "VMMC"].includes(value.arr) ? (
    // Arrival marker styling.
    <div className="flex opacity-90">
      <div>
        <div className="z-10 flex-grow-0 bg-primary aspect-square">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="28px"
            viewBox="0 -960 960 960"
            width="28px"
            fill="#fff"
          >
            <path d="M172-172v-28h616v28H172Zm553-190L172-524v-226l47 14 44 131 171 50-32-323 62 18 117 348 170 50q16 5 26.5 18.5T788-413q0 23-18.5 41T725-362Z" />
          </svg>
        </div>
      </div>
      <div
        className={`leading-none px-2 py-1 shadow ${dark ? "bg-black text-white" : "bg-white"}`}
      >
        <p
          className={`text-lg/none font-semibold ${transmitting.includes(id) ? "text-[#ff6900]" : ""}`}
        >
          {id}
        </p>
        <p className="text-[0.625rem]">{value.registration}</p>
        <p className="text-[0.625rem]">
          {value.type?.replace(/^H\//, "").split("/")[0] ?? ""} {gate}
        </p>
      </div>
    </div>
  ) : ["VHHH", "VHHX", "VMMC"].includes(value.dep) ? (
    // Departure marker styling.
    <div className="flex opacity-90">
      <div>
        <div className="z-10 flex-grow-0 bg-yellow-300 aspect-square">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="28px"
            viewBox="0 -960 960 960"
            width="28px"
            fill="#000"
          >
            <path d="M172-172v-28h616v28H172Zm48-196L104-562l47-12 105 90 173-45-194-261 62-16 280 238 171-45q20-5 38.5 6t23.5 31q5 20-4 38.5T777-514L220-368Z" />
          </svg>
        </div>
      </div>
      <div
        className={`leading-none whitespace-nowrap px-2 py-1 shadow ${dark ? "bg-black text-white" : "bg-white"}`}
      >
        <p
          className={`text-lg/none font-semibold ${transmitting.includes(id) ? "text-[#ff6900]" : ""}`}
        >
          {id}
        </p>
        <p className="text-[0.625rem]">{value.registration}</p>
        <p className="text-[0.625rem]">
          {value.arr} {value.depRwy}
        </p>
      </div>
    </div>
  ) : (
    // Generic marker.
    <div
      className={`leading-none flex opacity-60 p-1 shadow ${dark ? "bg-black text-white" : "bg-white"}`}
    >
      {id}
    </div>
  );

  const detailsTagContent = (
    <div className="leading-none flex flex-col px-1 pb-0.5 shadow opacity-80 border border-white bg-[black] text-white whitespace-nowrap">
      <p className="text-sm border-b border-b-white/50">
        {id}
        {value.registration ? ` /${value.registration}` : ""}{" "}
        {gate && <span className="border-2 border-white">{gate}</span>}
      </p>
      <p className="text-[0.625rem] py-0.5 font-light border-b border-b-white/50">
        SOBT: {cdmData && `${value.eobt.slice(0, 2)}:${value.eobt.slice(2)}`}
      </p>
      <p className="text-[0.625rem] py-0.5 font-light border-b border-b-white/50">
        ACFT:{" "}
      </p>
      <p className="text-[0.625rem] py-0.5 font-light border-b border-b-white/50">
        TOBT:{" "}
        {cdmData && `${cdmData.tobt.slice(0, 2)}:${cdmData.tobt.slice(2)}`}
      </p>
      <p className="text-[0.625rem] py-0.5 font-light border-b border-b-white/50">
        TSAT:{" "}
        {cdmData && `${cdmData.tsat.slice(0, 2)}:${cdmData.tsat.slice(2)}`}
      </p>
      <p className="text-[0.625rem] py-0.5 font-light border-b border-b-white/50">
        ASAT:{" "}
      </p>
      <p className="text-[0.625rem] py-0.5 font-light border-b border-b-white/50">
        AOBT:{" "}
      </p>
      <p className="text-[0.625rem] py-0.5 font-light border-b border-b-white/50">
        RHD: VHK
      </p>
      <p className="text-[0.625rem] py-0.5 font-light border-b border-b-white/50">
        LHR: VHK
      </p>
    </div>
  );

  return (
    <group position={position}>
      <Html
        style={{ transform: "translate(-50%,-100%)" }}
        className="flex flex-col items-center gap-4"
      >
        {detailsVisible && detailsTagContent}
        {content}
      </Html>
      {/* Vertical line from aircraft to ground */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, -30, 0, 0, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="white" />
      </line>
    </group>
  );
}

// ----- Guide Line -----
// Renders a line from a GeoJSON feature.
function GuideLine({
  feature,
  elevation,
}: Readonly<{
  feature: any;
  elevation: number;
}>) {
  const points = feature.geometry.coordinates.map((p: any) => {
    const m = toMercator(p);
    return [-(m[0] - offset[0]), elevation * 0.3048, m[1] - offset[1]];
  });
  return <Line points={points} color="#ff00c7" lineWidth={1} />;
}

// ----- CDM Data -----
interface CDMData {
  callsign: string;
  tobt: string;
  tsat: string;
}
function useCDM() {
  const [data, setData] = useState<CDMData[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://vathk.com/cdm/CDM_data_VHHH.json")
        .then((res) => res.json())
        .then((x) => setData(x.flights));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return data;
}

// ----- Main Tower View Component -----
interface TowerViewProps {
  data: [string, any][];
  options: {
    lat: number;
    lon: number;
    alt: number;
    heading: number;
    pitch: number;
    roll: number;
    fov: number;
    guides: boolean;
    dark: boolean;
  };
}
export default function TowerViewThree({
  data,
  options,
}: Readonly<TowerViewProps>) {
  // Local state for overlay controls.
  const [guidesVisible, setGuidesVisible] = useState(options.guides);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [dark, setDark] = useState(options.dark);
  const [cameraState, setCameraState] = useState<CameraState | null>(null);
  // Save the camera reference from Canvas.
  const [cameraInstance, setCameraInstance] =
    useState<PerspectiveCamera | null>(null);

  const { tx } = useTrackAudio();
  const transmitting = useMemo(() => tx.map((x) => x.callsign), [tx]);

  const cdmData = useCDM();

  // Compute the initial camera position.
  const pos = toMercator([options.lon, options.lat]);

  // Three.js camera expects fov in degrees.
  return (
    <>
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{
          position: [-(pos[0] - offset[0]), options.alt, pos[1] - offset[1]],
          rotation: [
            (options.pitch * Math.PI) / 180,
            -((options.heading + 180) * Math.PI) / 180,
            (options.roll * Math.PI) / 180,
            "YXZ",
          ],
          fov: options.fov,
          far: 10000,
        }}
        onCreated={({ camera }) => {
          setCameraInstance(camera as PerspectiveCamera);
        }}
      >
        <CameraControls />
        <SyncCamera setCameraState={setCameraState} />
        <ambientLight />
        {/* Render guide lines if enabled */}
        {guidesVisible && (
          <>
            {vhhh.features.map((feature: any, i: number) => (
              <GuideLine key={i} feature={feature} elevation={28} />
            ))}
            {vhhx.features.map((feature: any, i: number) => (
              <GuideLine key={i} feature={feature} elevation={30} />
            ))}
            {vmmc.features.map((feature: any, i: number) => (
              <GuideLine key={i} feature={feature} elevation={20} />
            ))}
          </>
        )}
        {/* Render each aircraft marker */}
        {data.map(([id, value]) => (
          <AircraftMarker
            key={id}
            id={id}
            value={value}
            transmitting={transmitting}
            dark={dark}
            detailsVisible={detailsVisible}
            cdmData={cdmData.find((x) => x.callsign === id)}
          />
        ))}
      </Canvas>
      <div className="absolute top-0 right-0 flex-col items-end hidden p-4 mx-auto text-sm group-hover:flex bg-opacity-80">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setGuidesVisible((prev) => !prev)}
            className="px-1 text-white rounded-md bg-primary"
          >
            Toggle Guides
          </button>
          <button
            onClick={() => setDark((prev) => !prev)}
            className="px-1 text-white rounded-md bg-primary"
          >
            {dark ? <Moon width={"1rem"} /> : <Sun width={"1rem"} />}
          </button>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          <button
            onClick={() => setDetailsVisible((prev) => !prev)}
            className="px-1 text-white rounded-md bg-primary"
          >
            Toggle Details
          </button>
          {cameraInstance && cameraState && (
            <CopyButton
              className="px-1 py-0 text-white rounded-md bg-primary"
              displayText="Copy Params"
              value={new URLSearchParams({
                lon: cameraState.lon.toFixed(6),
                lat: cameraState.lat.toFixed(6),
                alt: cameraState.alt.toFixed(2),
                heading: cameraState.heading.toFixed(2),
                pitch: cameraState.pitch.toFixed(2),
                roll: cameraState.roll.toFixed(2),
                fov: cameraState.fov.toFixed(2),
                ...(dark && { dark: "" }),
                ...(guidesVisible && { guides: "" }),
              }).toString()}
            >
              <Clipboard width={"1rem"} />
            </CopyButton>
          )}
        </div>
        {cameraInstance && cameraState && (
          <div
            className="mt-2 text-right text-white"
            style={{
              textShadow:
                "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
            }}
          >
            <p>
              Lon:{" "}
              <input
                value={cameraState.lon.toFixed(6)}
                type="number"
                onChange={(e) => {
                  if (cameraInstance) {
                    const newLon = +e.target.value;
                    const currentWgs = toWgs84([
                      cameraInstance.position.x + offset[0],
                      cameraInstance.position.z + offset[1],
                    ]);
                    const converted = toMercator([newLon, currentWgs[1]]);
                    cameraInstance.position.x = -(converted[0] - offset[0]);
                  }
                }}
                className="w-24"
                style={{
                  textShadow:
                    "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                }}
              />
            </p>
            <p>
              Lat:{" "}
              <input
                value={cameraState.lat.toFixed(6)}
                type="number"
                onChange={(e) => {
                  if (cameraInstance) {
                    const newLat = +e.target.value;
                    const currentWgs = toWgs84([
                      cameraInstance.position.x + offset[0],
                      cameraInstance.position.z + offset[1],
                    ]);
                    const converted = toMercator([currentWgs[0], newLat]);
                    cameraInstance.position.z = converted[1] - offset[1];
                  }
                }}
                className="w-24"
                style={{
                  textShadow:
                    "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                }}
              />
            </p>
            <p>
              Alt (m):{" "}
              <input
                value={cameraState.alt.toFixed(2)}
                type="number"
                onChange={(e) => {
                  if (cameraInstance) {
                    cameraInstance.position.y = +e.target.value;
                  }
                }}
                className="w-24"
                style={{
                  textShadow:
                    "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                }}
              />
            </p>
            <p>
              Heading:{" "}
              <input
                value={cameraState.heading.toFixed(2)}
                type="number"
                onChange={(e) => {
                  if (cameraInstance) {
                    cameraInstance.rotation.y =
                      -((+e.target.value + 180) * Math.PI) / 180;
                  }
                }}
                className="w-24"
                style={{
                  textShadow:
                    "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                }}
              />
            </p>
            <p>
              Pitch:{" "}
              <input
                value={cameraState.pitch.toFixed(2)}
                type="number"
                onChange={(e) => {
                  if (cameraInstance) {
                    cameraInstance.rotation.x =
                      (+e.target.value * Math.PI) / 180;
                  }
                }}
                className="w-24"
                style={{
                  textShadow:
                    "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                }}
              />
            </p>
            <p>
              Roll:{" "}
              <input
                value={cameraState.roll.toFixed(2)}
                type="number"
                onChange={(e) => {
                  if (cameraInstance) {
                    cameraInstance.rotation.z =
                      (+e.target.value * Math.PI) / 180;
                  }
                }}
                className="w-24"
                style={{
                  textShadow:
                    "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                }}
              />
            </p>
            <p>
              FOV:{" "}
              <input
                value={cameraState.fov.toFixed(2)}
                type="number"
                onChange={(e) => {
                  if (cameraInstance) {
                    cameraInstance.fov = +e.target.value;
                    cameraInstance.updateProjectionMatrix();
                  }
                }}
                className="w-24"
                style={{
                  textShadow:
                    "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                }}
              />
            </p>
          </div>
        )}
      </div>
    </>
  );
}
