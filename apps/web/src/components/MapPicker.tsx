"use client";

import React, { useEffect, useRef, useState } from "react";
import { Language, translations } from "../lib/translations";
import { MapPin, Navigation, Compass } from "lucide-react";

interface MapPickerProps {
  language: Language;
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lon: number) => void;
}

const PILOT_LOCATIONS = [
  { nameBn: "বরিশাল ডেল্টা (রফিক-এর জমি)", nameEn: "Barisal Delta (Rafiq's Pilot)", lat: 22.701, lon: 90.3535 },
  { nameBn: "যশোর দক্ষিণ-পশ্চিম", nameEn: "Jessore Southwest", lat: 23.1664, lon: 89.2081 },
  { nameBn: "বগুড়া উত্তরবঙ্গ", nameEn: "Bogura North Bengal", lat: 24.8465, lon: 89.3777 },
  { nameBn: "ময়মনসিংহ ব্রহ্মপুত্র", nameEn: "Mymensingh Alluvium", lat: 24.7471, lon: 90.4203 },
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
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Leaflet CSS dynamically if not present
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

      // Fix Leaflet default icon paths in Next.js
      const customIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const map = L.map(mapContainerRef.current).setView([latitude, longitude], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const marker = L.marker([latitude, longitude], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        onLocationChange(Number(pos.lat.toFixed(4)), Number(pos.lng.toFixed(4)));
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
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
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapInstanceRef.current.panTo([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleUseGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lon = Number(pos.coords.longitude.toFixed(4));
          onLocationChange(lat, lon);
        },
        () => {
          alert("Could not access GPS location. Please drop a pin manually.");
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      {/* Pilot presets bar */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-yellow-400 mb-1.5">
          {t.selectPilotFarm}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PILOT_LOCATIONS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onLocationChange(p.lat, p.lon)}
              className={`min-h-touch p-2 rounded-lg text-left text-xs font-semibold border transition-all ${
                Math.abs(latitude - p.lat) < 0.01 && Math.abs(longitude - p.lon) < 0.01
                  ? "bg-agrogreen-100 border-agrogreen-600 text-agrogreen-900 dark:bg-yellow-400 dark:text-black dark:border-yellow-500 shadow-sm"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-1 font-bold">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-agrogreen-600 dark:text-yellow-400" />
                <span className="truncate">{language === "bn" ? p.nameBn : p.nameEn}</span>
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                {p.lat.toFixed(2)}°N, {p.lon.toFixed(2)}°E
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-agrogreen-300 dark:border-yellow-400 shadow-md">
        <div ref={mapContainerRef} className="h-64 sm:h-80 w-full z-0 bg-gray-100" />

        {/* GPS Location Button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={handleUseGps}
            className="min-h-touch px-3 py-2 rounded-xl bg-white/95 dark:bg-black/95 text-agrogreen-700 dark:text-yellow-400 border border-gray-200 dark:border-yellow-400 shadow-lg text-xs font-bold flex items-center gap-1.5 hover:bg-white"
          >
            <Navigation className="w-4 h-4 text-agrogreen-600 dark:text-yellow-400" />
            <span>{t.useGps}</span>
          </button>
        </div>

        {/* Coordinate Readout Badge */}
        <div className="absolute bottom-3 left-3 z-10 bg-black/75 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-mono shadow">
          <span className="text-yellow-300 font-bold">{latitude.toFixed(4)}° N</span>,{" "}
          <span className="text-yellow-300 font-bold">{longitude.toFixed(4)}° E</span>
        </div>
      </div>
    </div>
  );
}
