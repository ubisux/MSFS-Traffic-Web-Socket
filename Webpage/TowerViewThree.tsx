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
    const onWheel = (e: WheelEvent) => {
      const perspCam = camera as PerspectiveCamera;
      if (e.deltaY < 0) {
        // Scroll up: zoom in (decrease FOV)
        perspCam.fov = Math.max(10, perspCam.fov - 1.0);
        perspCam.updateProjectionMatrix();
      } else if (e.deltaY > 0) {
        // Scroll down: zoom out (increase FOV)
        perspCam.fov = Math.min(120, perspCam.fov + 1.0);
        perspCam.updateProjectionMatrix();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    gl.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    gl.domElement.addEventListener("wheel", onWheel);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      gl.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      gl.domElement.removeEventListener("wheel", onWheel);
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
  tagDistance,
}: Readonly<{
  id: string;
  value: any;
  transmitting: string[];
  dark: boolean;
  detailsVisible: boolean;
  cdmData?: CDMData;
  tagDistance: number;
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
  if (distance > tagDistance) return null; // Hide markers further than tagDistance.

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

  // Add these states inside the main component (where cameraInstance and cameraState are defined):
  const [lonInput, setLonInput] = useState<string | undefined>(undefined);
  const [latInput, setLatInput] = useState<string | undefined>(undefined);
  const [altInput, setAltInput] = useState<string | undefined>(undefined);
  const [altMSFSInput, setAltMSFSInput] = useState<string | undefined>(undefined);
  const [headingInput, setHeadingInput] = useState<string | undefined>(undefined);
  const [pitchInput, setPitchInput] = useState<string | undefined>(undefined);
  const [rollInput, setRollInput] = useState<string | undefined>(undefined);
  const [fovInput, setFovInput] = useState<string | undefined>(undefined);
  const [fovRadInput, setFovRadInput] = useState<string | undefined>(undefined);

  // Three.js camera expects fov in degrees.

  // Add at the top of the component (after other useState):
  const backgroundColors = [
    "rgba(0,0,0,0)", // Default transparent
    "#000000", // K
    "#ffffff", // W
    "#ff0000", // R
    "#00ff00", // G
    "#0000ff", // B
    "#00ffff", // C
    "#ffff00", // Y
    "#ff00ff", // M
  ];
  const [bgIndex, setBgIndex] = useState(0); // Start with transparent
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [calibrationImage, setCalibrationImage] = useState<string | null>(null);
  const [calibrationPoints, setCalibrationPoints] = useState<
    { x: number; y: number; lat: string; lon: string; alt: string }[]
  >([]);
  const [activePointIdx, setActivePointIdx] = useState<number | null>(null);

  // Helper for validation
  const isPointValid = (pt: { lat: string; lon: string; alt: string }) =>
    pt.lat !== '' && pt.lon !== '' &&
    !isNaN(Number(pt.lat)) && !isNaN(Number(pt.lon));

  const confirmedPointsCount = calibrationPoints.filter(isPointValid).length;

  // Show Calculate button if at least 2 points and the 2nd (most recent) is valid
  const showCalculate = calibrationPoints.length >= 2 && isPointValid(calibrationPoints[1]);

  // Add at the top of the component (after other useState):
  const [calculationResult, setCalculationResult] = useState<null | {
    heading: number;
    pitch: number;
    roll: number;
  }>(null);

  // Add refreshRate state and aircraft fetching logic here
  const [refreshRate, setRefreshRate] = useState(10); // Hz, default 10
  const minHz = 1;
  const maxHz = 10;
  const [aircrafts, setAircrafts] = useState<any[]>([]);

  // Tag visibility distance state
  const [tagDistance, setTagDistance] = useState(5000); // metres, default 5000

  useEffect(() => {
    let timer: any;
    const fetchAircraft = async () => {
      try {
        const res = await fetch("http://localhost:8080/aircraft");
        if (!res.ok) {
          setAircrafts([]);
          return;
        }
        let data: any = [];
        try {
          data = await res.json();
        } catch (e) {
          console.warn("/aircraft response was not valid JSON or was empty");
          setAircrafts([]);
          return;
        }
        // Expecting data to be an array or object of aircrafts
        if (Array.isArray(data)) {
          setAircrafts(data);
        } else if (data && typeof data === "object" && Object.keys(data).length > 0) {
          setAircrafts(Object.entries(data));
        } else {
          setAircrafts([]);
          if (data && typeof data === "object") {
            console.warn("/aircraft response was an empty object");
          }
        }
      } catch (e) {
        setAircrafts([]);
        console.warn("Error fetching /aircraft:", e);
      }
      // Calculate interval in ms from Hz (Hz can be < 1)
      const interval = 1000 / Math.max(refreshRate, minHz);
      timer = setTimeout(fetchAircraft, interval);
    };
    fetchAircraft();
    return () => clearTimeout(timer);
  }, [refreshRate]);

  // --- Camera orientation solver for 2 points ---
  function solveCameraRotationFrom2Points({
    cameraPos,
    fov,
    imageSize,
    worldPoints,
    imagePoints,
  }: {
    cameraPos: number[];
    fov: number;
    imageSize: [number, number];
    worldPoints: number[][];
    imagePoints: number[][];
  }) {
    // 1. Compute direction vectors from camera to world points
    const dirs3D = worldPoints.map((p: number[]) => {
      const v = [p[0] - cameraPos[0], p[1] - cameraPos[1], p[2] - cameraPos[2]];
      const len = Math.hypot(...v);
      return v.map((x: number) => x / len);
    });
    // 2. Compute direction vectors in camera/image space
    const [width, height] = imageSize;
    const fy = height / (2 * Math.tan((fov * Math.PI) / 360));
    const fx = fy;
    const cx = width / 2;
    const cy = height / 2;
    const dirs2D = imagePoints.map((pt: number[]) => {
      // Convert image pixel to normalized camera direction
      const dx = (pt[0] - cx) / fx;
      const dy = (pt[1] - cy) / fy;
      const dz = 1;
      const v = [dx, dy, dz];
      const len = Math.hypot(...v);
      return v.map((x: number) => x / len);
    });
    // 3. Find rotation matrix that aligns dirs3D to dirs2D
    const a = dirs3D[0], b = dirs3D[1];
    const a2 = dirs2D[0], b2 = dirs2D[1];
    
    function cross(u: number[], v: number[]): number[] {
      return [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
    }
    function dot(u: number[], v: number[]): number { return u[0]*v[0]+u[1]*v[1]+u[2]*v[2]; }
    function normalize(u: number[]): number[] {
      const l = Math.hypot(...u);
      return u.map((x: number) => x/l);
    }
    function matVecMul(M: number[][], v: number[]): number[] {
      return [
        M[0][0]*v[0]+M[0][1]*v[1]+M[0][2]*v[2],
        M[1][0]*v[0]+M[1][1]*v[1]+M[1][2]*v[2],
        M[2][0]*v[0]+M[2][1]*v[1]+M[2][2]*v[2],
      ];
    }
    function matMul3(A: number[][], B: number[][]): number[][] {
      return [
        matVecMul(A, [B[0][0],B[1][0],B[2][0]]),
        matVecMul(A, [B[0][1],B[1][1],B[2][1]]),
        matVecMul(A, [B[0][2],B[1][2],B[2][2]]),
      ].map((col: number[]) => [col[0],col[1],col[2]]);
    }
    
    // Move these helpers outside the if blocks
    function matAdd(A: number[][], B: number[][]): number[][] { return A.map((r, i) => r.map((v, j) => v + B[i][j])); }
    function matScale(A: number[][], s: number): number[][] { return A.map((r) => r.map((v) => v * s)); }
    function matMul(A: number[][], B: number[][]): number[][] {
      return A.map((r, i) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
    }
    
    // Find rotation that aligns a->a2 and b->b2
    // First, rotate a to a2
    const v1 = cross(a, a2);
    const s1 = Math.hypot(...v1);
    const c1 = dot(a, a2);
    let R1;
    if (s1 < 1e-8) {
      R1 = [[1,0,0],[0,1,0],[0,0,1]];
    } else {
      // Rodrigues' rotation formula
      const k = normalize(v1);
      const K = [
        [0, -k[2], k[1]],
        [k[2], 0, -k[0]],
        [-k[1], k[0], 0],
      ];
      const I = [[1,0,0],[0,1,0],[0,0,1]];
      const K2 = matMul(K, K);
      R1 = matAdd(matAdd(I, matScale(K, s1)), matScale(K2, (1-c1)));
    }
    
    // Apply R1 to b
    const b1 = matVecMul(R1, b);
    
    // Now, rotate b1 to b2 around a2
    const v2 = cross(b1, b2);
    const s2 = Math.hypot(...v2);
    const c2 = dot(b1, b2);
    let R2;
    if (s2 < 1e-8) {
      R2 = [[1,0,0],[0,1,0],[0,0,1]];
    } else {
      const k = normalize(a2);
      const K = [
        [0, -k[2], k[1]],
        [k[2], 0, -k[0]],
        [-k[1], k[0], 0],
      ];
      const I = [[1,0,0],[0,1,0],[0,0,1]];
      const K2 = matMul(K, K);
      R2 = matAdd(matAdd(I, matScale(K, s2)), matScale(K2, (1-c2)));
    }
    
    // Final rotation: R = R2 * R1
    const R = matMul3(R2, R1);
    
    // Convert rotation matrix to Euler angles (YXZ order: yaw, pitch, roll)
    let pitch, yaw, roll;
    if (R[2][0] < 1) {
      if (R[2][0] > -1) {
        pitch = Math.asin(-R[2][0]);
        yaw = Math.atan2(R[2][1], R[2][2]);
        roll = Math.atan2(R[1][0], R[0][0]);
      } else {
        // R[2][0] == -1
        pitch = Math.PI/2;
        yaw = -Math.atan2(-R[1][2], R[1][1]);
        roll = 0;
      }
    } else {
      // R[2][0] == 1
      pitch = -Math.PI/2;
      yaw = Math.atan2(-R[1][2], R[1][1]);
      roll = 0;
    }
    return {
      pitch: pitch * 180 / Math.PI,
      yaw: yaw * 180 / Math.PI,
      roll: roll * 180 / Math.PI,
    };
  }

  return (
    <>
      {/* Calibration overlay (lowest layer, not blocking UI) */}
      {calibrationMode && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.1)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      )}
      {/* Main content (UI, 3D, etc.) */}
      <div
        className="relative overflow-hidden w-[1920px] h-[1080px] group"
        style={calibrationMode && calibrationImage ? {
          backgroundImage: `url(${calibrationImage})`,
          backgroundSize: '100% 100%',
          backgroundPosition: '0 0',
          backgroundRepeat: 'no-repeat',
        } : {}}
        onClick={calibrationMode ? (e) => {
          // Only block adding a new point if there are 2 points and no point is active
          if (calibrationPoints.length >= 2 && activePointIdx === null) return;
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          if (activePointIdx === null) {
            // Add and activate new point
            setCalibrationPoints(points => [...points, { x, y, lat: '', lon: '', alt: '' }]);
            setActivePointIdx(calibrationPoints.length);
          } else {
            // Move active point
            setCalibrationPoints(points => points.map((pt, idx) =>
              idx === activePointIdx ? { ...pt, x, y } : pt
            ));
          }
        } : undefined}
      >
        {/* Refresh Rate Controls (show on hover) */}
        <div className="absolute top-0 left-0 p-4 group-hover:block hidden z-20" style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8 }}>
          <label className="text-white text-xs" style={{ marginRight: 8 }}>
            Refresh Rate (Hz):
          </label>
          <input
            type="number"
            min={minHz}
            max={maxHz}
            step={1}
            value={refreshRate}
            onChange={e => {
              let v = Math.round(Number(e.target.value));
              if (isNaN(v)) v = minHz;
              v = Math.max(minHz, Math.min(maxHz, v));
              setRefreshRate(v);
            }}
            className="w-16 px-1 text-sm text-white rounded-md bg-primary border border-white"
            style={{ marginRight: 8 }}
          />
          <input
            type="range"
            min={minHz}
            max={maxHz}
            step={1}
            value={refreshRate}
            onChange={e => setRefreshRate(Math.round(Number(e.target.value)))}
            style={{ width: 120, verticalAlign: 'middle' }}
          />
          {/* Tag Distance Slider */}
          <div style={{ marginTop: 16 }}>
            <label className="text-white text-xs" style={{ marginRight: 8 }}>
              Tag Visible Distance (m):
            </label>
            <input
              type="number"
              min={1000}
              max={180000}
              step={100}
              value={tagDistance}
              onChange={e => {
                let v = Math.round(Number(e.target.value));
                if (isNaN(v)) v = 1000;
                v = Math.max(1000, Math.min(180000, v));
                setTagDistance(v);
              }}
              className="w-24 px-1 text-sm text-white rounded-md bg-primary border border-white"
              style={{ marginRight: 8 }}
            />
            <input
              type="range"
              min={1000}
              max={180000}
              step={100}
              value={tagDistance}
              onChange={e => setTagDistance(Math.round(Number(e.target.value)))}
              style={{ width: 180, verticalAlign: 'middle' }}
            />
          </div>
        </div>
        <div style={{ background: backgroundColors[bgIndex], width: "100vw", height: "100vh" }}>
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
            {Array.isArray(aircrafts) && aircrafts.map((aircraft) => (
              <AircraftMarker
                key={aircraft.simobjectid}
                id={aircraft.callsign || aircraft.simobjectid}
                value={aircraft}
                transmitting={transmitting}
                dark={dark}
                detailsVisible={detailsVisible}
                cdmData={cdmData.find((x) => x.callsign === (aircraft.callsign || aircraft.simobjectid))}
                tagDistance={tagDistance}
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
                onClick={() => setCalibrationMode((prev) => !prev)}
                className="px-1 text-white rounded-md bg-primary"
              >
                {calibrationMode ? "Exit Calibration" : "Calibrate Camera"}
              </button>
              <button
                onClick={() => setBgIndex((prev) => (prev + 1) % backgroundColors.length)}
                className="px-1 text-white rounded-md bg-primary"
              >
                Toggle Background
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
                  Lon: {" "}
                  <input
                    value={lonInput !== undefined ? lonInput : cameraState.lon.toFixed(6)}
                    type="number"
                    step="0.005"
                    onChange={(e) => {
                      setLonInput(e.target.value);
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
                    onBlur={() => setLonInput(undefined)}
                    className="w-24"
                    style={{
                      textShadow:
                        "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                    }}
                  />
                </p>
                <p>
                  Lat: {" "}
                  <input
                    value={latInput !== undefined ? latInput : cameraState.lat.toFixed(6)}
                    type="number"
                    step="0.005"
                    onChange={(e) => {
                      setLatInput(e.target.value);
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
                    onBlur={() => setLatInput(undefined)}
                    className="w-24"
                    style={{
                      textShadow:
                        "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                    }}
                  />
                </p>
                <p>
                  Alt (m): {" "}
                  <input
                    value={altInput !== undefined ? altInput : cameraState.alt.toFixed(2)}
                    type="number"
                    step="0.5"
                    onChange={(e) => {
                      setAltInput(e.target.value);
                      setAltMSFSInput((+e.target.value / 1.088).toFixed(2));
                      if (cameraInstance) {
                        cameraInstance.position.y = +e.target.value;
                      }
                    }}
                    onBlur={() => setAltInput(undefined)}
                    className="w-24"
                    style={{
                      textShadow:
                        "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                    }}
                  />
                </p>
                <p>
                  Alt (MSFS, m): {" "}
                  <input
                    value={altMSFSInput !== undefined ? altMSFSInput : (cameraState.alt * 3.28084).toFixed(2)}
                    type="number"
                    step="1"
                    onChange={(e) => {
                      setAltMSFSInput(e.target.value);
                      const meters = (+e.target.value * 1.088).toFixed(2);
                      setAltInput(meters);
                      if (cameraInstance) {
                        cameraInstance.position.y = +meters;
                      }
                    }}
                    onBlur={() => setAltMSFSInput(undefined)}
                    className="w-24"
                    style={{
                      textShadow:
                        "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                    }}
                  />
                </p>
                <p>
                  Heading: {" "}
                  <input
                    value={headingInput !== undefined ? headingInput : cameraState.heading.toFixed(2)}
                    type="number"
                    step="0.5"
                    onChange={(e) => {
                      setHeadingInput(e.target.value);
                      if (cameraInstance) {
                        cameraInstance.rotation.y =
                          -((+e.target.value + 180) * Math.PI) / 180;
                      }
                    }}
                    onBlur={() => setHeadingInput(undefined)}
                    className="w-24"
                    style={{
                      textShadow:
                        "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                    }}
                  />
                </p>
                <p>
                  Pitch: {" "}
                  <input
                    value={pitchInput !== undefined ? pitchInput : cameraState.pitch.toFixed(2)}
                    type="number"
                    step="0.5"
                    onChange={(e) => {
                      setPitchInput(e.target.value);
                      if (cameraInstance) {
                        cameraInstance.rotation.x =
                          (+e.target.value * Math.PI) / 180;
                      }
                    }}
                    onBlur={() => setPitchInput(undefined)}
                    className="w-24"
                    style={{
                      textShadow:
                        "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                    }}
                  />
                </p>
                <p>
                  Roll: {" "}
                  <input
                    value={rollInput !== undefined ? rollInput : cameraState.roll.toFixed(2)}
                    type="number"
                    step="0.5"
                    onChange={(e) => {
                      setRollInput(e.target.value);
                      if (cameraInstance) {
                        cameraInstance.rotation.z =
                          (+e.target.value * Math.PI) / 180;
                      }
                    }}
                    onBlur={() => setRollInput(undefined)}
                    className="w-24"
                    style={{
                      textShadow:
                        "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                    }}
                  />
                </p>
                <p>
                  FOV (deg): {" "}
                  <input
                    value={fovInput !== undefined ? fovInput : cameraState.fov.toFixed(2)}
                    type="number"
                    step="0.1"
                    onChange={(e) => {
                      setFovInput(e.target.value);
                      setFovRadInput((+e.target.value * Math.PI / 180).toFixed(4));
                      if (cameraInstance) {
                        cameraInstance.fov = +e.target.value;
                        cameraInstance.updateProjectionMatrix();
                      }
                    }}
                    onBlur={() => setFovInput(undefined)}
                    className="w-24"
                    style={{
                      textShadow:
                        "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                    }}
                  />
                </p>
                <p>
                  FOV (rad): {" "}
                  <input
                    value={fovRadInput !== undefined ? fovRadInput : (cameraState.fov * Math.PI / 180).toFixed(4)}
                    type="number"
                    step="0.001"
                    onChange={(e) => {
                      setFovRadInput(e.target.value);
                      const deg = (+e.target.value * 180 / Math.PI).toFixed(2);
                      setFovInput(deg);
                      if (cameraInstance) {
                        cameraInstance.fov = +deg;
                        cameraInstance.updateProjectionMatrix();
                      }
                    }}
                    onBlur={() => setFovRadInput(undefined)}
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
        </div>
      </div>
      {/* Upload screenshot button (always visible in calibration mode) */}
      {calibrationMode && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1002,
            pointerEvents: "auto",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 12,
          }}
        >
          {/* Show Calculate button if at least 2 confirmed points */}
          {showCalculate && (
            <button
              style={{
                background: '#0af',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 18,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                marginBottom: 8,
              }}
              onClick={async () => {
                // 1. Determine elevation for current airport
                let elevation = 8.5;
                if (guidesVisible) {
                  if (vhhx.features && vhhx.features.length > 0) elevation = 5.2;
                  if (vmmc.features && vmmc.features.length > 0) elevation = 4.0;
                }
                // 2. Prepare 3D world points (Mercator XZ, fixed Y=elevation)
                const worldPoints = calibrationPoints.slice(0, 2).map(pt => {
                  const m = toMercator([parseFloat(pt.lon), parseFloat(pt.lat)]);
                  return [-(m[0] - offset[0]), elevation, m[1] - offset[1]];
                });
                const imagePoints = calibrationPoints.slice(0, 2).map(pt => [pt.x, pt.y]);
                
                if (!cameraInstance) {
                  alert('Camera not ready');
                  return;
                }
                
                const width = 1920;
                const height = 1080;
                const fov = cameraInstance.fov;
                
                // Use known camera position and FOV, solve for orientation
                const camPos = [cameraInstance.position.x, cameraInstance.position.y, cameraInstance.position.z];
                const orientation = solveCameraRotationFrom2Points({
                  cameraPos: camPos,
                  fov: fov,
                  imageSize: [width, height],
                  worldPoints,
                  imagePoints,
                });
                
                setCalculationResult({
                  heading: orientation.yaw,
                  pitch: orientation.pitch,
                  roll: orientation.roll,
                });
              }}
            >
              Calculate
            </button>
          )}
          <label style={{ cursor: "pointer" }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setCalibrationImage(ev.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <span
              style={{
                background: "#222",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: 8,
                fontSize: 18,
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                display: "inline-block",
              }}
            >
              Upload Screenshot
            </span>
          </label>
        </div>
      )}
      {/* Render calibration markers */}
      {calibrationMode && calibrationPoints.map((pt, idx) => {
        const isActive = activePointIdx === idx;
        const isValid = isPointValid(pt);
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: pt.x - 8,
              top: pt.y - 8,
              width: 16,
              height: 16,
              background: isActive ? "red" : (isValid ? "#0f0" : "#00f"),
              borderRadius: "50%",
              border: "2px solid white",
              zIndex: 1001,
              pointerEvents: "auto",
              cursor: "pointer",
            }}
            onClick={e => {
              e.stopPropagation();
              if (activePointIdx !== null && activePointIdx !== idx) {
                const activePt = calibrationPoints[activePointIdx];
                if (!isPointValid(activePt)) {
                  setCalibrationPoints(points => points.filter((_, i) => i !== activePointIdx));
                  setActivePointIdx(i => {
                    if (activePointIdx < idx) return idx - 1;
                    return idx;
                  });
                  return;
                }
              }
              setActivePointIdx(idx);
            }}
          />
        );
      })}
      {/* Overlay for active point coordinate input */}
      {calibrationMode && activePointIdx !== null && calibrationPoints[activePointIdx] && (
        <div
          style={{
            position: "absolute",
            left: calibrationPoints[activePointIdx].x + 20,
            top: calibrationPoints[activePointIdx].y - 20,
            background: "rgba(0,0,0,0.85)",
            color: "white",
            padding: 12,
            borderRadius: 8,
            zIndex: 1100,
            minWidth: 180,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Display x/y pixel coordinates */}
          <div style={{ marginBottom: 8, fontSize: 14, color: '#0af' }}>
            <strong>Screen X:</strong> {Math.round(calibrationPoints[activePointIdx].x)}, <strong>Y:</strong> {Math.round(calibrationPoints[activePointIdx].y)}
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Lat: </label>
            <input
              type="text"
              value={calibrationPoints[activePointIdx].lat}
              onChange={e => setCalibrationPoints(points => points.map((pt, idx) =>
                idx === activePointIdx ? { ...pt, lat: e.target.value } : pt
              ))}
              style={{ width: 100, marginLeft: 4 }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Lon: </label>
            <input
              type="text"
              value={calibrationPoints[activePointIdx].lon}
              onChange={e => setCalibrationPoints(points => points.map((pt, idx) =>
                idx === activePointIdx ? { ...pt, lon: e.target.value } : pt
              ))}
              style={{ width: 100, marginLeft: 4 }}
            />
          </div>
          {/* Show derived elevation in meters, read-only */}
          <div style={{ marginBottom: 8 }}>
            <label>Elevation (m): </label>
            <input
              type="text"
              value={(() => {
                let elevation = 8.5;
                if (guidesVisible) {
                  if (vhhx.features && vhhx.features.length > 0) elevation = 5.2;
                  if (vmmc.features && vmmc.features.length > 0) elevation = 4.0;
                }
                return elevation;
              })()}
              readOnly
              style={{ width: 100, marginLeft: 4, background: '#222', color: '#fff', border: 'none' }}
            />
          </div>
          {/* Validation: all fields must be valid numbers */}
          {(() => {
            const pt = calibrationPoints[activePointIdx];
            const valid = pt && !isNaN(Number(pt.lat)) && !isNaN(Number(pt.lon)) && pt.lat !== '' && pt.lon !== '';
            return (
              <button
                style={{ marginRight: 8, background: '#0a0', color: 'white', padding: '4px 12px', borderRadius: 4, opacity: valid ? 1 : 0.5 }}
                onClick={() => { if (valid) setActivePointIdx(null); }}
                disabled={!valid}
              >
                Confirm
              </button>
            );
          })()}
          <button
            style={{ background: '#a00', color: 'white', padding: '4px 12px', borderRadius: 4 }}
            onClick={() => {
              setCalibrationPoints(points => points.filter((_, idx) => idx !== activePointIdx));
              setActivePointIdx(null);
            }}
          >
            Delete
          </button>
        </div>
      )}
      {/* Result overlay */}
      {calculationResult && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ background: '#222', color: '#fff', padding: 32, borderRadius: 12, minWidth: 340, boxShadow: '0 4px 24px #0008' }}>
            <h2 style={{ fontSize: 22, marginBottom: 16 }}>Camera Orientation Calibration</h2>
            <div style={{ marginBottom: 16 }}>
              <div>Heading: <b>{calculationResult.heading.toFixed(2)}°</b></div>
              <div>Pitch: <b>{calculationResult.pitch.toFixed(2)}°</b></div>
              <div>Roll: <b>{calculationResult.roll.toFixed(2)}°</b></div>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <button
                style={{ background: '#a00', color: 'white', padding: '8px 24px', borderRadius: 6, fontSize: 16 }}
                onClick={() => setCalculationResult(null)}
              >
                Cancel
              </button>
              <button
                style={{ background: '#0af', color: 'white', padding: '8px 24px', borderRadius: 6, fontSize: 16 }}
                onClick={() => {
                  // Apply only the orientation to the camera
                  if (cameraInstance) {
                    cameraInstance.rotation.x = (calculationResult.pitch * Math.PI) / 180;
                    cameraInstance.rotation.y = -((calculationResult.heading + 180) * Math.PI) / 180;
                    cameraInstance.rotation.z = (calculationResult.roll * Math.PI) / 180;
                  }
                  setCalculationResult(null);
                }}
              >
                Apply Orientation
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Optionally, show a message if 2 points are already added */}
      {calibrationMode && calibrationPoints.length >= 2 && (
        <div style={{position:'absolute',top:16,left:16,background:'#222',color:'#fff',padding:8,borderRadius:6,zIndex:1100}}>
          Maximum 2 points allowed for minimal calibration
        </div>
      )}
    </>
  );
}
