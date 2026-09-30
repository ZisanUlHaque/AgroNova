"use client";

import React, { useState } from "react";
import { Language, translations } from "../lib/translations";
import {
  Droplets,
  Zap,
  ShieldCheck,
  Info,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Wheat,
  Flower2,
  TreeDeciduous,
  Salad
} from "lucide-react";

interface PlanViewProps {
  language: Language;
  plan: any;
  alternativePlan?: any;
  onGoalChange: (goal: string) => void;
  currentGoal: string;
  onSaveOffline: () => void;
  isSavedOffline: boolean;
  onOpenNasaContext: () => void;
}

export function PlanView({
  language,
  plan,
  alternativePlan,
  onGoalChange,
  currentGoal,
  onSaveOffline,
  isSavedOffline,
  onOpenNasaContext,
}: PlanViewProps) {
  const t = translations[language];
  const [selectedPlanType, setSelectedPlanType] = useState<"recommended" | "alternative">("recommended");
  const [showConfidenceDetail, setShowConfidenceDetail] = useState(false);

  const activePlan = selectedPlanType === "recommended" ? plan : (alternativePlan || plan);

  if (!activePlan || !activePlan.seasons) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        No rotation plan available yet.
      </div>
    );
  }

  // Group 12 seasons into 4 years (3 seasons per year)
  const years = [1, 2, 3, 4].map((yr) => ({
    yearNumber: yr,
    seasons: activePlan.seasons.filter((s: any) => s.year === yr),
  }));

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "HIGH":
        return {
          label: t.confidence.high,
          bg: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-600",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        };
      case "LOW":
        return {
          label: t.confidence.low,
          bg: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-600",
          icon: <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />,
        };
      case "MEDIUM":
      default:
        return {
          label: t.confidence.medium,
          bg: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-yellow-300 dark:border-yellow-600",
          icon: <Info className="w-4 h-4 text-amber-600 dark:text-yellow-400" />,
        };
    }
  };

  const getCropIcon = (cropId: string) => {
    if (cropId.includes("mustard")) return <Flower2 className="w-8 h-8 text-yellow-500" />;
    if (cropId.includes("wheat") || cropId.includes("rice")) return <Wheat className="w-8 h-8 text-amber-600" />;
    if (cropId.includes("lentil") || cropId.includes("chickpea") || cropId.includes("mung")) return <Salad className="w-8 h-8 text-emerald-600" />;
    if (cropId.includes("jute")) return <TreeDeciduous className="w-8 h-8 text-green-700" />;
    return <Sparkles className="w-8 h-8 text-agrogreen-600" />;
  };

  const confBadge = getConfidenceBadge(activePlan.confidence);

  return (
    <div className="space-y-6">
      {/* Header Controls: Goal Selector, Plan Switcher & Confidence Badge */}
      <div className="bg-white dark:bg-gray-900 border-2 border-agrogreen-200 dark:border-yellow-400 rounded-2xl p-4 shadow-sm space-y-4">
        {/* Title & Disclaimers */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-yellow-400 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-agrogreen-600 dark:text-yellow-400" />
              <span>{t.planTitle}</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
              {t.agronomicReview}
            </p>
          </div>

          {/* Confidence Badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfidenceDetail(!showConfidenceDetail)}
              className={`min-h-touch px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${confBadge.bg}`}
              title="Click to view confidence verification"
            >
              {confBadge.icon}
              <span>{confBadge.label}</span>
            </button>
            <button
              onClick={onSaveOffline}
              className={`min-h-touch px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                isSavedOffline
                  ? "bg-agrogreen-600 text-white border-agrogreen-700"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"
              }`}
            >
              {isSavedOffline ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSavedOffline ? t.savedOfflineSuccess : t.saveOffline}</span>
            </button>
          </div>
        </div>

        {/* Confidence Explanation popover */}
        {showConfidenceDetail && (
          <div className="p-3 bg-amber-50 dark:bg-gray-800 border border-amber-300 dark:border-yellow-400 rounded-xl text-xs text-gray-700 dark:text-gray-200 space-y-1">
            <div className="font-bold flex items-center gap-1 text-amber-900 dark:text-yellow-300">
              <Info className="w-4 h-4" />
              <span>Confidence Basis:</span>
            </div>
            <p>{language === "bn" ? activePlan.confidenceReasonBn : activePlan.confidenceReasonEn}</p>
          </div>
        )}

        {/* Target Goal Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1">
            লক্ষ্য (Goal):
          </span>
          {[
            { id: "BALANCED", label: t.goals.balanced },
            { id: "CONSERVE_WATER", label: t.goals.conserveWater },
            { id: "RESTORE_NITROGEN", label: t.goals.restoreNitrogen },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => onGoalChange(g.id)}
              className={`min-h-touch px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                currentGoal === g.id
                  ? "bg-agrogreen-700 text-white border-agrogreen-800 dark:bg-yellow-400 dark:text-black dark:border-yellow-500 shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Plan Alternative Switcher */}
        {alternativePlan && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setSelectedPlanType("recommended")}
              className={`min-h-touch flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center border transition-all ${
                selectedPlanType === "recommended"
                  ? "bg-agrogreen-600 text-white border-agrogreen-700 dark:bg-yellow-400 dark:text-black"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200"
              }`}
            >
              ⭐ {t.recommendedPlan}
            </button>
            <button
              onClick={() => setSelectedPlanType("alternative")}
              className={`min-h-touch flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center border transition-all ${
                selectedPlanType === "alternative"
                  ? "bg-agrogreen-600 text-white border-agrogreen-700 dark:bg-yellow-400 dark:text-black"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200"
              }`}
            >
              🔄 {t.alternativePlan}
            </button>
          </div>
        )}

        {/* Range Estimates Banners (PRD Section 7.3: Sourced ranges, never single precise numbers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                {t.waterSavings}
              </div>
              <div className="text-sm font-extrabold text-blue-950 dark:text-blue-100">
                {activePlan.waterSavingsRange}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                {t.nitrogenGain}
              </div>
              <div className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100">
                {activePlan.nitrogenGainRange}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Years Cards Grid */}
      <div className="space-y-6">
        {years.map(({ yearNumber, seasons }) => (
          <div
            key={yearNumber}
            className="border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-5 bg-white dark:bg-gray-900 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-agrogreen-600 text-white dark:bg-yellow-400 dark:text-black font-black flex items-center justify-center text-sm shadow">
                  {yearNumber}
                </span>
                <span className="text-lg font-black text-gray-900 dark:text-yellow-400">
                  {t.year} {yearNumber}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                ৩ মৌসুম (৩ ফসল চক্র)
              </span>
            </div>

            {/* 3 Seasons in this Year */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {seasons.map((slot: any, sIdx: number) => {
                const seasonLabel =
                  slot.season === "Rabi"
                    ? t.seasons.rabi
                    : slot.season === "Kharif-1"
                    ? t.seasons.kharif1
                    : t.seasons.kharif2;

                const isLegume = slot.family === "Fabaceae";

                return (
                  <div
                    key={sIdx}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      isLegume
                        ? "bg-emerald-50/60 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700"
                        : "bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div>
                      {/* Season Header */}
                      <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                        <span className="uppercase tracking-wide">{seasonLabel}</span>
                        {isLegume && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                            Legume / ডাল
                          </span>
                        )}
                      </div>

                      {/* Crop Icon & Name */}
                      <div className="flex items-center gap-3 my-2">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                          {getCropIcon(slot.cropId)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-gray-900 dark:text-yellow-300">
                            {language === "bn" ? slot.cropNameBn : slot.cropNameEn}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {slot.variety}
                          </p>
                        </div>
                      </div>

                      {/* Agronomic Reason */}
                      <p className="text-xs text-gray-700 dark:text-gray-300 my-2 leading-relaxed bg-white/70 dark:bg-gray-900/70 p-2.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                        {language === "bn" ? slot.reasonBn : slot.reasonEn}
                      </p>
                    </div>

                    {/* Metrics Footer */}
                    <div className="pt-2 border-t border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between text-[11px] font-bold text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-blue-500" />
                        <span>সেচ {slot.waterDemand}/৫</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{slot.nFixRange.text}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Button to view NASA Context */}
      <div className="text-center pt-2">
        <button
          onClick={onOpenNasaContext}
          className="min-h-touch px-6 py-3 rounded-2xl bg-nasablue-600 hover:bg-nasablue-700 text-white font-extrabold text-sm shadow-md transition-all inline-flex items-center gap-2"
        >
          <Layers className="w-4 h-4" />
          <span>{t.viewNasaData}</span>
        </button>
      </div>
    </div>
  );
}
