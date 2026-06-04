"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Compass, AlertCircle } from "lucide-react";

interface ProjectMapProps {
  projectLocation: [number, number]; // [lng, lat]
  checkins: Array<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: string | Date;
  }>;
  projectAddress: string;
}

export default function ProjectMap({
  projectLocation,
  checkins,
  projectAddress,
}: ProjectMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);
  const [useFallback, setUseFallback] = useState(true);

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Calculate distance in meters using Haversine formula (for mock readout)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  };

  const latestCheckin = checkins[0];
  const distance = latestCheckin
    ? calculateDistance(projectLocation[1], projectLocation[0], latestCheckin.latitude, latestCheckin.longitude)
    : null;

  useEffect(() => {
    if (!token || !mapContainerRef.current) {
      setUseFallback(true);
      return;
    }

    let map: any = null;

    async function initMap() {
      try {
        // Dynamically import mapbox-gl to avoid SSR issue
        const mapboxgl = (await import("mapbox-gl")).default;
        mapboxgl.accessToken = token!;

        setUseFallback(false);

        map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/mapbox/light-v11",
          center: projectLocation, // [lng, lat]
          zoom: 13,
        });

        // Add zoom controls
        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Project Location Marker
        new mapboxgl.Marker({ color: "#ef4444" }) // Red for project
          .setLngLat(projectLocation)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<p className="text-xs font-bold text-slate-800">Project Site</p><p className="text-[10px] text-slate-500">${projectAddress}</p>`
            )
          )
          .addTo(map);

        // Checkins Markers
        checkins.forEach((c, idx) => {
          const isLatest = idx === 0;
          new mapboxgl.Marker({ color: isLatest ? "#3b82f6" : "#94a3b8" }) // Blue for latest, slate for historical
            .setLngLat([c.longitude, c.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<p className="text-xs font-bold text-slate-800">${
                  isLatest ? "Latest Check-in" : "Historical Check-in"
                }</p><p className="text-[9px] text-slate-500">Accuracy: ±${
                  c.accuracy?.toFixed(1) || "N/A"
                }m<br/>Time: ${new Date(c.timestamp).toLocaleString()}</p>`
              )
            )
            .addTo(map);
        });

        // Fit map bounds if check-ins exist
        if (checkins.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend(projectLocation);
          checkins.forEach((c) => bounds.extend([c.longitude, c.latitude]));
          map.fitBounds(bounds, { padding: 40, maxZoom: 15 });
        }
      } catch (err) {
        console.error("Mapbox load failed:", err);
        setMapError(true);
        setUseFallback(true);
      }
    }

    initMap();

    return () => {
      if (map) map.remove();
    };
  }, [projectLocation, checkins, token]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Privacy Notice */}
      <div className="bg-slate-900 text-slate-400 p-3 text-[10px] flex items-center space-x-2 border-b border-slate-850">
        <AlertCircle className="h-4 w-4 text-sky-400 shrink-0" />
        <span>
          <strong>Notice:</strong> Location is recorded only when the contractor intentionally submits a site check-in. Continuous background tracking is disabled.
        </span>
      </div>

      {/* Map display */}
      <div className="relative h-72 md:h-96 w-full bg-slate-50">
        {useFallback ? (
          // SVG Mock Map Fallback
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-100 relative overflow-hidden">
            {/* Visual background lines to represent streets */}
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="50" x2="100%" y2="50" stroke="currentColor" strokeWidth="4" />
              <line x1="0" y1="150" x2="100%" y2="150" stroke="currentColor" strokeWidth="4" />
              <line x1="0" y1="280" x2="100%" y2="280" stroke="currentColor" strokeWidth="2" />
              <line x1="100" y1="0" x2="100" y2="100%" stroke="currentColor" strokeWidth="4" />
              <line x1="300" y1="0" x2="300" y2="100%" stroke="currentColor" strokeWidth="3" />
              <line x1="500" y1="0" x2="500" y2="100%" stroke="currentColor" strokeWidth="4" />
              <circle cx="300" cy="150" r="100" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>

            {/* Pins representation */}
            <div className="flex justify-center items-center gap-12 relative z-10">
              <div className="flex flex-col items-center">
                <MapPin className="h-10 w-10 text-red-500 drop-shadow-md animate-pulse" />
                <span className="text-[10px] font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow mt-2">
                  Project Site (Marker)
                </span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                  {projectLocation[1].toFixed(5)}, {projectLocation[0].toFixed(5)}
                </span>
              </div>

              {latestCheckin ? (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Navigation className="h-10 w-10 text-sky-500 rotate-45 drop-shadow-md" />
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500"></span>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow mt-2">
                    Contractor Location
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                    {latestCheckin.latitude.toFixed(5)}, {latestCheckin.longitude.toFixed(5)}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center opacity-40">
                  <Compass className="h-10 w-10 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 mt-2">No Contractor Check-in Yet</span>
                </div>
              )}
            </div>

            {latestCheckin && distance !== null && (
              <div className="absolute bottom-4 bg-slate-900 text-white rounded-lg px-4 py-2 text-xs flex items-center space-x-4 shadow z-10">
                <p>
                  Distance to Project:{" "}
                  <strong className="text-sky-400">
                    {distance < 1000 ? `${distance.toFixed(0)} meters` : `${(distance / 1000).toFixed(2)} km`}
                  </strong>
                </p>
                <span className="text-slate-700">|</span>
                <p>
                  Reported Accuracy: <strong className="text-sky-400">±{latestCheckin.accuracy?.toFixed(1) || "N/A"}m</strong>
                </p>
              </div>
            )}

            <div className="absolute top-4 right-4 bg-slate-800/80 border border-slate-700 rounded px-2.5 py-1 text-[9px] text-slate-300">
              Interactive Map Fallback Active
            </div>
          </div>
        ) : (
          <div ref={mapContainerRef} className="absolute inset-0" />
        )}
      </div>
    </div>
  );
}
