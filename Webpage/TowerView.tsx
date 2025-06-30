"use client";
import CopyButton from "@/app/[locale]/(auth)/dashboard/CopyButton";
import { vhhh, vhhx, vmmc } from "@/app/[locale]/(public)/viewer/tower/geojson";
import { useTrackAudio } from "@/lib/trackaudio";
import {
  Color3,
  Color4,
  FreeCamera,
  HemisphericLight,
  LinesMesh,
  MeshBuilder,
  Scene,
  Vector3,
} from "@babylonjs/core";
import { toMercator, toWgs84 } from "@turf/projection";
import { FitStrategy, HtmlMesh, HtmlMeshRenderer } from "babylon-htmlmesh";
import SceneComponent from "babylonjs-hook";
import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "react-feather";

const offset = toMercator([113.921386, 22.310572]);

export default ({
  data,
  options,
}: {
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
}) => {
  const [scene, setScene] = useState<Scene | null>(null);
  const [camera, setCamera] = useState<FreeCamera | null>(null);
  const [meshes, setMeshes] = useState<{
    [key: string]: [HtmlMesh, HTMLElement, LinesMesh?];
  }>({});
  const [guides, setGuides] = useState<LinesMesh[] | null>(null);
  const [dark, setDark] = useState(options.dark);

  const { tx } = useTrackAudio();
  const transmitting = useMemo(() => tx.map((x) => x.callsign), [tx]);

  useEffect(() => {
    if (!scene) return;

    setMeshes((meshes) => {
      // Remove meshes not in data
      for (const key of Object.keys(meshes)) {
        if (!data.find((d) => d[0] === key)) {
          meshes[key][0].dispose();
          meshes[key][1].remove();
          delete meshes[key];
        }
      }

      // Add new meshes or update existing ones with lat lon and altitude
      for (const [key, value] of data) {
        if (meshes[key]) {
          meshes[key][2]?.dispose();
          meshes[key].splice(2, 1);
        } else {
          meshes[key] = [
            new HtmlMesh(scene, "aircraft-" + key + "-html", {
              fitStrategy: FitStrategy.CONTAIN,
              isCanvasOverlay: true,
            }),
            document.createElement("div"),
          ];
          // meshes[key][1].style.width = "160px";
          // meshes[key][1].style.height = "40px";
          meshes[key][1].style.display = "flex";
          meshes[key][1].style.alignItems = "center";
          meshes[key][1].style.justifyContent = "center";

          meshes[key][0].setContent(meshes[key][1], 192, 48);
          meshes[key][0].billboardMode = 7;
          meshes[key][0].isVisible = false;
        }
        const pos = toMercator([value.longitude, value.latitude]);

        // const box = MeshBuilder.CreateBox("box-" + key, { size: 1 }, scene);
        // box.position = new Vector3(pos[0]-offset[0], value.altitude * 0.3048, pos[1]-offset[1]);

        meshes[key][0].position = new Vector3(
          pos[0] - offset[0],
          value.altitude * 0.3048 + 42,
          pos[1] - offset[1],
        );
        meshes[key][1].innerHTML = ["VHHH", "VHHX", "VMMC"].includes(value.arr)
          ? `<div class="flex opacity-90">
  <div>
    <div class="z-10 flex-grow-0 bg-primary aspect-square">
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
  <div class="px-2 pb-1 shadow ${dark ? "bg-black text-white" : "bg-white"}">
    <p class="text-lg font-semibold${transmitting.includes(key) ? " text-[#ff6900]" : ""}">${key}</p>
    <p class="-mt-1 text-[0.75rem]">${value.type?.replace(/^H\//, "").split("/")[0] ?? ""}</p>
  </div>
</div>`
          : ["VHHH", "VHHX", "VMMC"].includes(value.dep)
            ? `<div class="flex opacity-90">
  <div>
    <div class="z-10 flex-grow-0 bg-yellow-300 aspect-square">
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
  <div class="px-2 pb-1 shadow ${dark ? "bg-black text-white" : "bg-white"}">
    <p class="text-lg font-semibold${transmitting.includes(key) ? " text-[#ff6900]" : ""}">${key}</p>
    <p class="-mt-1 text-[0.75rem]">${value.arr}</p>
  </div>
</div>`
            : `<div class="flex opacity-60 px-1 shadow ${dark ? "bg-black text-white" : "bg-white"}">
  <p>${key}</p>
</div>`;

        meshes[key].push(
          MeshBuilder.CreateLines(
            "aircraft-" + key + "-line",
            {
              points: [
                new Vector3(
                  pos[0] - offset[0],
                  value.altitude * 0.3048 + 30,
                  pos[1] - offset[1],
                ),
                new Vector3(
                  pos[0] - offset[0],
                  value.altitude * 0.3048,
                  pos[1] - offset[1],
                ),
              ],
            },
            scene,
          ),
        );
        meshes[key][2]!.color = new Color3(1, 1, 1);
      }

      return meshes;
    });
  }, [scene, data, transmitting]);

  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 100);
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return (e.returnValue = "Are you sure you want to close?");
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", beforeUnloadHandler);

      setMeshes((meshes) => {
        for (const [k, v] of Object.entries(meshes)) {
          v[0].dispose();
          v[2]?.dispose();
          v[1].remove();
          delete meshes[k];
        }
        return meshes;
      });
    };
  }, []);

  return (
    <>
      <SceneComponent
        antialias
        onSceneReady={(scene: Scene) => {
          scene.clearColor = new Color4(0, 0, 0, 0);
          // Inspector.Show(scene, {});

          // use turf to convert lat lon to x y z 22.310572/113.921386
          const pos = toMercator([options.lon, options.lat]);
          const camera = new FreeCamera(
            "camera1",
            new Vector3(pos[0] - offset[0], options.alt, pos[1] - offset[1]),
            scene,
          );
          camera.rotation.y = (options.heading * Math.PI) / 180;
          camera.rotation.x = -(options.pitch * Math.PI) / 180;
          camera.rotation.z = (options.roll * Math.PI) / 180;
          camera.fov = (options.fov * Math.PI) / 180;

          const canvas = scene.getEngine().getRenderingCanvas();

          // This attaches the camera to the canvas
          camera.attachControl(canvas, true);
          camera.keysUp = [87];
          camera.keysDown = [83];
          camera.keysLeft = [65];
          camera.keysRight = [68];
          camera.keysUpward = [32];
          camera.keysDownward = [16];

          setCamera(camera);

          // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
          const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene,
          );

          // Default intensity is 1. Let's dim the light a small amount
          light.intensity = 0.7;

          const htmlMeshRenderer = new HtmlMeshRenderer(scene);
          scene.onDisposeObservable.addOnce(() => {
            htmlMeshRenderer.dispose();
          });

          setGuides(
            [
              { geojson: vhhh, elevation: 28 },
              { geojson: vhhx, elevation: 30 },
              { geojson: vmmc, elevation: 20 },
            ].flatMap((x) =>
              x.geojson.features.map((feature) => {
                const line = MeshBuilder.CreateLines(
                  "line-" + feature.properties.Name,
                  {
                    points: feature.geometry.coordinates.map((p: any) => {
                      const merc = toMercator(p);
                      return new Vector3(
                        merc[0] - offset[0],
                        x.elevation * 0.3048,
                        merc[1] - offset[1],
                      );
                    }),
                  },
                  scene,
                );
                line.color = new Color3(1, 0, 0.78);
                line.visibility = options.guides ? 1 : 0;
                return line;
              }),
            ),
          );
          setScene(scene);
        }}
        width="1920px"
        height="1080px"
      />
      <div className="absolute top-0 right-0 flex-col items-end hidden p-4 mx-auto text-sm group-hover:flex bg-opacity-80">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => {
              guides?.forEach((x) => {
                x.visibility = x.visibility ? 0 : 1;
              });
            }}
            className="px-1 text-white rounded-md bg-primary"
          >
            Toggle Guides
          </button>
          <button
            onClick={() => {
              setDark((x) => !x);
            }}
            className="px-1 text-white rounded-md bg-primary"
          >
            {dark ? <Moon width={"1rem"} /> : <Sun width={"1rem"} />}
          </button>
        </div>
        {camera && (
          <CopyButton
            className="px-1 py-0 mt-2 text-white rounded-md bg-primary"
            displayText="Copy Params"
            value={new URLSearchParams({
              lat: toWgs84([
                camera.position.x + offset[0],
                camera.position.z + offset[1],
              ])[1].toFixed(6),
              lon: toWgs84([
                camera.position.x + offset[0],
                camera.position.z + offset[1],
              ])[0].toFixed(6),
              alt: camera.position.y.toFixed(2),
              heading: (((camera.rotation.y / Math.PI) * 180) % 180).toFixed(2),
              pitch: (-(camera.rotation.x / Math.PI) * 180).toFixed(2),
              roll: ((camera.rotation.z / Math.PI) * 180).toFixed(2),
              fov: ((camera.fov / Math.PI) * 180).toFixed(2),
              ...(dark && { dark: "" }),
              ...(guides?.[0]?.visibility && { guides: "" }),
            }).toString()}
          />
        )}
        {!!time && camera && (
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
                value={toWgs84([
                  camera.position.x + offset[0],
                  camera.position.z + offset[1],
                ])[0].toFixed(6)}
                type="number"
                onChange={(e) => {
                  camera.position.x =
                    +toMercator([
                      +e.target.value,
                      toWgs84([
                        camera.position.x + offset[0],
                        camera.position.z + offset[1],
                      ])[1],
                    ])[0] - offset[0];
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
                value={toWgs84([
                  camera.position.x + offset[0],
                  camera.position.z + offset[1],
                ])[1].toFixed(6)}
                type="number"
                onChange={(e) => {
                  camera.position.z =
                    +toMercator([
                      toWgs84([
                        camera.position.x + offset[0],
                        camera.position.z + offset[1],
                      ])[0],
                      +e.target.value,
                    ])[1] - offset[1];
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
                value={camera.position.y.toFixed(2)}
                type="number"
                onChange={(e) => {
                  camera.position.y = +e.target.value;
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
                value={(((camera.rotation.y / Math.PI) * 180) % 180).toFixed(2)}
                type="number"
                onChange={(e) => {
                  camera.rotation.y = (+e.target.value * Math.PI) / 180;
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
                value={(-(camera.rotation.x / Math.PI) * 180).toFixed(2)}
                type="number"
                onChange={(e) => {
                  camera.rotation.x = -(+e.target.value * Math.PI) / 180;
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
                value={((camera.rotation.z / Math.PI) * 180).toFixed(2)}
                type="number"
                onChange={(e) => {
                  camera.rotation.z = (+e.target.value * Math.PI) / 180;
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
                value={((camera.fov / Math.PI) * 180).toFixed(2)}
                type="number"
                onChange={(e) => {
                  camera.fov = (+e.target.value * Math.PI) / 180;
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
};
