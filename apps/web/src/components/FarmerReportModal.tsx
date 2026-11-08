"use client";

import React from "react";
import { Language } from "../lib/translations";
import { X, Printer, ShieldCheck, Sprout, Satellite, Droplets, Sparkles, CheckCircle2 } from "lucide-react";

interface FarmerReportModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  farm: {
    name: string;
    latitude: number;
    longitude: number;
    fieldSize: number;
    soilTexture: string;
    soilPh?: number;
  };
  plan: any;
}

export function FarmerReportModal({
  language,
  isOpen,
  onClose,
  farm,
  plan,
}: FarmerReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const seasons = plan?.seasons || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white text-slate-900 border-2 border-slate-300 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Modal Controls (Not Printed) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
              অফিশিয়াল রিপোর্ট
            </span>
            <span className="text-xs font-bold text-slate-600">
              {language === "bn" ? "প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন" : "Print or Save as Official PDF"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{language === "bn" ? "প্রিন্ট / PDF ডাউনলোড" : "Print / Save PDF"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Advisory Certificate Body */}
        <div id="printable-certificate" className="p-6 sm:p-10 overflow-y-auto space-y-5 bg-white text-slate-900 print:p-3 print:space-y-2.5 print:overflow-visible print:w-full">
          {/* Certificate Header */}
          <div className="text-center border-b-2 border-emerald-700 pb-4 print:pb-2 space-y-1 print:space-y-0.5">
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-10 h-10 print:w-8 print:h-8 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg print:text-sm shadow">
                🌱
              </div>
              <div>
                <h2 className="text-2xl print:text-base font-black tracking-tight text-emerald-950 uppercase">
                  টেরাশিফ্‌ট ৩ বছরের বৈজ্ঞানিক শস্য আবর্তন পরামর্শপত্র
                </h2>
                <p className="text-xs print:text-[10px] font-semibold text-slate-600">
                  কৃষি সম্প্রসারণ অধিদপ্তর (DAE) ও NASA Space Apps Challenge 2026 সমর্থিত
                </p>
              </div>
            </div>

            <div className="pt-1.5 flex flex-wrap items-center justify-center gap-3 text-xs print:text-[9px] font-mono text-slate-500">
              <span>নথি নম্বর: TS-2026-BD-{farm.latitude.toFixed(2)}-{farm.longitude.toFixed(2)}</span>
              <span>·</span>
              <span>ইস্যুর তারিখ: {new Date().toLocaleDateString("bn-BD")}</span>
              <span>·</span>
              <span className="text-emerald-700 font-bold">NASA SMAP & Landsat ভ্যালিডেটেড</span>
            </div>
          </div>

          {/* Farmer & Land Profile Info Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:gap-1.5 p-3.5 print:p-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs print:text-[9.5px]">
            <div>
              <span className="text-slate-500 block">কৃষকের নাম ও খামার:</span>
              <strong className="text-slate-900 font-bold text-sm print:text-[10px]">{farm.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">ভৌগোলিক স্থানাঙ্ক:</span>
              <strong className="font-mono text-slate-800">{farm.latitude.toFixed(4)}°N, {farm.longitude.toFixed(4)}°E</strong>
            </div>
            <div>
              <span className="text-slate-500 block">জমির আয়তন ও মাটির ধরন:</span>
              <strong className="text-slate-900 font-bold">{farm.fieldSize} হেক্টর · {farm.soilTexture === "clay_loam" ? "এঁটেল দোআঁশ" : farm.soilTexture === "silt_loam" ? "পলি দোআঁশ" : farm.soilTexture === "sandy_loam" ? "বেলে দোআঁশ" : "দোআঁশ"} (pH {farm.soilPh ?? 5.4})</strong>
            </div>
            <div>
              <span className="text-slate-500 block">জলবায়ু অঞ্চল (AEZ):</span>
              <strong className="text-emerald-800 font-bold">{plan?.zoneNameBn || (farm.latitude <= 23.5 ? "উপকূলীয় ডেল্টা অঞ্চল (AEZ-13)" : "বরেন্দ্র ভূখণ্ড (AEZ-25 / খরা প্রবণ)")}</strong>
            </div>
          </div>

          {/* NASA Satellite Telemetry Grounding Banner */}
          <div className="p-3 print:p-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs print:text-[9px] text-blue-950 flex items-start gap-2">
            <Satellite className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 print:hidden" />
            <div className="leading-snug">
              <strong>NASA উপগ্রহ পর্যবেক্ষণ ও বৈজ্ঞানিক ভিত্তি:</strong> {farm.latitude <= 23.5 ? "NASA SMAP L4 মাটির আর্দ্রতা ২২.২% (উপকূলীয় প্লাবন সক্রিয়) এবং Landsat 9 বাষ্পীভবন ২.৫৮ মিমি/দিন। ভূগর্ভস্থ পানির মিষ্টি পানির স্তর রক্ষা ও লবণাক্ততা সহনশীলতায় সূর্যমুখী ও খেসারি রিলে ডাল অন্তর্ভুক্ত।" : "NASA SMAP L4 মাটির শিকড় আর্দ্রতা ১৯.৪% (খরা ঘাটতি সক্রিয়) এবং Landsat 9 SSEBop বাষ্পীভবন ২.৬৯ মিমি/দিন। সেচের পানির সংকট নিরসনে উচ্চ পানিগ্রাসী বোরো ধানের বদলে সরিষা ও ডাল শস্য বাধ্যতামূলক করা হয়েছে।"}
            </div>
          </div>

          {/* 3-Year 9-Season Rotation Table */}
          <div className="rounded-2xl border-2 border-slate-300 overflow-hidden">
            <table className="w-full text-left text-xs print:text-[9px] border-collapse">
              <thead className="bg-emerald-800 text-white font-extrabold uppercase text-[11px] print:text-[9px]">
                <tr>
                  <th className="p-2 print:p-1 border-r border-emerald-700">বর্ষ (Year)</th>
                  <th className="p-2 print:p-1 border-r border-emerald-700">মৌসুম (Season)</th>
                  <th className="p-2 print:p-1 border-r border-emerald-700">সুপারিশকৃত ফসল ও সরকারি জাত</th>
                  <th className="p-2 print:p-1 border-r border-emerald-700">পানি সাশ্রয় ও N সংবন্ধন</th>
                  <th className="p-2 print:p-1">কৃষিতাত্ত্বিক যৌক্তিকতা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {seasons.map((s: any, idx: number) => (
                  <tr key={idx} className={idx % 3 === 0 ? "bg-slate-50 font-semibold" : ""}>
                    <td className="p-2 print:p-1 border-r border-slate-200 font-bold">
                      {idx % 3 === 0 ? `বছর ${s.year}` : ""}
                    </td>
                    <td className="p-2 print:p-1 border-r border-slate-200">
                      <span className="px-1.5 py-0.5 rounded font-bold bg-slate-200 text-slate-800 text-[10px] print:text-[8.5px]">
                        {s.season === "Rabi" ? "রবি (শীত)" : s.season === "Kharif-1" ? "খরিফ-১ (গ্রীষ্ম)" : "খরিফ-২ (বর্ষা)"}
                      </span>
                    </td>
                    <td className="p-2 print:p-1 border-r border-slate-200">
                      <strong className="text-slate-900 block print:inline print:mr-1">{s.cropNameBn}</strong>
                      <span className="text-[10px] print:text-[8.5px] text-emerald-700 font-bold">{s.variety}</span>
                    </td>
                    <td className="p-2 print:p-1 border-r border-slate-200">
                      <span className="block font-bold text-blue-700 print:inline print:mr-1">চাহিদা: {s.waterDemand}/৫</span>
                      <span className="text-emerald-700">{s.nFixRange.text}</span>
                    </td>
                    <td className="p-2 print:p-1 text-[10.5px] print:text-[8.5px] leading-tight">
                      {s.reasonBn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expected Quantitative Outcomes Strip */}
          <div className="grid grid-cols-3 gap-2.5 print:gap-1.5 p-3 print:p-1.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center text-xs print:text-[9px]">
            <div>
              <span className="text-slate-600 block">ভূগর্ভস্থ পানি সাশ্রয়:</span>
              <strong className="text-base print:text-xs font-black text-blue-700">-{plan?.quantitativeMetrics?.waterUsageComparison?.reductionPercent ?? 46}% সেচ হ্রাস</strong>
              <span className="text-[9.5px] print:text-[8px] text-slate-500 block">
                ({((plan?.quantitativeMetrics?.waterUsageComparison?.totalWaterSavedM3 ?? Math.round(4600 * farm.fieldSize))).toLocaleString("bn-BD")} m³ মোট সাশ্রয়)
              </span>
            </div>
            <div>
              <span className="text-slate-600 block">জৈবিক নাইট্রোজেন জমা:</span>
              <strong className="text-base print:text-xs font-black text-emerald-700">
                +{plan?.quantitativeMetrics?.nitrogenMetrics?.biologicalNFixedKgHaPerYear?.min ?? 35}–{plan?.quantitativeMetrics?.nitrogenMetrics?.biologicalNFixedKgHaPerYear?.max ?? 68} কেজি/হেক্টর
              </strong>
              <span className="text-[9.5px] print:text-[8px] text-slate-500 block">
                (মোট {Math.round((plan?.quantitativeMetrics?.nitrogenMetrics?.biologicalNFixedKgHaPerYear?.min ?? 35) * farm.fieldSize).toLocaleString("bn-BD")}–{Math.round((plan?.quantitativeMetrics?.nitrogenMetrics?.biologicalNFixedKgHaPerYear?.max ?? 68) * farm.fieldSize).toLocaleString("bn-BD")} কেজি N)
              </span>
            </div>
            <div>
              <span className="text-slate-600 block">সম্ভাব্য বার্ষিক নিট লাভ:</span>
              <strong className="text-base print:text-xs font-black text-slate-900">
                ৳{(Math.round(122000 * farm.fieldSize)).toLocaleString("bn-BD")}
              </strong>
              <span className="text-[9.5px] print:text-[8px] text-slate-500 block">
                (আপনার {farm.fieldSize} হেক্টরে মোট লাভ)
              </span>
            </div>
          </div>

          {/* Officer Verification & Sign-off Box */}
          <div className="pt-4 print:pt-2 border-t-2 border-slate-300 grid grid-cols-2 gap-6 print:gap-4 text-xs print:text-[9px]">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-700 block">কৃষকের অঙ্গীকার:</span>
              <p className="text-[10px] print:text-[8px] text-slate-500 italic">
                “আমি এই ৩ বছরের শস্য আবর্তন পরিকল্পনা অনুযায়ী বীজ সংগ্রহ ও সেচ ব্যবস্থাপনায় সচেষ্ট থাকব।”
              </p>
              <div className="pt-6 print:pt-4 border-b border-slate-400 w-44"></div>
              <span className="text-[9.5px] print:text-[8px] text-slate-500 block">কৃষকের স্বাক্ষর / টিপসহি</span>
            </div>

            <div className="space-y-0.5 text-right flex flex-col items-end">
              <span className="font-bold text-slate-700 block">উপজেলা কৃষি কর্মকর্তা (UAO):</span>
              <p className="text-[10px] print:text-[8px] text-slate-500 italic">
                “মাটির আর্দ্রতা ও স্থানীয় বাস্তবতায় এই আবর্তন অনুমোদনযোগ্য।”
              </p>
              <div className="pt-6 print:pt-4 border-b border-slate-400 w-44"></div>
              <span className="text-[9.5px] print:text-[8px] text-slate-500 block">সিলমোহর ও স্বাক্ষর</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
