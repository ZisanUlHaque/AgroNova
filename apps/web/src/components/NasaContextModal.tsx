"use client";

import React from "react";
import { Language, translations } from "../lib/translations";
import {
  X,
  Satellite,
  Droplet,
  Sun,
  Thermometer,
  Wind,
  Layers,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface NasaContextModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  nasaContext: any;
  farm: any;
}

export function NasaContextModal({
  language,
  isOpen,
  onClose,
  nasaContext,
  farm,
}: NasaContextModalProps) {
  if (!isOpen) return null;
  const t = translations[language];

  const power = nasaContext?.powerData || {};
  const smap = nasaContext?.smapData || {};
  const soil = nasaContext?.soilData || {};
  const display = (value: unknown, sourceIsLive = true) =>
    sourceIsLive && typeof value === "number" && Number.isFinite(value) ? value : "—";
  const powerIsLive = power.source === "NASA_POWER_LIVE";
  const smapIsLive = smap.source === "NASA_EARTHDATA_LIVE";
  const farmerSoilTextureProvided = farm?.soilTexture != null;
  const farmerSoilPhProvided = farm?.soilPh != null;
  const farmerSoilProvided = farmerSoilTextureProvided || farmerSoilPhProvided;
  const soilIsSoilGrids = soil.source === "ISRIC_SOILGRIDS_REST";
  const soilTexture = farmerSoilTextureProvided
    ? farm?.soilTexture
    : soilIsSoilGrids ? soil?.soilTexture ?? soil?.texture : null;
  const soilPh = farmerSoilPhProvided
    ? farm?.soilPh
    : soilIsSoilGrids ? soil?.soilPh ?? soil?.ph : null;
  const soilSource =
    farmerSoilProvided && soilIsSoilGrids
      ? "FARMER + ISRIC"
      : farmerSoilProvided
        ? "FARMER PROVIDED"
        : soilIsSoilGrids ? "ISRIC ESTIMATE" : "UNAVAILABLE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border-2 border-agrogreen-400 dark:border-yellow-400 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-agrogreen-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-nasablue-600 text-white flex items-center justify-center">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-yellow-400">
                {t.nasaContextTitle}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                {farm?.name || "Pilot Delta Farm"} ({farm?.latitude?.toFixed(4)}°N, {farm?.longitude?.toFixed(4)}°E)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-touch p-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Prominent Mandatory 9 km Regional Disclaimer (PRD Section 6.3 & 10) */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-yellow-500 text-amber-900 dark:text-yellow-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold">সতর্কবার্তা / Important Scientific Note:</span>
              <p className="mt-0.5">{t.smapDisclaimer}</p>
            </div>
          </div>

          {/* SMAP L4 Card */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-yellow-300">
                <Droplet className="w-4 h-4 text-blue-500" />
                <span>{t.nasaSmapTitle}</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {smap.source || "NASA_EARTHDATA_UNAVAILABLE"} (9 km)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">
                  Surface Moisture (০-৫ সেমি)
                </span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                  {display(nasaContext?.smapSurface, smapIsLive)} m³/m³
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">
                  Rootzone Moisture (০-১০০ সেমি)
                </span>
                <span className="text-lg font-black text-blue-700 dark:text-blue-300">
                  {display(nasaContext?.smapRootzone, smapIsLive)} m³/m³
                </span>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between pt-1">
              <span>Granule Date: {smap.smapGranuleDate || "—"}</span>
              <span className="text-amber-700 dark:text-amber-300 font-bold">
                {smap.source === "NASA_EARTHDATA_LIVE"
                  ? `${smap.nearestCellDistanceKm ?? "—"} km · ${smap.cellLatitude ?? ""}, ${smap.cellLongitude ?? ""}`
                  : language === "bn"
                    ? "লাইভ গ্রানুল পাওয়া যায়নি"
                    : "No live granule"}
              </span>
            </div>
            {smap.warning && (
              <p className="text-xs text-amber-800 dark:text-amber-200">{smap.warning}</p>
            )}
          </div>

          {/* NASA POWER Card */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-yellow-300">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>{t.nasaPowerTitle}</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-yellow-300">
                {power.source || "NASA_POWER_UNAVAILABLE"}
              </span>
            </div>

            {power.warning && (
              <p className="text-xs text-amber-800 dark:text-amber-200">
                {power.warning}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center">
              <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-[11px] text-gray-500 block">Mean Temp</span>
                <span className="font-extrabold text-gray-900 dark:text-white text-sm">{display(nasaContext?.powerMeanTemp, powerIsLive)} °C</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-[11px] text-gray-500 block">Total Rain</span>
                <span className="font-extrabold text-blue-600 text-sm">{display(nasaContext?.powerTotalPrecip, powerIsLive)} mm</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-[11px] text-gray-500 block">Solar Rad</span>
                <span className="font-extrabold text-amber-600 text-sm">{display(nasaContext?.powerSolarRad, powerIsLive)} MJ/m²/day</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-[11px] text-gray-500 block">Heat Days</span>
                <span className="font-extrabold text-red-600 text-sm">{display(nasaContext?.powerHeatDays, powerIsLive)}</span>
              </div>
            </div>
          </div>

          {/* FAO-56 Penman-Monteith Reference Evapotranspiration */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-gray-900 dark:text-yellow-300">
                {t.faoEt0Title}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {nasaContext?.etSource || "UNAVAILABLE"}
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-agrogreen-700 dark:text-yellow-400">
                {display(nasaContext?.et0Mean, powerIsLive)} mm/day
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                (Penman-Monteith daily reference water consumption)
              </span>
            </div>
          </div>

          {/* ISRIC SoilGrids Baseline */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-gray-900 dark:text-yellow-300">
                {t.soilGridsTitle}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {soilSource}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <span className="text-gray-500">Soil Texture:</span>{" "}
                <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">{soilTexture?.replace("_", " ") || "—"}</span>
              </div>
              <div>
                <span className="text-gray-500">Soil pH:</span>{" "}
                <span className="font-bold text-gray-800 dark:text-gray-200">{display(soilPh)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-center bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="min-h-touch px-6 py-2.5 rounded-xl bg-gray-900 text-white dark:bg-yellow-400 dark:text-black font-bold text-xs"
          >
            Close / বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
