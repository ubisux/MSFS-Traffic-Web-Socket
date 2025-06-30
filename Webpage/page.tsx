import React, { Suspense, useEffect, useState } from "react";
import TowerView from "./TowerViewThree";
import { useSearchParams } from "next/navigation";

export default function Page() {
  return (
    <Suspense>
      <TowerViewPage />
    </Suspense>
  );
}

function TowerViewPage() {
  const rawParams = useSearchParams();
  const [aircrafts, setAircrafts] = useState<any[]>([]);

  // Periodically fetch aircraft data from local endpoint
  useEffect(() => {
    let timer: any;
    const fetchAircraft = async () => {
      try {
        const res = await fetch("http://localhost:8080/aircraft");
        if (!res.ok) return;
        const data = await res.json();
        // Expecting data to be an array or object of aircrafts
        // If object, convert to array of [id, value] pairs for TowerView
        if (Array.isArray(data)) {
          setAircrafts(data);
        } else if (data && typeof data === "object") {
          setAircrafts(Object.entries(data));
        }
      } catch (e) {
        // Optionally handle error
      }
      timer = setTimeout(fetchAircraft, 1000);
    };
    fetchAircraft();
    return () => clearTimeout(timer);
  }, []);

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
    </div>
  );
}
