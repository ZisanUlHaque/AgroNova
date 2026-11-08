"use client";

import React, { useState, useEffect } from "react";
import { Language } from "../lib/translations";
import { X, Wifi, WifiOff, HardDrive, Database, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { offlineDb } from "../lib/offlineDb";

interface OfflineSyncModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
}

export function OfflineSyncModal({
  language,
  isOpen,
  onClose,
  isSimulatedOffline,
  onToggleSimulatedOffline,
}: OfflineSyncModalProps) {
  const [cachedFarmCount, setCachedFarmCount] = useState<number>(0);
  const [cachedPlanCount, setCachedPlanCount] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      void (async () => {
        try {
          const farms = await offlineDb.getFarms();
          setCachedFarmCount(farms.length);
          const plans = await offlineDb.plans.toArray();
          setCachedPlanCount(plans.length);
        } catch (e) {
          console.error("Failed to read offline stats", e);
        }
      })();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border-2 border-agrogreen-400 dark:border-yellow-400 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-agrogreen-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-agrogreen-700 dark:text-yellow-400" />
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-yellow-400">
                {language === "bn" ? "অফলাইন-ফার্স্ট আর্কিটেকচার ও লাইভ ডেমো" : "Offline-First PWA Architecture & Live Demo"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                {language === "bn" ? "ইন্টারনেট ছাড়াও পূর্ণাঙ্গ শস্য আবর্তন তৈরি ও সংরক্ষণ" : "Works in remote delta fields without active internet"}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Airplane Mode Toggle Bar */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-gray-800 border-2 border-amber-300 dark:border-yellow-500 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl text-white ${isSimulatedOffline ? "bg-amber-600 animate-pulse" : "bg-emerald-600"}`}>
                {isSimulatedOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-extrabold text-sm text-gray-900 dark:text-yellow-400 block">
                  {language === "bn" ? "এয়ারপ্লেন মোড সিমুলেটর (Airplane Mode Simulation)" : "Airplane Mode Simulator"}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                  {isSimulatedOffline
                    ? (language === "bn" ? "সিমুলেটেড ইন্টারনেট বিচ্ছিন্ন (অফলাইন মোড সক্রিয়)" : "Simulated Offline Mode Active")
                    : (language === "bn" ? "ইন্টারনেট সংযুক্ত (অনলাইন মোড)" : "Online Mode Connected")}
                </span>
              </div>
            </div>

            <button
              onClick={onToggleSimulatedOffline}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all shadow ${
                isSimulatedOffline
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300"
              }`}
            >
              {isSimulatedOffline
                ? (language === "bn" ? "অনলাইন করুন" : "Turn Online")
                : (language === "bn" ? "অফলাইন টেস্ট চালান" : "Simulate Offline")}
            </button>
          </div>

          {/* Offline Storage Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
              <span className="text-[11px] text-gray-500 block font-bold">ডিভাইসে সংরক্ষিত খামার (IndexedDB)</span>
              <span className="text-2xl font-black text-agrogreen-700 dark:text-yellow-400">{cachedFarmCount} টি</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
              <span className="text-[11px] text-gray-500 block font-bold">সংরক্ষিত শস্য পরিকল্পনা (Plans)</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-yellow-400">{cachedPlanCount} টি</span>
            </div>
          </div>

          {/* 3-Step Demonstration Guide */}
          <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-yellow-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Database className="w-4 h-4 text-agrogreen-600" />
              <span>{language === "bn" ? "ইন্টারনেট ছাড়া ৩টি ধাপে কার্যপদ্ধতি (How It Works):" : "3-Step Offline Flow"}</span>
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-gray-800/60 border border-blue-100 dark:border-gray-700 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  ১
                </span>
                <div>
                  <strong className="text-gray-900 dark:text-yellow-400">প্রাথমিক ডেটা প্রি-বান্ডলিং (Pre-Bundled Data):</strong>
                  <p className="text-gray-600 dark:text-gray-300 mt-0.5">
                    বাংলাদেশের ৮টি প্রধান কৃষি পরিবেশ অঞ্চলের (AEZ-25 বরেন্দ্র, AEZ-13 বরিশাল ইত্যাদি) নাসার ঐতিহাসিক মাটির আর্দ্রতা ও আবহাওয়ার ডেটা PWA ইন্সটলেশনের সময়ই ডিভাইসের IndexedDB-তে প্রি-লোড থাকে।
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-gray-800/60 border border-emerald-100 dark:border-gray-700 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  ২
                </span>
                <div>
                  <strong className="text-gray-900 dark:text-yellow-400">অন-ডিভাইস অ্যালগরিদম ক্যালকুলেশন (On-Device Engine):</strong>
                  <p className="text-gray-600 dark:text-gray-300 mt-0.5">
                    সার্ভার ডাউন বা ইন্টারনেট না থাকলেও টাইপস্ক্রিপ্ট অপটিমাইজেশন ইঞ্জিন সরাসরি ব্রাউজারে রান করে এবং ৩ বছরের শস্য পরিকল্পনা ও পরিমাণগত প্রভাব প্রস্তুত করে।
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-gray-800/60 border border-purple-100 dark:border-gray-700 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  ৩
                </span>
                <div>
                  <strong className="text-gray-900 dark:text-yellow-400">ব্যাকগ্রাউন্ড সিঙ্ক (Background Sync Queue):</strong>
                  <p className="text-gray-600 dark:text-gray-300 mt-0.5">
                    কৃষক যখন পরবর্তীতে বাজারে বা ইন্টারনেটের আওতায় আসবেন, তখন সর্বশেষ NASA SMAP ও আবহাওয়া ডেটা ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-agrogreen-700 text-white dark:bg-yellow-400 dark:text-black font-extrabold text-xs shadow hover:opacity-90"
          >
            {language === "bn" ? "ঠিক আছে" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
