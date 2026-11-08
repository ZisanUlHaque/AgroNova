"use client";

import React from "react";
import { Language } from "../lib/translations";
import { X, ShieldCheck, Database, Satellite, AlertTriangle, Layers, BookOpen, ExternalLink } from "lucide-react";

interface MethodologyModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

export function MethodologyModal({ language, isOpen, onClose }: MethodologyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border-2 border-agrogreen-400 dark:border-yellow-400 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-agrogreen-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-agrogreen-700 dark:text-yellow-400" />
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-yellow-400">
                {language === "bn" ? "পদ্ধতি, বিজ্ঞান ও সীমাবদ্ধতার স্বচ্ছতা" : "Methodology, Science & Limitations"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                NASA Space Apps 2026 · Scientific Honesty & Traceability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          {/* Section 1: Data Architecture Table */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-yellow-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Database className="w-4 h-4 text-nasablue-600" />
              <span>{language === "bn" ? "উপাত্ত কাঠামো ও নির্ভুল উৎস বিভাজন (NASA vs External)" : "Data Architecture Table"}</span>
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 font-bold uppercase text-[10px] text-gray-600 dark:text-gray-400">
                  <tr>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Resolution</th>
                    <th className="py-2.5 px-3">Use</th>
                    <th className="py-2.5 px-3">Limitation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr>
                    <td className="py-2.5 px-3 font-bold">SMAP L4 (SPL4SMGP)</td>
                    <td className="py-2.5 px-3">NASA Earthdata</td>
                    <td className="py-2.5 px-3 text-nasablue-700 font-bold">NASA</td>
                    <td className="py-2.5 px-3">9 km model</td>
                    <td className="py-2.5 px-3">Rootzone moisture deficit</td>
                    <td className="py-2.5 px-3 text-red-600">Regional context; cannot resolve single plot or flooded paddy</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">Landsat 8/9 C2 L2</td>
                    <td className="py-2.5 px-3">USGS / NASA</td>
                    <td className="py-2.5 px-3 text-nasablue-700 font-bold">NASA</td>
                    <td className="py-2.5 px-3">30 m</td>
                    <td className="py-2.5 px-3">SSEBop Evapotranspiration</td>
                    <td className="py-2.5 px-3 text-amber-600">Cloud cover during monsoon; 16-day repeat</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">MODIS MOD16A2GF</td>
                    <td className="py-2.5 px-3">NASA LP DAAC</td>
                    <td className="py-2.5 px-3 text-nasablue-700 font-bold">NASA</td>
                    <td className="py-2.5 px-3">500 m (8-day)</td>
                    <td className="py-2.5 px-3">ETa cross-check calibration</td>
                    <td className="py-2.5 px-3 text-gray-500">Coarser spatial resolution than Landsat</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">NASA POWER AG</td>
                    <td className="py-2.5 px-3">NASA Langley</td>
                    <td className="py-2.5 px-3 text-nasablue-700 font-bold">NASA</td>
                    <td className="py-2.5 px-3">0.5° (~50 km)</td>
                    <td className="py-2.5 px-3">Solar radiation, daily temps, ET₀</td>
                    <td className="py-2.5 px-3 text-amber-600">2-day latency in recent observations</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">SoilGrids</td>
                    <td className="py-2.5 px-3">ISRIC (Wageningen)</td>
                    <td className="py-2.5 px-3 text-purple-700 font-bold">EXTERNAL (Non-NASA)</td>
                    <td className="py-2.5 px-3">250 m</td>
                    <td className="py-2.5 px-3">Initial soil texture & pH baseline</td>
                    <td className="py-2.5 px-3 text-red-600">Model prediction; user/SRDI override preferred</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">Crop Agronomy & BNF</td>
                    <td className="py-2.5 px-3">BARI / BRRI / BJRI</td>
                    <td className="py-2.5 px-3 text-purple-700 font-bold">EXTERNAL (National)</td>
                    <td className="py-2.5 px-3">Field trial trials</td>
                    <td className="py-2.5 px-3">Variety calendars, N-fixation rates</td>
                    <td className="py-2.5 px-3 text-gray-500">Requires local market price context</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Future Soil Health Prediction Methodology */}
          <div className="space-y-2 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <h4 className="font-extrabold text-sm text-amber-900 dark:text-yellow-400 flex items-center gap-1.5 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>{language === "bn" ? "ভবিষ্যৎ মাটির স্বাস্থ্য অনুমানের বৈজ্ঞানিক মডেল (Soil Health Methodology)" : "Soil Health Prediction Methodology"}</span>
            </h4>
            <p>
              {language === "bn"
                ? "মাটির ভবিষ্যৎ পূর্বাভাস দিতে টেরাশিফ্‌ট স্যাটেলাইট মাটির আর্দ্রতার ওপর এককভাবে নির্ভর করে না। স্যাটেলাইট শুধুমাত্র মাটির পানির সংকট নির্দেশ করে। মাটির নাইট্রোজেন ও জৈব কার্বন প্রক্ষেপণে আন্তর্জাতিকভাবে স্বীকৃত দুটি বৈজ্ঞানিক মডেল ব্যবহৃত হয়েছে:"
                : "TerraShift does NOT use satellite soil moisture alone to predict future soil nitrogen or organic carbon. Moisture is purely hydrological context. Soil evolution is modeled using:"}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 pt-1">
              <li>
                <strong>RothC সয়েল অর্গানিক কার্বন মডেল (Coleman & Jenkinson 1996, Lal 2004):</strong> ফসলের শিকড় ও ঝরা পাতা থেকে যোগ হওয়া বার্ষিক জৈববস্তু (DPM/RPM), মাটির কাদামাটির গঠন (Clay %) এবং তাপমাত্রার বিয়োজন হার সমন্বয়ে ৩ বছরে টপসয়েল SOC গতিপথ নির্ণয়।
              </li>
              <li>
                <strong>Peoples et al. (2001, 2009) BNF মডেল:</strong> ডাল ফসলের শুষ্ক কাণ্ড-পাতা ও রাইজোবিয়াম নডিউল দ্বারা প্রাকৃতিকভাবে সংবন্ধিত জৈব নাইট্রোজেন সমীকরণ (N_fixed = Q × Biomass × %Ndfa)।
              </li>
            </ul>
          </div>

          {/* Section 3: Limitations & Farmer Centered Ethics */}
          <div className="space-y-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-yellow-400 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>{language === "bn" ? "সীমাবদ্ধতা ও কৃষকের নিজস্ব বিবেচনা (Limitations & Honesty)" : "Limitations & Ethics"}</span>
            </h4>
            <p>
              {language === "bn"
                ? "১. SMAP L4-এর ৯ কিমি রেজোলিউশন আঞ্চলিক উপাত্ত—এটি কোনো নির্দিষ্ট কৃষকের ১ বিঘার মাঠ পরীক্ষা নয়। ২. বোরো ধানের জলাবদ্ধ জমিতে স্যাটেলাইট রাডার অতিরিক্ত আর্দ্রতা দেখাতে পারে। ৩. টেরাশিফ্‌ট কখনো কৃষক বা উপজেলা কৃষি কর্মকর্তার অভিজ্ঞতার বিকল্প দাবি করে না—এটি একটি নির্ভরযোগ্য সিদ্ধান্ত-সহায়ক মাধ্যম।"
                : "1. SMAP L4 (9 km) is regional hydrological context, not a field test. 2. Flooded paddy soils distort microwave emission. 3. TerraShift strictly supports—and never replaces—farmer judgment and local agricultural extension officers."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-agrogreen-700 text-white dark:bg-yellow-400 dark:text-black font-extrabold text-xs shadow hover:opacity-90"
          >
            {language === "bn" ? "ঠিক আছে, বুঝেছি" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
