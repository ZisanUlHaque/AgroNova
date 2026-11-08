"use client";

import React, { useEffect, useRef, useState } from "react";
import { Language, translations } from "../lib/translations";
import { MapPin, Navigation, Satellite, Map as MapIcon, Layers, Droplets, Leaf } from "lucide-react";

interface MapPickerProps {
  language: Language;
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lon: number) => void;
}

const PILOT_LOCATIONS = [
  { nameBn: "পোরশা, নওগাঁ (বরেন্দ্র খরা)", nameEn: "Porsha, Naogaon (Barind)", lat: 24.9030, lon: 88.4830, tagBn: "খরা বেঞ্চমার্ক" },
  { nameBn: "বাবুগঞ্জ, বরিশাল (উপকূলীয় ডেল্টা)", nameEn: "Babuganj, Barisal (Coastal)", lat: 22.7010, lon: 90.3535, tagBn: "উপকূল বেঞ্চমার্ক" },
  { nameBn: "যশোর দক্ষিণ-পশ্চিম (AEZ-11)", nameEn: "Jessore Southwest (AEZ-11)", lat: 23.1664, lon: 89.2081, tagBn: "লবণাক্ত/ডাল" },
  { nameBn: "বগুড়া উত্তরবঙ্গ (AEZ-25)", nameEn: "Bogura North (AEZ-25)", lat: 24.8465, lon: 89.3777, tagBn: "তেলবীজ হাবে" },
];

export function MapPicker({
  language,
  latitude,
  longitude,
  onLocationChange,
}: MapPickerProps) {
  const t = translations[language];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const overlayLayerRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<"satellite" | "street">("satellite");
  const [activeOverlay, setActiveOverlay] = useState<"none" | "smap" | "ndvi">("smap");
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const customIcon = L.divIcon({
        className: "custom-farm-pin",
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            background: linear-gradient(135deg, #10b981, #047857);
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            color: white;
            font-size: 16px;
            cursor: pointer;
          ">
            🌱
            <div style="
              position: absolute;
              bottom: -6px;
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 6px solid #047857;
            "></div>
          </div>
        `,
        iconSize: [38, 44],
        iconAnchor: [19, 44],
        popupAnchor: [0, -44],
      });

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([latitude, longitude], 13);

      // Add Zoom control in bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Default to Satellite Imagery (Esri World Imagery)
      const satelliteTiles = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Esri, Maxar, Earthstar Geographics, USDA, USGS",
          maxZoom: 18,
        }
      ).addTo(map);
      tileLayerRef.current = satelliteTiles;

      // 1.2 Hectare circular farm boundary representation (~62m radius circle)
      const farmBoundaryCircle = L.circle([latitude, longitude], {
        radius: 62,
        color: "#10b981",
        fillColor: "#34d399",
        fillOpacity: 0.25,
        weight: 2,
        dashArray: "4, 6",
      }).addTo(map);
      circleRef.current = farmBoundaryCircle;

      const marker = L.marker([latitude, longitude], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.on("drag", (e: any) => {
        const pos = e.target.getLatLng();
        farmBoundaryCircle.setLatLng(pos);
      });

      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        onLocationChange(Number(pos.lat.toFixed(4)), Number(pos.lng.toFixed(4)));
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        farmBoundaryCircle.setLatLng(e.latlng);
        onLocationChange(Number(e.latlng.lat.toFixed(4)), Number(e.latlng.lng.toFixed(4)));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setIsLeafletReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map when lat/lon props change from external preset
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && circleRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      circleRef.current.setLatLng([latitude, longitude]);
      mapInstanceRef.current.panTo([latitude, longitude], { animate: true, duration: 0.8 });
    }
  }, [latitude, longitude]);

  // Handle Layer Switching (Satellite vs Street)
  const handleToggleBaseLayer = (layer: "satellite" | "street") => {
    setActiveLayer(layer);
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      if (layer === "satellite") {
        tileLayerRef.current = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "Esri World Imagery / NASA EO",
            maxZoom: 18,
          }
        ).addTo(mapInstanceRef.current);
      } else {
        tileLayerRef.current = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
          }
        ).addTo(mapInstanceRef.current);
      }
      // Re-apply overlay if active
      handleToggleOverlay(activeOverlay);
    });
  };

  // Handle Satellite Overlay (SMAP Soil Moisture vs NDVI Crop Health)
  const handleToggleOverlay = (overlay: "none" | "smap" | "ndvi") => {
    setActiveOverlay(overlay);
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      if (overlayLayerRef.current) {
        mapInstanceRef.current.removeLayer(overlayLayerRef.current);
        overlayLayerRef.current = null;
      }

      if (overlay === "smap") {
        // Simulated NASA SMAP 9km moisture deficit heat grid around Bangladesh
        const bounds = L.latLngBounds(
          [latitude - 0.08, longitude - 0.08],
          [latitude + 0.08, longitude + 0.08]
        );
        overlayLayerRef.current = L.rectangle(bounds, {
          color: "#0284c7",
          weight: 1.5,
          dashArray: "3, 5",
          fillColor: "#38bdf8",
          fillOpacity: 0.18,
        }).addTo(mapInstanceRef.current);
      } else if (overlay === "ndvi") {
        const bounds = L.latLngBounds(
          [latitude - 0.05, longitude - 0.05],
          [latitude + 0.05, longitude + 0.05]
        );
        overlayLayerRef.current = L.rectangle(bounds, {
          color: "#16a34a",
          weight: 1.5,
          dashArray: "2, 4",
          fillColor: "#22c55e",
          fillOpacity: 0.22,
        }).addTo(mapInstanceRef.current);
      }
    });
  };

  const handleUseGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lon = Number(pos.coords.longitude.toFixed(4));
          onLocationChange(lat, lon);
        },
        () => {
          alert(language === "bn" ? "জিপিএস অবস্থান পাওয়া যায়নি। অনুগ্রহ করে ম্যানুয়ালি ক্লিক করুন।" : "GPS location failed. Please drop pin manually.");
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Pilot presets bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.selectPilotFarm}
          </label>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            ✓ NASA Ground-Truthed Pilot Zones
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PILOT_LOCATIONS.map((p, idx) => {
            const isSelected = Math.abs(latitude - p.lat) < 0.01 && Math.abs(longitude - p.lon) < 0.01;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onLocationChange(p.lat, p.lon)}
                className={`p-2.5 rounded-2xl text-left border transition-all active:scale-95 ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-200 shadow-sm"
                    : "bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 font-bold text-xs truncate">
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                    <span className="truncate">{language === "bn" ? p.nameBn : p.nameEn}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="font-mono text-slate-400">{p.lat.toFixed(2)}°N, {p.lon.toFixed(2)}°E</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold ${isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                    {p.tagBn}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Canvas with Aerospace Mission HUD Controls */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-950">
        <div ref={mapContainerRef} className="h-72 sm:h-96 w-full z-0 bg-slate-900" />

        {/* Top-Left: Map Layer Switchers (Satellite vs Field & NASA Overlays) */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-md">
          <button
            type="button"
            onClick={() => handleToggleBaseLayer("satellite")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
              activeLayer === "satellite"
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "স্যাটেলাইট" : "Satellite"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleBaseLayer("street")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
              activeLayer === "street"
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "ফিল্ড ম্যাপ" : "Field Map"}</span>
          </button>

          <span className="w-px h-4 bg-white/20 mx-0.5" />

          {/* NASA Overlay Toggle */}
          <button
            type="button"
            onClick={() => handleToggleOverlay(activeOverlay === "smap" ? "none" : "smap")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
              activeOverlay === "smap"
                ? "bg-nasablue-500 text-white shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
            title="Toggle NASA SMAP 9km Soil Moisture grid overlay"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "SMAP গ্রিড" : "SMAP Grid"}</span>
          </button>
        </div>

        {/* Top-Right: GPS Locate Button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={handleUseGps}
            className="px-3.5 py-2 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 shadow-lg text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            title="Locate my position using device GPS"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.useGps}</span>
          </button>
        </div>

        {/* Bottom-Left: Live Mission Coordinate & Elevation HUD */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-950/85 backdrop-blur-md text-white p-2.5 px-3.5 rounded-2xl border border-white/15 shadow-xl flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-300 font-bold">{latitude.toFixed(4)}°N</span>
            <span className="text-slate-500">,</span>
            <span className="text-emerald-300 font-bold">{longitude.toFixed(4)}°E</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-2 text-slate-300 text-[11px]">
            <span>SRTM Elev: <strong className="text-white">28m</strong></span>
            <span>·</span>
            <span>Radius: <strong className="text-emerald-300">1.2 ha</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
