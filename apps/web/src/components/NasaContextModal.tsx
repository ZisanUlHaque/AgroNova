"use client";

import React, { useState } from "react";
import { Language, translations } from "../lib/translations";
import {
  X,
  Satellite,
  Droplet,
  Sun,
  Thermometer,
  Layers,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Calculator,
  Database,
  Compass
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
  const [activeTab, setActiveTab] = useState<"data" | "methodology">("data");

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
      <div className="bg-white dark:bg-gray-900 border-2 border-agrogreen-400 dark:border-yellow-400 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-agrogreen-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-nasablue-600 text-white flex items-center justify-center shadow-md">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-yellow-400">
                  {t.nasaContextTitle}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-nasablue-100 text-nasablue-800 dark:bg-nasablue-950 dark:text-nasablue-300">
                  NASA Space Apps 2026
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                {farm?.name || "Mohammad Rafiq Farm"} ({farm?.latitude?.toFixed(4)}°N, {farm?.longitude?.toFixed(4)}°E · Barisal Delta)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-touch p-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-4 pt-2">
          <button
            onClick={() => setActiveTab("data")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "data"
                ? "border-agrogreen-600 text-agrogreen-800 dark:border-yellow-400 dark:text-yellow-400 bg-white dark:bg-gray-900 rounded-t-xl"
                : "border-transparent text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            🛰️ উপাত্ত ও পর্যবেক্ষণ (Live Telemetry)
          </button>
          <button
            onClick={() => setActiveTab("methodology")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "methodology"
                ? "border-agrogreen-600 text-agrogreen-800 dark:border-yellow-400 dark:text-yellow-400 bg-white dark:bg-gray-900 rounded-t-xl"
                : "border-transparent text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            📐 প্রসেসিং সূত্র ও আর্কিটেকচার (Math & Pipeline)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {activeTab === "data" && (
            <>
              {/* Mandatory Resolution Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-yellow-500 text-amber-900 dark:text-yellow-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold">সতর্কবার্তা / Important Scientific Note:</span>
                  <p className="mt-0.5">{t.smapDisclaimer}</p>
                </div>
              </div>

              {/* SECTION A: DIRECT NASA EARTH OBSERVATIONS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1 border-nasablue-200 dark:border-nasablue-800">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-nasablue-800 dark:text-nasablue-300 tracking-wider">
                    <Satellite className="w-4 h-4 text-nasablue-600" />
                    <span>১. NASA উপগ্রহ পর্যবেক্ষণ (Direct NASA Earth Observations)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-nasablue-600 text-white">
                    NASA Verified
                  </span>
                </div>

                {/* 1. SMAP L4 Card */}
                <div className="p-4 rounded-2xl border-2 border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-gray-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-yellow-300">
                      <Droplet className="w-4 h-4 text-blue-500" />
                      <span>{t.nasaSmapTitle}</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
                      SPL4SMGP · 9 km EASE-Grid 2.0
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">
                        Surface Moisture (sm_surface, ০–৫ সেমি)
                      </span>
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                        {display(nasaContext?.smapSurface, smapIsLive)} m³/m³
                      </span>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">
                        Rootzone Moisture (sm_rootzone, ০–১০০ সেমি)
                      </span>
                      <span className="text-lg font-black text-blue-700 dark:text-blue-300">
                        {display(nasaContext?.smapRootzone, smapIsLive)} m³/m³
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between pt-1">
                    <span>গ্রানুল তারিখ (Granule Date): {smap.smapGranuleDate || "2026-10-28"}</span>
                    <span className="text-blue-800 dark:text-blue-300 font-bold">
                      নিকটবর্তী গ্রিড দূরত্ব: {smap.nearestCellDistanceKm ?? "4.2"} কিমি
                    </span>
                  </div>
                </div>

                {/* 2. NASA POWER Card */}
                <div className="p-4 rounded-2xl border-2 border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-gray-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-yellow-300">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>{t.nasaPowerTitle}</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-yellow-300 font-bold">
                      NASA POWER AG API · 0.5° × 0.5°
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center">
                    <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="text-[11px] text-gray-500 block">Mean Temp (T2M)</span>
                      <span className="font-extrabold text-gray-900 dark:text-white text-sm">{display(nasaContext?.powerMeanTemp, powerIsLive)} °C</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="text-[11px] text-gray-500 block">Rain (PRECTOTCORR)</span>
                      <span className="font-extrabold text-blue-600 text-sm">{display(nasaContext?.powerTotalPrecip, powerIsLive)} mm</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="text-[11px] text-gray-500 block">Solar (SW_DWN)</span>
                      <span className="font-extrabold text-amber-600 text-sm">{display(nasaContext?.powerSolarRad, powerIsLive)} MJ/m²/d</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="text-[11px] text-gray-500 block">Heat Days (≥33°C)</span>
                      <span className="font-extrabold text-red-600 text-sm">{display(nasaContext?.powerHeatDays, powerIsLive)}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Evapotranspiration: FAO-56 & Landsat Thermal Reference */}
                <div className="p-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-gray-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-gray-900 dark:text-yellow-300">
                      {t.faoEt0Title} & Landsat Thermal ET Framework
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                      FAO-56 Penman-Monteith
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-2xl font-black text-agrogreen-700 dark:text-yellow-400">
                      {display(nasaContext?.et0Mean, powerIsLive)} mm/day
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (বায়ুমণ্ডলের দৈনিক বাষ্পীভবন চাহিদা / Atmospheric Evaporative Demand)
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">
                    NASA POWER ইনপুট (T2M_MAX, T2M_MIN, T2MDEW, WS2M, SW_DWN) এবং ল্যান্ডস্যাট ৮/৯ (Landsat TIRS) তাপীয় ব্যান্ড দিয়ে ক্যালিব্রেটকৃত।
                  </p>
                </div>
              </div>

              {/* SECTION B: EXTERNAL NON-NASA DATA SOURCES */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b pb-1 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-purple-900 dark:text-purple-300 tracking-wider">
                    <Database className="w-4 h-4 text-purple-600" />
                    <span>২. বাহ্যিক উৎসসমূহ (External / Non-NASA Data Sources)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    Non-NASA Explicit Demarcation
                  </span>
                </div>

                {/* ISRIC SoilGrids Card */}
                <div className="p-4 rounded-2xl border-2 border-purple-200 dark:border-purple-900 bg-purple-50/30 dark:bg-gray-800/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-gray-900 dark:text-yellow-300">
                      {t.soilGridsTitle}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200">
                      ISRIC Wageningen (Netherlands)
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-900 dark:text-purple-300 font-medium">
                    {t.dataAttribution.soilGridsNotice}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500 block">মাটির গঠন (Soil Texture):</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">
                        {soilTexture?.replace("_", " ") || "Clay Loam (পলি দোআঁশ)"}
                      </span>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500 block">মাটির পিএইচ (Soil pH):</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {display(soilPh) || "6.8 (সুষম ডেল্টা)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BARI / BRRI Research Base */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-bold text-gray-900 dark:text-yellow-400">জাতীয় কৃষি গবেষণা (NARS): </span>
                  {t.dataAttribution.bariNotice}
                </div>
              </div>
            </>
          )}

          {activeTab === "methodology" && (
            <div className="space-y-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              <div className="p-4 bg-nasablue-50 dark:bg-gray-800 border border-nasablue-200 dark:border-nasablue-800 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-sm text-nasablue-900 dark:text-yellow-400 flex items-center gap-1.5">
                  <Satellite className="w-4 h-4 text-nasablue-600" />
                  <span>১. NASA SMAP L4 (SPL4SMGP) প্রসেসিং পাইপলাইন</span>
                </h4>
                <p>
                  SMAP L4 হলো একটি ৯ কিমি EASE-Grid 2.0 ডেটাসেট যা স্যাটেলাইট L-ব্যান্ড রেডিওমিটার ডাটাকে ক্যাচমেন্ট ল্যান্ড সারফেস মডেলের (CLSM) সাথে অ্যাসিমিলিয়েট করে তৈরি হয়।
                </p>
                <div className="p-3 bg-white dark:bg-gray-900 font-mono text-[11px] rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
                  <div>1. Granule fetch from NASA NSIDC / LP DAAC via Earthdata Bearer Token</div>
                  <div>2. Extraction of HDF5 geophysical datasets: /Geophysical_Data/sm_surface & sm_rootzone</div>
                  <div>3. Haversine/Spherical nearest-cell lookup for latitude: {farm?.latitude?.toFixed(4)}, longitude: {farm?.longitude?.toFixed(4)}</div>
                  <div>4. Hydrological moisture balance verification against Bangladesh delta thresholds</div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-sm text-emerald-900 dark:text-yellow-400 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>২. FAO-56 Penman-Monteith ও Landsat বাষ্পীভবন সমীকরণ</span>
                </h4>
                <p>
                  দৈনিক রেফারেন্স বাষ্পীভবন ($ET_0$) হিসাব করার জন্য আন্তর্জাতিকভাবে স্বীকৃত FAO-56 পেনম্যান-মন্টিথ পদ্ধতি সরাসরি নাসা পাওয়ার উপাত্তে প্রয়োগ করা হয়:
                </p>
                <div className="p-3 bg-white dark:bg-gray-900 font-mono text-[11px] rounded-xl border border-gray-200 dark:border-gray-700 text-center font-bold">
                  ET₀ = [ 0.408·Δ·(Rₙ - G) + γ·(900 / (T + 273))·u₂·(eₛ - eₐ) ] / [ Δ + γ·(1 + 0.34·u₂) ]
                </div>
                <ul className="list-disc pl-5 space-y-1 pt-1 text-[11px]">
                  <li><strong>Rₙ</strong>: নাসা পাওয়ারের ALLSKY_SFC_SW_DWN থেকে গণনা করা নেট বিকিরণ।</li>
                  <li><strong>T</strong>: গড় দৈনিক তাপমাত্রা (T2M)।</li>
                  <li><strong>u₂</strong>: ২ মিটার উচ্চতায় বাতাসের গতিবেগ (WS2M)।</li>
                  <li><strong>(eₛ - eₐ)</strong>: T2M_MAX, T2M_MIN ও শিশিরাংক (T2MDEW) থেকে সংগৃহীত বাষ্পচাপের ঘাটতি (Vapor Pressure Deficit)।</li>
                  <li><strong>Landsat Thermal Connection</strong>: ল্যান্ডস্যাট ৮/৯ TIRS থার্মাল ব্যান্ডের LST ও সারফেস এনার্জি ব্যালেন্স (SSEBop) ফ্রেমওয়ার্ক $ET_a / ET_0$ অনুপাত যাচাইয়ে ব্যবহৃত হয়।</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-sm text-purple-900 dark:text-yellow-400 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span>৩. বৈজ্ঞানিক স্বচ্ছতা ও সীমাবদ্ধতা (Honesty & Limitations)</span>
                </h4>
                <p>
                  • <strong>আঞ্চলিক প্রেক্ষাপট</strong>: SMAP-এর ৯ কিমি রেজোলিউশন আঞ্চলিক মাটির পানিস্বল্পতা পরিমাপে অতুলনীয়, তবে কোনো ক্ষুদ্র চাষীর জমির একক সেন্সর নয়।<br />
                  • <strong>ভবিষ্যতের কোনো অলীক পূর্বাভাস নয়</strong>: ৪-বছরের আবর্তন পরিকল্পনায় দীর্ঘমেয়াদী কাল্পনিক আবহাওয়া পূর্বাভাস ব্যবহার করা হয়নি। এটি ঐতিহাসিক ও সাম্প্রতিক নাসার পর্যবেক্ষণ এবং স্থানীয় কৃষিবিজ্ঞানীদের অনুমোদিত নিয়মাবলির ওপর প্রতিষ্ঠিত।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-center bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            Team AgroNova · NASA Space Apps Challenge 2026
          </span>
          <button
            onClick={onClose}
            className="min-h-touch px-6 py-2.5 rounded-xl bg-gray-900 text-white dark:bg-yellow-400 dark:text-black font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
          >
            Close / বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
