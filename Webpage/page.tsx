"use client";
import React, { Suspense, useEffect, useState } from "react";
import TowerView from "./TowerViewThree";
import { useSearchParams } from "next/navigation";

export default function Page() {
  // Dynamically load opencv.js on mount
  useEffect(() => {
    if (!window.cv && !document.getElementById('opencvjs')) {
      const script = document.createElement('script');
      script.id = 'opencvjs';
      script.src = 'https://docs.opencv.org/4.x/opencv.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <Suspense>
      <TowerViewPage />
    </Suspense>
  );
}

function TowerViewPage() {
  const rawParams = useSearchParams();

  return (
    <div className="relative overflow-hidden w-[1920px] h-[1080px] group">
      <TowerView
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
