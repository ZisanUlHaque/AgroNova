import {
  Crop,
  SeasonSlot,
  NasaContext,
  TargetGoal,
  ScoringWeights,
  PlanSeasonItem,
  RotationPlan,
  ConfidenceLevel,
} from "./types.js";

/**
 * Returns weights shifted by targetGoal per PRD Section 7.3
 */
export function getGoalWeights(goal: TargetGoal): ScoringWeights {
  switch (goal) {
    case "CONSERVE_WATER":
      return { water: 0.5, nitrogen: 0.15, soil: 0.2, heat: 0.15 };
    case "RESTORE_NITROGEN":
      return { water: 0.25, nitrogen: 0.4, soil: 0.2, heat: 0.15 };
    case "BALANCED":
    default:
      return { water: 0.35, soil: 0.25, nitrogen: 0.25, heat: 0.15 };
  }
}

/**
 * Water Fit (0 to 1):
 * crop waterDemand vs (POWER rainfall + SMAP root-zone moisture trend - ET0)
 */
export function calculateWaterFit(crop: Crop, context: NasaContext, slot: SeasonSlot): number {
  // Normalize water demand 1-5 to 0.2 - 1.0
  const normalizedDemand = crop.waterDemand / 5.0;

  // Determine available water proxy based on season & NASA data
  // Rabi = dry winter, Kharif-1 = pre-monsoon, Kharif-2 = monsoon
  let seasonalRainfallExpected = 30; // mm in Rabi
  if (slot.season === "Kharif-1") seasonalRainfallExpected = 180;
  if (slot.season === "Kharif-2") seasonalRainfallExpected = 600;

  // Incorporate actual POWER precipitation (rolling 90d) if available
  const recentRain = context.powerTotalPrecip ?? 100;
  // SMAP rootzone moisture (typical range 0.15 - 0.45 m3/m3)
  const rootzone = context.smapRootzone ?? 0.30;
  // ET0 reference evapotranspiration (typical 2.5 - 6.0 mm/day)
  const et0 = context.et0Mean ?? 3.5;

  // Water balance index: higher means abundant water, lower means water deficit
  // Net water factor = (rootzone * 2.0) + (recentRain / 300.0) - (et0 / 7.0)
  const waterAvailability = Math.max(0.1, Math.min(1.0, rootzone * 1.5 + (recentRain / 400.0) - (et0 / 10.0)));

  // If water is scarce (waterAvailability low), lower waterDemand crops get high score
  // If water is plentiful, high waterDemand crops also score well
  const difference = Math.abs(normalizedDemand - waterAvailability);
  let fit = 1.0 - difference;

  // Bonus for water-efficient pulses and oilseeds in dry Rabi
  if (slot.season === "Rabi" && crop.waterDemand <= 2 && waterAvailability < 0.5) {
    fit = Math.min(1.0, fit + 0.15);
  }

  return Math.max(0.1, Math.min(1.0, fit));
}

/**
 * Soil Fit (0 to 1):
 * texture and pH matching. Defaults are neutral; estimated/partial inputs are
 * dampened toward neutral.
 */
export function calculateSoilFit(crop: Crop, context: NasaContext): number {
  if (context.soilSource === "DEFAULT" || !context.soilTexture) {
    return 0.5; // neutral 0.5 if soil is default as specified in PRD
  }

  let textureScore = 0.5;
  if (context.soilTexture) {
    const normTexture = context.soilTexture.toLowerCase().replace(/[\s-]/g, "_");
    if (crop.soilPreference.textures.some((t) => t.includes(normTexture) || normTexture.includes(t))) {
      textureScore = 1.0;
    } else {
      textureScore = 0.4;
    }
  }

  let phScore = 0.5;
  if (context.soilPh != null) {
    if (context.soilPh >= crop.soilPreference.minPh && context.soilPh <= crop.soilPreference.maxPh) {
      phScore = 1.0;
    } else {
      const distance = Math.min(
        Math.abs(context.soilPh - crop.soilPreference.minPh),
        Math.abs(context.soilPh - crop.soilPreference.maxPh)
      );
      phScore = Math.max(0.2, 1.0 - distance * 0.4);
    }
  }

  // If soil was estimated from SoilGrids, scale confidence towards 0.7
  const baseFit = textureScore * 0.6 + phScore * 0.4;
  if (context.soilSource === "ESTIMATED" || context.soilSource === "PARTIAL") {
    return 0.5 + (baseFit - 0.5) * 0.6; // slightly dampened toward neutral
  }

  return baseFit;
}

/**
 * Nitrogen Benefit (0 to 1):
 * legume N-fix range, normalized (0 to 75 kg/ha)
 */
export function calculateNitrogenBenefit(crop: Crop, prevCrop: Crop | null): number {
  if (crop.family === "Fabaceae") {
    // Biological nitrogen fixer
    const avgNFix = (crop.nFixKgHa.min + crop.nFixKgHa.max) / 2.0;
    // Normalize to 0-1 scale (75 kg/ha = 1.0)
    return Math.min(1.0, 0.4 + (avgNFix / 75.0) * 0.6);
  }

  // Non-legume: gets a rotational fertility bonus if succeeding a legume
  if (prevCrop && prevCrop.family === "Fabaceae") {
    return 0.7; // benefits from residual soil fixed nitrogen
  }

  return 0.3; // standard maintenance
}

/**
 * Heat Risk (0 to 1):
 * crop heatTolerance vs recent T2M_MAX
 */
export function calculateHeatRisk(crop: Crop, context: NasaContext, slot: SeasonSlot): number {
  const recentMaxTemp = context.powerRecentMaxTemp ?? context.powerMeanTemp ?? 31.0;
  const tolerance = crop.heatTolerance;

  if (recentMaxTemp <= tolerance - 3) {
    // Safe from heat stress
    return 1.0;
  } else if (recentMaxTemp <= tolerance) {
    // Near threshold
    return 0.7;
  } else {
    // Exceeds threshold: penalty proportional to excess
    const excess = recentMaxTemp - tolerance;
    return Math.max(0.1, 0.7 - excess * 0.15);
  }
}

/**
 * Generate plain-language agronomic reasons in English and Bengali
 */
export function generateAgronomicReason(
  crop: Crop,
  prevCrop: Crop | null,
  slot: SeasonSlot,
  breakdown: { waterFit: number; soilFit: number; nitrogenBenefit: number; heatRisk: number }
): { reasonEn: string; reasonBn: string } {
  let en = "";
  let bn = "";

  if (crop.family === "Fabaceae") {
    en = `Restores soil nitrogen (adds ${crop.nFixKgHa.min}-${crop.nFixKgHa.max} kg N/ha) while requiring minimal irrigation in ${slot.season}.`;
    bn = `${slot.season === "Rabi" ? "রবি মৌসুমে" : "খরিফ মৌসুমে"} কম সেচে মাটিতে প্রাকৃতিক নাইট্রোজেন (${crop.nFixKgHa.min}-${crop.nFixKgHa.max} কেজি/হেক্টর) যোগ করে উর্বরতা বাড়ায়।`;
  } else if (prevCrop && prevCrop.family === "Fabaceae") {
    en = `Utilizes residual nitrogen and organic matter left by previous ${prevCrop.nameEn}, cutting chemical fertilizer needs.`;
    bn = `পূর্ববর্তী ${prevCrop.nameBn} এর রেখে যাওয়া প্রাকৃতিক নাইট্রোজেন ব্যবহার করে রাসায়নিক সারের খরচ বাঁচায়।`;
  } else if (crop.id === "rice_boro") {
    en = `High-yield food grain selected for favorable rootzone moisture; ensure efficient alternate wetting and drying (AWD).`;
    bn = `মাটির আর্দ্রতার সাথে সামঞ্জস্য রেখে উচ্চ ফলনের জন্য নির্বাচন করা হয়েছে; এডব্লিউডি (AWD) পদ্ধতিতে সেচ দিলে সাশ্রয় হবে।`;
  } else if (crop.id === "rice_aman") {
    en = `Monsoon staple utilizing peak Kharif rains, anchoring food security with strong flood resilience.`;
    bn = `বর্ষা মৌসুমের বৃষ্টি কাজে লাগিয়ে প্রধান খাদ্যশস্য হিসেবে পরিবারের খাদ্য নিরাপত্তা নিশ্চিত করে।`;
  } else if (crop.id === "mustard") {
    en = `Short-duration cash crop that breaks cereal insect and disease cycles ahead of Kharif season.`;
    bn = `স্বল্পমেয়াদী লাভজনক ফসল যা ধানের ক্ষতিকর পোকা ও রোগবালাইয়ের চক্র ভেঙে দেয়।`;
  } else if (crop.id === "jute") {
    en = `Improves soil structure through extensive leaf litter biomass (adds 3-4 t/ha organic matter).`;
    bn = `পাতা ঝরে মাটিতে প্রচুর জৈব পদার্থ (৩-৪ টন/হেক্টর) যোগ করে মাটির স্বাস্থ্য উন্নত করে।`;
  } else {
    en = `Matches regional climate pattern (${slot.season}) with balanced water demand and good thermal tolerance.`;
    bn = `${slot.season} মৌসুমের স্থানীয় আবহাওয়ার সাথে মানানসই ও সহনশীল ফসল।`;
  }

  return { reasonEn: en, reasonBn: bn };
}

/**
 * Determine overall confidence based on PRD Section 7.3:
 * HIGH = POWER + SMAP fresh and soil measured
 * MEDIUM = NASA fresh, soil estimated/default
 * LOW = any NASA source missing/stale
 */
export function determineConfidence(context: NasaContext): {
  level: ConfidenceLevel;
  reasonEn: string;
  reasonBn: string;
} {
  const hasPower = context.powerMeanTemp != null && context.powerTotalPrecip != null;
  const hasSmap = context.smapRootzone != null && context.smapSurface != null;
  const isSoilMeasured = context.soilSource === "MEASURED";

  if (!hasPower || !hasSmap) {
    return {
      level: "LOW",
      reasonEn: "NASA satellite data was partially unavailable or stale; default regional climatology used.",
      reasonBn: "নাসা উপগ্রহের সাম্প্রতিক তথ্য আংশিক অনুপস্থিত বা পুরনো; গড় আঞ্চলিক জলবায়ু ব্যবহার করা হয়েছে।",
    };
  }

  if (isSoilMeasured) {
    return {
      level: "HIGH",
      reasonEn: "Live NASA POWER climate & SMAP soil moisture data verified with field-measured soil properties.",
      reasonBn: "লাইভ নাসা পাওয়ার আবহাওয়া ও এসএমএপি মাটির আর্দ্রতার সাথে কৃষকের নিজস্ব মাটির তথ্য যাচাইকৃত।",
    };
  }

  if (context.soilSource === "PARTIAL") {
    return {
      level: "MEDIUM",
      reasonEn: "Live NASA climate and 9 km SMAP context are available; only the farmer-provided soil properties are used, and missing soil values remain unknown.",
      reasonBn: "লাইভ নাসা আবহাওয়া ও ৯ কিমি এসএমএপি প্রেক্ষাপট আছে; কৃষকের দেওয়া মাটির তথ্যই ব্যবহৃত হয়েছে এবং অজানা মান অজানাই রাখা হয়েছে।",
    };
  }

  if (context.soilSource === "ESTIMATED") {
    return {
      level: "MEDIUM",
      reasonEn: "Live NASA climate and 9 km SMAP rootzone moisture are matched with an estimated ISRIC SoilGrids baseline.",
      reasonBn: "লাইভ নাসা আবহাওয়া ও ৯ কিমি এসএমএপি মাটির আর্দ্রতার সাথে ISRIC SoilGrids-এর আনুমানিক মাটির তথ্য মিলিয়ে তৈরি।",
    };
  }

  return {
    level: "MEDIUM",
    reasonEn: "Live NASA climate and 9 km SMAP context are available; soil properties were unavailable, so neutral soil scoring was used.",
    reasonBn: "লাইভ নাসা আবহাওয়া ও ৯ কিমি এসএমএপি প্রেক্ষাপট আছে; মাটির তথ্য অনুপস্থিত থাকায় নিরপেক্ষ মাটি-স্কোর ব্যবহার করা হয়েছে।",
  };
}

/**
 * Score a single 12-season candidate sequence and build a complete plan.
 */
export function scoreCandidateSequence(
  sequence: Crop[],
  slots: SeasonSlot[],
  context: NasaContext,
  goal: TargetGoal,
  planId: string = "plan_1"
): RotationPlan {
  const weights = getGoalWeights(goal);
  const confidence = determineConfidence(context);
  const planItems: PlanSeasonItem[] = [];

  let totalScoreSum = 0;
  let totalNFixMin = 0;
  let totalNFixMax = 0;
  let totalWaterDemand = 0;

  for (let i = 0; i < sequence.length; i++) {
    const crop = sequence[i];
    const prevCrop = i > 0 ? sequence[i - 1] : null;
    const slot = slots[i];

    const waterFit = calculateWaterFit(crop, context, slot);
    const soilFit = calculateSoilFit(crop, context);
    const nitrogenBenefit = calculateNitrogenBenefit(crop, prevCrop);
    const heatRisk = calculateHeatRisk(crop, context, slot);

    const seasonScore =
      (waterFit * weights.water +
        soilFit * weights.soil +
        nitrogenBenefit * weights.nitrogen +
        heatRisk * weights.heat) *
      100;

    totalScoreSum += seasonScore;
    totalNFixMin += crop.nFixKgHa.min;
    totalNFixMax += crop.nFixKgHa.max;
    totalWaterDemand += crop.waterDemand;

    const reasons = generateAgronomicReason(crop, prevCrop, slot, {
      waterFit,
      soilFit,
      nitrogenBenefit,
      heatRisk,
    });

    planItems.push({
      year: slot.year,
      season: slot.season,
      cropId: crop.id,
      cropNameEn: crop.nameEn,
      cropNameBn: crop.nameBn,
      variety: crop.variety,
      family: crop.family,
      icon: crop.icon,
      waterDemand: crop.waterDemand,
      heatTolerance: crop.heatTolerance,
      nFixRange: {
        min: crop.nFixKgHa.min,
        max: crop.nFixKgHa.max,
        text: crop.nFixKgHa.max > 0 ? `${crop.nFixKgHa.min}-${crop.nFixKgHa.max} kg N/ha` : "0 kg N/ha",
      },
      reasonEn: reasons.reasonEn,
      reasonBn: reasons.reasonBn,
      scoreBreakdown: {
        waterFit: Number(waterFit.toFixed(2)),
        soilFit: Number(soilFit.toFixed(2)),
        nitrogenBenefit: Number(nitrogenBenefit.toFixed(2)),
        heatRisk: Number(heatRisk.toFixed(2)),
        overall: Number(seasonScore.toFixed(1)),
      },
    });
  }

  const overallScore = Number((totalScoreSum / sequence.length).toFixed(1));

  // Range estimations (never false single numbers per PRD section 7.3)
  const avgWaterPerSeason = totalWaterDemand / sequence.length;
  let waterSavingsRange = "15% - 25% lower irrigation demand";
  if (avgWaterPerSeason < 2.5) {
    waterSavingsRange = "25% - 40% lower irrigation demand vs rice monoculture";
  } else if (avgWaterPerSeason > 3.5) {
    waterSavingsRange = "5% - 15% water savings through optimized scheduling";
  }

  const annualAvgNFixMin = Math.round(totalNFixMin / 4);
  const annualAvgNFixMax = Math.round(totalNFixMax / 4);
  const nitrogenGainRange = `${annualAvgNFixMin} - ${annualAvgNFixMax} kg biological N/ha per year`;

  return {
    planId,
    targetGoal: goal,
    confidence: confidence.level,
    confidenceReasonEn: confidence.reasonEn,
    confidenceReasonBn: confidence.reasonBn,
    overallScore,
    seasons: planItems,
    waterSavingsRange,
    nitrogenGainRange,
    engineVersion: "3.0.0",
    inputsUsed: {
      meanTemp: context.powerMeanTemp,
      totalPrecip: context.powerTotalPrecip,
      smapRootzone: context.smapRootzone,
      et0Mean: context.et0Mean,
      soilTexture: context.soilTexture,
      soilPh: context.soilPh,
      soilSource: context.soilSource ?? "ESTIMATED",
      nasaFreshness: {
        powerFresh: context.powerMeanTemp != null,
        smapFresh: context.smapRootzone != null,
        smapGranuleDate: context.smapGranuleDate,
      },
    },
  };
}
