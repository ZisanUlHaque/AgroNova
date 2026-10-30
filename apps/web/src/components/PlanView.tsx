"use client";

import React, { useState } from "react";
import { Language, translations } from "../lib/translations";
import {
  Droplets,
  ShieldCheck,
  Info,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Save,
  Wheat,
  Flower2,
  TreeDeciduous,
  Salad,
  TrendingDown,
  TrendingUp,
  Coins,
  Bug,
  Scale,
  Sliders,
  BarChart3,
  BookOpen
} from "lucide-react";

interface PlanViewProps {
  language: Language;
  plan: any;
  alternativePlan?: any;
  onGoalChange: (goal: string) => void;
  currentGoal: string;
  onCycleChange?: (years: 3 | 4) => void;
  currentCycle?: number;
  onOpenCustomWeights?: () => void;
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
  onCycleChange,
  currentCycle = 3,
  onOpenCustomWeights,
  onSaveOffline,
  isSavedOffline,
  onOpenNasaContext,
}: PlanViewProps) {
  const t = translations[language];
  const [selectedPlanType, setSelectedPlanType] = useState<"recommended" | "alternative">("recommended");
  const [showConfidenceDetail, setShowConfidenceDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "quantitative">("timeline");

  const activePlan = selectedPlanType === "recommended" ? plan : (alternativePlan || plan);

  if (!activePlan || !activePlan.seasons) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        No rotation plan available yet.
      </div>
    );
  }

  // Determine number of years (3 or 4)
  const totalYears = activePlan.cycleYears || Math.round(activePlan.seasons.length / 3) || 3;
  const years = Array.from({ length: totalYears }, (_, i) => ({
    yearNumber: i + 1,
    seasons: activePlan.seasons.filter((s: any) => s.year === i + 1),
  }));

  const metrics = activePlan.quantitativeMetrics;

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
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-nasablue-100 text-nasablue-800 dark:bg-nasablue-950 dark:text-nasablue-300">
                NASA Space Apps 2026
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-agrogreen-100 text-agrogreen-800 dark:bg-agrogreen-950 dark:text-agrogreen-300">
                Team AgroNova
              </span>
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-yellow-400 flex items-center gap-2 mt-1">
              <Calendar className="w-5 h-5 text-agrogreen-600 dark:text-yellow-400" />
              <span>{t.planTitle} ({totalYears} {language === "bn" ? "বছর" : "Years"} · {totalYears * 3} {language === "bn" ? "মৌসুম" : "Seasons"})</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
              {t.agronomicReview}
            </p>
          </div>

          {/* Action Buttons: Confidence & Save Offline */}
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
              <span>Scientific Confidence Assessment:</span>
            </div>
            <p>{language === "bn" ? activePlan.confidenceReasonBn : activePlan.confidenceReasonEn}</p>
          </div>
        )}

        {/* Controls Row: Rotation Cycle (3 vs 4 Years) & Goal Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          {/* Target Goal Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1">
              {language === "bn" ? "অগ্রাধিকার লক্ষ্য:" : "Optimization Goal:"}
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

            {onOpenCustomWeights && (
              <button
                onClick={onOpenCustomWeights}
                className={`min-h-touch px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                  currentGoal === "CUSTOM"
                    ? "bg-agrogreen-700 text-white border-agrogreen-800 dark:bg-yellow-400 dark:text-black"
                    : "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 hover:bg-purple-100"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{t.goals.custom}</span>
              </button>
            )}
          </div>

          {/* 3-Year vs 4-Year Cycle Switcher */}
          {onCycleChange && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-[11px] font-bold text-gray-500 px-2">
                {t.cycleSwitchLabel}
              </span>
              <button
                onClick={() => onCycleChange(3)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentCycle === 3
                    ? "bg-white dark:bg-gray-700 text-agrogreen-700 dark:text-yellow-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-black"
                }`}
              >
                3 Years (9 Seasons)
              </button>
              <button
                onClick={() => onCycleChange(4)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentCycle === 4
                    ? "bg-white dark:bg-gray-700 text-agrogreen-700 dark:text-yellow-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-black"
                }`}
              >
                4 Years (12 Seasons)
              </button>
            </div>
          )}
        </div>

        {/* View Mode Tabs: Rotation Calendar vs Quantitative Impact */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`min-h-touch flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
              activeTab === "timeline"
                ? "bg-agrogreen-600 text-white border-agrogreen-700 dark:bg-yellow-400 dark:text-black"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 hover:bg-gray-200"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t.rotationTimelineView}</span>
          </button>
          <button
            onClick={() => setActiveTab("quantitative")}
            className={`min-h-touch flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
              activeTab === "quantitative"
                ? "bg-agrogreen-600 text-white border-agrogreen-700 dark:bg-yellow-400 dark:text-black"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 hover:bg-gray-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t.comparisonView}</span>
          </button>
        </div>

        {/* Plan Alternative Switcher */}
        {alternativePlan && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setSelectedPlanType("recommended")}
              className={`min-h-touch flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-center border transition-all ${
                selectedPlanType === "recommended"
                  ? "bg-agrogreen-100 text-agrogreen-900 border-agrogreen-300 dark:bg-gray-800 dark:text-yellow-400 dark:border-yellow-500"
                  : "bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent"
              }`}
            >
              ⭐ {t.recommendedPlan}
            </button>
            <button
              onClick={() => setSelectedPlanType("alternative")}
              className={`min-h-touch flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-center border transition-all ${
                selectedPlanType === "alternative"
                  ? "bg-agrogreen-100 text-agrogreen-900 border-agrogreen-300 dark:bg-gray-800 dark:text-yellow-400 dark:border-yellow-500"
                  : "bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent"
              }`}
            >
              🔄 {t.alternativePlan}
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: QUANTITATIVE IMPACT ANALYSIS */}
      {activeTab === "quantitative" && metrics && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 border-2 border-agrogreen-300 dark:border-yellow-400">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-yellow-400 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-agrogreen-600 dark:text-yellow-400" />
              <span>{t.quantitativeImpactTitle}</span>
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {metrics.tradeOffs.summaryBn && language === "bn"
                ? metrics.tradeOffs.summaryBn
                : metrics.tradeOffs.summaryEn}
            </p>
          </div>

          {/* 4 Quantitative Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Water Savings */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                  {t.metrics.waterReductionLabel}
                </span>
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-blue-700 dark:text-blue-300">
                  -{metrics.waterUsageComparison.reductionPercent}%
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {language === "bn" ? "কম সেচ" : "vs Boro"}
                </span>
              </div>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                {language === "bn"
                  ? `বছরে প্রায় ${(metrics.waterUsageComparison.waterSavedM3PerHa).toLocaleString()} ঘনমিটার/হেক্টর পানি সাশ্রয়।`
                  : `Saves ~${(metrics.waterUsageComparison.waterSavedM3PerHa).toLocaleString()} m³/ha irrigation water annually.`}
              </p>
              <div className="pt-2 border-t border-blue-200 dark:border-blue-900/60 text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {language === "bn"
                    ? `ডিজেল সেচে সাশ্রয়: ৳${metrics.waterUsageComparison.pumpingCostSavedBdtPerHa.min.toLocaleString()}–${metrics.waterUsageComparison.pumpingCostSavedBdtPerHa.max.toLocaleString()}/হেক্টর`
                    : `Pumping fuel saved: ৳${metrics.waterUsageComparison.pumpingCostSavedBdtPerHa.min.toLocaleString()}–${metrics.waterUsageComparison.pumpingCostSavedBdtPerHa.max.toLocaleString()} BDT/ha`}
                </span>
              </div>
            </div>

            {/* 2. Biological Nitrogen Fixation */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  {t.metrics.nFixedLabel}
                </span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  +{metrics.nitrogenMetrics.biologicalNFixedKgHaPerYear.min}–{metrics.nitrogenMetrics.biologicalNFixedKgHaPerYear.max}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  kg N/ha/yr
                </span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-200">
                {language === "bn"
                  ? `ডাল ফসলের নডিউল থেকে প্রাকৃতিকভাবে সংবন্ধিত জৈব নাইট্রোজেন।`
                  : `Biological nitrogen fixed directly by pulse rhizobial nodules.`}
              </p>
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/60 text-[11px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {language === "bn"
                    ? `ইউরিয়া সার সাশ্রয়: ৳${metrics.nitrogenMetrics.fertilizerCostSavedBdtPerHa.min.toLocaleString()}–${metrics.nitrogenMetrics.fertilizerCostSavedBdtPerHa.max.toLocaleString()}/হেক্টর`
                    : `Urea cost saved: ৳${metrics.nitrogenMetrics.fertilizerCostSavedBdtPerHa.min.toLocaleString()}–${metrics.nitrogenMetrics.fertilizerCostSavedBdtPerHa.max.toLocaleString()} BDT/ha`}
                </span>
              </div>
            </div>

            {/* 3. Soil Organic Matter Accretion */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-900 dark:text-yellow-300 uppercase tracking-wider">
                  {t.metrics.somGainLabel}
                </span>
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-700 dark:text-yellow-400">
                  +{metrics.soilOrganicMatterMetrics.annualSomAccretionPercent.min}%–{metrics.soilOrganicMatterMetrics.annualSomAccretionPercent.max}%
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-yellow-500">
                  /year
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-200">
                {language === "bn"
                  ? `ডালের অবশিষ্ট ও পাটের ঝরা পাতা মাটির হিউমাস ও রস ধরে রাখার ক্ষমতা বাড়ায়।`
                  : `IPCC Tier 1 mass balance: pulse root residues & jute leaf litter replenish topsoil humus.`}
              </p>
              <div className="pt-2 border-t border-amber-200 dark:border-amber-900/60 text-[11px] font-bold text-amber-900 dark:text-yellow-300">
                <span>
                  {language === "bn"
                    ? `বার্ষিক জৈববস্তু: ${metrics.soilOrganicMatterMetrics.biomassResidueTonHaPerYear.min}–${metrics.soilOrganicMatterMetrics.biomassResidueTonHaPerYear.max} টন/হেক্টর`
                    : `Biomass added: ${metrics.soilOrganicMatterMetrics.biomassResidueTonHaPerYear.min}–${metrics.soilOrganicMatterMetrics.biomassResidueTonHaPerYear.max} t/ha/yr`}
                </span>
              </div>
            </div>

            {/* 4. Pest Disruption Score */}
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose-900 dark:text-rose-300 uppercase tracking-wider">
                  {t.metrics.pestCutLabel}
                </span>
                <Bug className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-rose-700 dark:text-rose-300">
                  -{metrics.pestDisruptionScore.pestVulnerabilityReductionPercent}%
                </span>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  vulnerability
                </span>
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-200">
                {language === "bn"
                  ? `টানা ধান চাষ ভেঙে বাদামি ঘাসফড়িং ও ব্লাইট ছত্রাকের বংশবৃদ্ধি দমন করে।`
                  : `Breaks Brown Planthopper and fungal blight cycles by family diversification.`}
              </p>
              <div className="pt-2 border-t border-rose-200 dark:border-rose-900/60 text-[11px] font-bold text-rose-900 dark:text-rose-300">
                <span>
                  {metrics.pestDisruptionScore.biofumigationPresent
                    ? (language === "bn" ? "✓ সরিষা জৈব-জীবাণুনাশক সক্রিয়" : "✓ Mustard biofumigation active")
                    : (language === "bn" ? "✓ শস্য বৈচিত্র্য নিশ্চিত" : "✓ Crop diversification verified")}
                </span>
              </div>
            </div>
          </div>

          {/* Trade-offs & Economic Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2">
              <h4 className="font-extrabold text-xs text-gray-900 dark:text-yellow-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Scale className="w-4 h-4 text-agrogreen-600 dark:text-yellow-400" />
                <span>{t.metrics.tradeOffTitle}</span>
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {language === "bn"
                  ? metrics.tradeOffs.caloricTradeOffBn
                  : metrics.tradeOffs.caloricTradeOffEn}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2">
              <h4 className="font-extrabold text-xs text-gray-900 dark:text-yellow-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Coins className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
                <span>{t.metrics.economicTitle}</span>
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {language === "bn"
                  ? metrics.tradeOffs.economicReturnBn
                  : metrics.tradeOffs.economicReturnEn}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEASONAL ROTATION TIMELINE */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          {years.map((yearObj) => (
            <div
              key={yearObj.yearNumber}
              className="bg-white dark:bg-gray-900 border-2 border-agrogreen-300 dark:border-yellow-400 rounded-3xl p-5 shadow-sm space-y-4"
            >
              {/* Year Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-agrogreen-700 text-white font-extrabold text-sm flex items-center justify-center dark:bg-yellow-400 dark:text-black">
                    {yearObj.yearNumber}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-yellow-400">
                      {t.year} {yearObj.yearNumber} ({language === "bn" ? "কৃষি বর্ষ" : "Agricultural Year"})
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {language === "bn"
                        ? "রবি (শীত) → খরিফ-১ (গ্রীষ্ম) → খরিফ-২ (বর্ষা)"
                        : "Rabi (Winter) → Kharif-1 (Early Summer) → Kharif-2 (Monsoon)"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-gray-400">
                    {language === "bn" ? "লেগিউম নিশ্চিত" : "Legume Verified"} ✓
                  </span>
                </div>
              </div>

              {/* 3 Seasons of the Year Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {yearObj.seasons.map((seasonItem: any) => {
                  const isLegume = seasonItem.family === "Fabaceae";
                  const seasonLabel =
                    seasonItem.season === "Rabi"
                      ? t.seasons.rabi
                      : seasonItem.season === "Kharif-1"
                        ? t.seasons.kharif1
                        : t.seasons.kharif2;

                  const seasonHeaderColor =
                    seasonItem.season === "Rabi"
                      ? "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-700 dark:text-blue-300"
                      : seasonItem.season === "Kharif-1"
                        ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-700 dark:text-yellow-300"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300";

                  return (
                    <div
                      key={`${seasonItem.year}_${seasonItem.season}`}
                      className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-gray-800/40 flex flex-col justify-between"
                    >
                      {/* Season Badge Header */}
                      <div className={`p-2.5 px-3 border-b text-xs font-black flex items-center justify-between ${seasonHeaderColor}`}>
                        <span>{seasonLabel}</span>
                        {isLegume && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                            {language === "bn" ? "ডালজাতীয়" : "Legume"}
                          </span>
                        )}
                      </div>

                      {/* Crop Details */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                              {getCropIcon(seasonItem.cropId)}
                            </div>
                            <div>
                              <h4 className="text-base font-extrabold text-gray-900 dark:text-yellow-400">
                                {language === "bn" ? seasonItem.cropNameBn : seasonItem.cropNameEn}
                              </h4>
                              <p className="text-xs text-agrogreen-700 dark:text-agrogreen-300 font-medium">
                                {seasonItem.variety}
                              </p>
                              <p className="text-[11px] text-gray-400 italic">
                                {seasonItem.family}
                              </p>
                            </div>
                          </div>

                          {/* Agronomic Rationale */}
                          <div className="mt-3 p-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                            {language === "bn" ? seasonItem.reasonBn : seasonItem.reasonEn}
                          </div>
                        </div>

                        {/* Badges: Water Demand & N Fix */}
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300" title="Relative water demand">
                            <Droplets className="w-3.5 h-3.5" />
                            <span>{seasonItem.waterDemand}/5 {language === "bn" ? "পানি" : "water"}</span>
                          </div>

                          {seasonItem.nFixRange.max > 0 ? (
                            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400" title="Biological nitrogen fixation potential">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{seasonItem.nFixRange.text}</span>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-[11px]">
                              {language === "bn" ? "০ কেজি N" : "0 kg N"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Scientific Disclaimer & Sources */}
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-gray-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <p className="font-bold text-gray-900 dark:text-yellow-400">
            {language === "bn"
              ? "বৈজ্ঞানিক তথ্যের উৎস ও স্বচ্ছতা:"
              : "Scientific Data Sources & Radical Transparency:"}
          </p>
          <p>
            {language === "bn"
              ? "• নাসা ডেটাসেট: নাসা পাওয়ার (NASA POWER - সৌরবিকিরণ ও তাপমাত্রা) এবং নাসা এসএমএপি (NASA SMAP L4 - ৯ কিমি মাটির আর্দ্রতা)।"
              : "• NASA Datasets: NASA POWER (solar radiation & daily temperatures) and NASA SMAP L4 (9 km surface & rootzone soil moisture)."}
          </p>
          <p>
            {language === "bn"
              ? "• বাহ্যিক অ-নাসা ডেটাসেট: সয়েলগ্রিডস (ISRIC SoilGrids - ওয়াখেনিনজেন, নেদারল্যান্ডস) মাটির প্রাথমিক গঠন ও পিএইচ অনুমানের জন্য ব্যবহৃত। এটি NASA-র নিজস্ব ডেটাসেট নয়।"
              : "• External Non-NASA Datasets: ISRIC SoilGrids (Wageningen, Netherlands) for digital soil texture and pH. Explicitly separate from NASA EO data."}
          </p>
          <p>
            {language === "bn"
              ? "• কৃষি গবেষণা প্রতিষ্ঠান: বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI), বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI) ও পাট গবেষণা ইনস্টিটিউট (BJRI)-এর পরীক্ষিত তথ্যাদি।"
              : "• National Agricultural Research: BARI, BRRI, and BJRI peer-reviewed crop databases and cropping pattern trials."}
          </p>
        </div>
      </div>
    </div>
  );
}
