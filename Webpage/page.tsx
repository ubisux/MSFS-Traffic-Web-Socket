"use client";
import TowerView from "@/app/[locale]/(public)/viewer/tower/TowerViewThree";
import usePeer from "@/lib/peer";
import _ from "lodash";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useFs } from "use-fs";

export default function Page() {
  return (
    <Suspense>
      <TowerViewPage />
    </Suspense>
  );
}

function TowerViewPage() {
  const rawParams = useSearchParams();
  const [logState, setLogState] = useState<{
    fileName: string;
    lastReadRow: number;
    data: {
      controllers: { [key: string]: any };
      aircrafts: { [key: string]: any };
    };
  }>({
    fileName: "",
    lastReadRow: 0,
    data: {
      controllers: {},
      aircrafts: {},
    },
  });

  const aircrafts = useMemo(
    () => Object.entries(logState.data.aircrafts).filter((x) => x[1].latitude),
    [logState],
  );

  const { sendMessage, peerId, connections } = usePeer(
    rawParams.has("masterId") ? rawParams.get("masterId")! : "vathktv",
    (e) => {
      switch (e.type) {
        case "initial":
          if (!logState.fileName) {
            setLogState(e.data);
          }
          break;
        case "packet":
          setLogState((x) => {
            parsePacket(x, e.data);
            return { ...x };
          });
          break;
        default:
          console.log("Unknown packet type " + e.type);
          break;
      }
    },
    (conn) => {
      setLogState((logState) => {
        if (logState.fileName) {
          try {
            conn.send({ type: "initial", data: logState });
            console.log("Peer: Sent (" + conn.peer + ")", logState);
          } catch {
            console.log("Peer: Failed to send initial state to " + conn.peer);
          }
        }
        return logState;
      });
    },
  );

  const parsePacket = (state: any, line: string) => {
    try {
      const lineSplit = line.split(":");
      if (line.startsWith("%"))
        state.data.controllers[lineSplit[0].slice(1)] = {
          frequency: 100000 + +lineSplit[1],
        };
      else if (line.startsWith("$CQ")) {
        if (lineSplit[2] === "ACC") {
          if (lineSplit[1].startsWith("@"))
            state.data.aircrafts[lineSplit[0].slice(3)] = {
              ...(state.data.aircrafts[lineSplit[0].slice(3)] ?? {}),
              config: _.merge(
                state.data.aircrafts[lineSplit[0].slice(3)]?.config ?? {},
                JSON.parse(lineSplit.slice(3).join(":")).config,
              ),
            };
        }
      } else if (line.startsWith("$FP")) {
        state.data.aircrafts[lineSplit[0].slice(3)] = {
          ...(state.data.aircrafts[lineSplit[0].slice(3)] ?? {}),
          fr: lineSplit[2],
          type: lineSplit[3],
          rspd: lineSplit[4],
          eobt: lineSplit[6], // Scheduled departure
          eet: lineSplit[10], // Estimated enroute time
          fob: lineSplit[11], // Fuel on board
          rfl: +lineSplit[8],
          dep: lineSplit[5],
          arr: lineSplit[9],
          alt: lineSplit[14],
          fp: lineSplit[15],
          ...(lineSplit[15].includes("REG/") && {
            registration: lineSplit[15].slice(
              lineSplit[15].indexOf("REG/") + 4,
              lineSplit[15].indexOf(" ", lineSplit[15].indexOf("REG/")),
            ),
          }),
          route: lineSplit[16],
          sid: lineSplit[16].split(" ")[0]?.split("/")[0],
          depRwy: lineSplit[16].split(" ")[0]?.split("/")[1],
        };
      } else if (line.startsWith("#AP")) {
        state.data.aircrafts[lineSplit[0].slice(3)] = {
          ...(state.data.aircrafts[lineSplit[0].slice(3)] ?? {}),
          cid: +lineSplit[2],
          name: lineSplit[7],
        };
      } else if (line.startsWith("#DA")) {
        delete state.data.controllers[lineSplit[0].slice(3)];
        //   data.data.aircrafts[lineSplit[0].slice(3)] = {
        //     ...(data.data.aircrafts[lineSplit[0].slice(3)] ?? {}),
        //     cid: +lineSplit[1],
        //   };
      } else if (line.startsWith("#DP")) {
        delete state.data.aircrafts[lineSplit[0].slice(3)];
        //   data.data.aircrafts[lineSplit[0].slice(3)] = {
        //     ...(data.data.aircrafts[lineSplit[0].slice(3)] ?? {}),
        //     cid: +lineSplit[1],
        //   };
      } else if (line.startsWith("#ST")) {
        state.data.aircrafts[lineSplit[0].slice(3)] = {
          ...(state.data.aircrafts[lineSplit[0].slice(3)] ?? {}),
          latitude: +lineSplit[1],
          longitude: +lineSplit[2],
          altitude: +lineSplit[3],
        };
      } else if (line.startsWith("@")) {
        state.data.aircrafts[lineSplit[1]] = {
          ...(state.data.aircrafts[lineSplit[1]] ?? {}),
          transponder: lineSplit[0].slice(1),
          squawk: +lineSplit[2],
          latitude: +lineSplit[4],
          longitude: +lineSplit[5],
          altitude: +lineSplit[6],
          speed: +lineSplit[7],
        };
      }
      return true;
    } catch (e) {
      console.log(line, e);
    }
  };

  const updateLogState = (state: any, content: string, fileName?: string) => {
    const contentSplit = content.split("\r\n");

    if (fileName) {
      state.fileName = fileName;
      state.lastReadRow = 0;
      state.data = {
        controllers: {},
        aircrafts: {},
      };
    }

    for (
      let i = state.lastReadRow;
      i < Math.floor((contentSplit.length - 1) / 3) * 3;
      i++
    ) {
      const line = contentSplit[i];
      if (!line || line.startsWith("[")) continue;
      if (parsePacket(state, line)) {
        if (!fileName) {
          sendMessage({ type: "packet", data: line });
        }
        state.lastReadRow = i + 1;
      }
    }

    if (fileName) sendMessage({ type: "initial", data: state });
  };

  const { onDirectorySelection, files, isBrowserSupported } =
    typeof window !== "undefined"
      ? useFs({
          onFilesAdded: (newFiles, previousFiles) => {
            console.log("Files added:", newFiles.keys());
          },
          onFilesChanged: (changedFiles, previousFiles) => {
            console.log("Files changed:", changedFiles.keys());
            setLogState((x: any) => {
              if (changedFiles.has(x.fileName))
                updateLogState(x, changedFiles.get(x.fileName)!);
              return { ...x };
            });
          },
          onFilesDeleted: (deletedFiles, previousFiles) => {
            console.log("Files deleted:", deletedFiles.keys());
          },
        })
      : { files: new Map() };

  return (
    <div className="relative overflow-hidden w-[1920px] h-[1080px] group">
      <TowerView
        data={aircrafts}
        options={{
          lon: rawParams.has("lon") ? +rawParams.get("lon")! : 113.921386,
          lat: rawParams.has("lat") ? +rawParams.get("lat")! : 22.310572,
          alt: rawParams.has("alt") ? +rawParams.get("alt")! : 283 * 0.3048,
          heading: rawParams.has("heading") ? +rawParams.get("heading")! : 0,
          pitch: rawParams.has("pitch") ? +rawParams.get("pitch")! : 0,
          roll: rawParams.has("roll") ? +rawParams.get("roll")! : 0,
          fov: rawParams.has("fov") ? +rawParams.get("fov")! : 65,
          guides: rawParams.has("guides"),
          dark: rawParams.has("dark"),
        }}
      />
      <div className="absolute top-0 left-0 hidden p-4 mx-auto w-128 group-hover:block bg-opacity-80">
        <div>
          <button
            onClick={() => {
              isBrowserSupported
                ? onDirectorySelection!()
                : alert(
                    "Browser not supported. Please use Chromium 105 or greater",
                  );
            }}
            className="px-1 text-sm text-white rounded-md bg-primary"
          >
            Select EuroScope Log Folder
          </button>
          {files.size > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {files
                ?.entries()
                .toArray()
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([path, content]) => (
                  <button
                    key={path}
                    onClick={() =>
                      setLogState((x) => {
                        updateLogState(x, content, path);
                        return { ...x };
                      })
                    }
                    className="px-1 text-sm text-white rounded-md bg-primary"
                  >
                    {path.split("/").at(-1)}
                  </button>
                ))}
            </div>
          )}
        </div>
        <p
          className="mt-2 text-xs text-white"
          style={{
            textShadow:
              "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
          }}
        >
          {peerId} ({Object.keys(connections).length})
        </p>
        {/* <pre className="p-4 overflow-y-scroll bg-gray-100 rounded-md">
          {JSON.stringify(logState, undefined, 2)}
        </pre> */}
      </div>
    </div>
  );
}
