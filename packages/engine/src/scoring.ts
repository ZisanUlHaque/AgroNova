import {
  Crop,
  SeasonSlot,
  NasaContext,
  TargetGoal,
  ScoringWeights,
  PlanSeasonItem,
  RotationPlan,
  ConfidenceLevel,
  QuantitativeMetrics,
} from "./types.js";

/**
 * Returns normalized weights shifted by targetGoal or custom farmer preference.
 */
export function getGoalWeights(
  goal: TargetGoal,
  custom?: ScoringWeights
): ScoringWeights {
  if (goal === "CUSTOM" && custom) {
    const rawSum = custom.water + custom.soil + custom.nitrogen + custom.heat;
    if (rawSum > 0) {
      return {
        water: Number((custom.water / rawSum).toFixed(3)),
        soil: Number((custom.soil / rawSum).toFixed(3)),
        nitrogen: Number((custom.nitrogen / rawSum).toFixed(3)),
        heat: Number((custom.heat / rawSum).toFixed(3)),
      };
    }
  }

  switch (goal) {
    case "CONSERVE_WATER":
      return { water: 0.5, soil: 0.2, nitrogen: 0.15, heat: 0.15 };
    case "RESTORE_NITROGEN":
      return { water: 0.25, soil: 0.2, nitrogen: 0.4, heat: 0.15 };
    case "BALANCED":
    default:
      return { water: 0.35, soil: 0.25, nitrogen: 0.25, heat: 0.15 };
  }
}

/**
 * Relative water-demand preference from the crop catalog (1/5 demand -> 1.0,
 * 5/5 demand -> 0.0). When SMAP rootzone moisture is available, adjusts slightly
 * to reward low-water crops during dry soil moisture regimes.
 */
export function calculateWaterFit(crop: Crop, context?: NasaContext): number {
  if (!Number.isFinite(crop.waterDemand)) return 0.5;
  const demand = Math.max(1, Math.min(5, crop.waterDemand));
  let baseFit = (5 - demand) / 4;

  // If SMAP indicates dry rootzone (< 0.22 m3/m3), penalize high-demand crops further
  if (context && typeof context.smapRootzone === "number") {
    if (context.smapRootzone < 0.22 && demand >= 4) {
      baseFit = Math.max(0.05, baseFit - 0.15);
    } else if (context.smapRootzone > 0.32 && demand <= 2) {
      // In moist soil, low-water crops may face mild waterlogging risk unless well drained
      baseFit = Math.max(0.2, baseFit - 0.05);
    }
  }

  return baseFit;
}

/**
 * Soil Fit (0 to 1):
 * Texture and pH matching against ISRIC SoilGrids or farmer-measured values.
 */
export function calculateSoilFit(crop: Crop, context: NasaContext): number {
  if (context.soilSource === "DEFAULT") {
    return 0.5; // neutral 0.5 if soil is default
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

  const baseFit = textureScore * 0.6 + phScore * 0.4;
  if (context.soilSource === "ESTIMATED" || context.soilSource === "PARTIAL" || context.soilSource === "OFFLINE_AEZ") {
    return 0.5 + (baseFit - 0.5) * 0.6; // slightly dampened toward neutral
  }

  return baseFit;
}

/**
 * Nitrogen & Fertility Benefit (0 to 1):
 * Based on Peoples et al. (2001) BNF model and BARI Pulses Research Division trials.
 * Legumes fix 30-75 kg N/ha; subsequent cereals receive residual organic nitrogen carryover.
 */
export function calculateNitrogenBenefit(crop: Crop, prevCrop: Crop | null): number {
  if (crop.family === "Fabaceae") {
    const avgNFix = (crop.nFixKgHa.min + crop.nFixKgHa.max) / 2.0;
    return Math.min(1.0, 0.4 + (avgNFix / 75.0) * 0.6);
  }

  // Non-legume: gets a rotational fertility bonus if succeeding a legume
  if (prevCrop && prevCrop.family === "Fabaceae") {
    return 0.75; // benefits from residual soil fixed nitrogen
  }

  // Organic biomass addition bonus (e.g. Jute leaf litter sheds 3-4 t/ha)
  if (crop.id === "jute") {
    return 0.65;
  }

  return 0.3; // standard baseline
}

/**
 * Heat Risk / Tolerance (0 to 1):
 * Compares crop flowering heat tolerance with regional temperature context.
 */
export function calculateHeatRisk(crop: Crop, context: NasaContext): number {
  if (context.powerRecentMaxTemp != null && Number.isFinite(context.powerRecentMaxTemp)) {
    if (context.powerRecentMaxTemp > crop.heatTolerance) {
      return Math.max(0.2, 0.5 - (context.powerRecentMaxTemp - crop.heatTolerance) * 0.1);
    }
    return Math.min(0.85, 0.5 + (crop.heatTolerance - context.powerRecentMaxTemp) * 0.05);
  }
  return 0.5;
}

/**
 * Generate plain-language agronomic rationale in English and Bengali with local variety guidance.
 */
export function generateAgronomicReason(
  crop: Crop,
  prevCrop: Crop | null,
  slot: SeasonSlot
): { reasonEn: string; reasonBn: string } {
  let en = "";
  let bn = "";

  if (crop.family === "Fabaceae") {
    en = `Biological nitrogen fixer (${crop.nameEn}). Fixes an estimated ${crop.nFixKgHa.min}–${crop.nFixKgHa.max} kg N/ha, enriching rootzone soil for succeeding crops and reducing chemical urea dependence.`;
    bn = `প্রাকৃতিক নাইট্রোজেন সংবন্ধনকারী ফসল (${crop.nameBn})। মাটিতে আনুমানিক ${crop.nFixKgHa.min}–${crop.nFixKgHa.max} কেজি/হেক্টর জৈব নাইট্রোজেন যোগ করে, যা পরবর্তী ফসলের জন্য ইউরিয়া সারের খরচ উল্লেখযোগ্যভাবে কমায়।`;
  } else if (prevCrop && prevCrop.family === "Fabaceae") {
    en = `Follows nitrogen-fixing ${prevCrop.nameEn}. Capitalizes on residual soil nitrogen and improved microbial activity, reducing initial urea requirement by 30–40%.`;
    bn = `আগের মৌসুমের ডালজাতীয় ${prevCrop.nameBn}-এর পরে আবর্তিত। মাটিতে জমা অবশিষ্ট নাইট্রোজেন ব্যবহার করে, ফলে প্রাথমিক ইউরিয়া সারের প্রয়োগ ৩০–৪০% হ্রাস পায়।`;
  } else if (crop.id === "mustard") {
    en = `Winter oilseed (${crop.variety}). Acts as an effective biofumigant; root glucosinolates break fungal spore (*Rhizoctonia*, *Fusarium*) and nematode cycles before Kharif rice.`;
    bn = `শীতকালীন স্বল্পমেয়াদী সরিষা (${crop.variety})। এর শিকড়ের গ্লুকোসিনোলেট মাটির ক্ষতিকর রোগজীবাণু ও কৃমির বংশবৃদ্ধি রোধ করে মাটি জীবাণুমুক্ত করে।`;
  } else if (crop.id === "jute") {
    en = `High-biomass summer fiber (${crop.variety}). Sheds 3–4 t/ha of green leaf litter, rapidly restoring soil humus, organic carbon, and aggregate porosity.`;
    bn = `উচ্চ জৈববস্তু উৎপাদনকারী পাট (${crop.variety})। এর ঝরা পাতা মাটিতে প্রতি হেক্টরে ৩–৪ টন জৈব পদার্থ যোগ করে মাটির রস ও গঠন বজায় রাখে।`;
  } else if (crop.id === "rice_boro") {
    en = `High-yielding winter staple rice (${crop.variety}). Requires structured irrigation management (~1,000–1,200 mm); rotated with pulses to prevent continuous water-table depletion.`;
    bn = `উচ্চ ফলনশীল বোরো ধান (${crop.variety})। প্রচুর সেচের পানির প্রয়োজন হয়; পানির অপচয় কমাতে এটিকে ডাল ও তেলবীজের সাথে পর্যায়ক্রমে আবর্তন করা হয়েছে।`;
  } else if (crop.id === "rice_aman") {
    en = `Monsoon staple rice (${crop.variety}). Fully utilizes delta monsoon precipitation with minimal groundwater pumping; thrives following summer pulse green manure.`;
    bn = `মৌসুমি বৃষ্টি নির্ভর প্রধান আমন ধান (${crop.variety})। ভূগর্ভস্থ পানির ওপর চাপ না ফেলে বর্ষার পানি কাজে লাগায়; ডালের সবুজ সারের পর এটি দারুণ ফলন দেয়।`;
  } else if (crop.id === "wheat") {
    en = `Water-efficient winter cereal (${crop.variety}). Consumes ~65% less water than Boro rice, saving groundwater in receding delta aquifers.`;
    bn = `স্বল্প সেচনির্ভর শীতকালীন গম (${crop.variety})। বোরো ধানের তুলনায় প্রায় ৬৫% কম পানি লাগে, যা শুষ্ক মৌসুমে সেচের খরচ ও পানি বাঁচায়।`;
  } else {
    en = `Eligible for ${slot.season} in the agro-ecological crop calendar. Water demand rating: ${crop.waterDemand}/5.`;
    bn = `ফসল ক্যালেন্ডার ও আবর্তন নিয়মে ${slot.season} মৌসুমের উপযোগী। পানির চাহিদা: ${crop.waterDemand}/৫।`;
  }

  return { reasonEn: en, reasonBn: bn };
}

/**
 * Determines scientific confidence level based on observational inputs.
 */
export function determineConfidence(context: NasaContext): {
  level: ConfidenceLevel;
  reasonEn: string;
  reasonBn: string;
} {
  if (context.isOfflineAezBaseline || context.soilSource === "OFFLINE_AEZ") {
    return {
      level: "MEDIUM",
      reasonEn: `Generated using pre-cached Bangladesh Agro-Ecological Zone climatological baseline (${context.aezCode || "Delta AEZ"}). Re-syncs with live NASA observations once connected.`,
      reasonBn: `বাংলাদেশের কৃষি-বাস্তুতাত্ত্বিক অঞ্চল ভিত্তিক সংরক্ষিত জলবায়ু তথ্য (${context.aezCode || "ডেল্টা অঞ্চল"}) থেকে প্রস্তুত। ইন্টারনেট পেলে স্বয়ংক্রিয়ভাবে লাইভ নাসার তথ্যে আপডেট হবে।`,
    };
  }

  const hasPower = context.powerMeanTemp != null && context.powerTotalPrecip != null;
  const hasSmap = context.smapRootzone != null && context.smapSurface != null;
  const isSoilMeasured = context.soilSource === "MEASURED";

  if (!hasPower || !hasSmap) {
    return {
      level: "LOW",
      reasonEn: "Some recent NASA observations (POWER or SMAP L4) are temporarily unavailable or stale; regional context is partial.",
      reasonBn: "সাম্প্রতিক NASA পর্যবেক্ষণের কিছু তথ্য (POWER বা SMAP L4) আপাতত পাওয়া যায়নি; আঞ্চলিক প্রেক্ষাপট আংশিক।",
    };
  }

  return {
    level: "MEDIUM",
    reasonEn: isSoilMeasured
      ? "Recent NASA POWER agroclimate and SMAP L4 rootzone observations combined with farmer-verified soil properties. Capped at MEDIUM because seasonal weather is not forecast."
      : "NASA POWER and SMAP L4 9 km satellite observations combined with SoilGrids estimated soil profile. Provides reliable regional hydrological and climatic context.",
    reasonBn: isSoilMeasured
      ? "সাম্প্রতিক NASA POWER আবহাওয়া এবং SMAP L4 মাটির আর্দ্রতা তথ্যের সাথে কৃষকের মাটির তথ্যের সংমিশ্রণ। মৌসুমি আবহাওয়ার পূর্বাভাস না থাকায় আত্মবিশ্বাসের মাত্রা মাধ্যম (MEDIUM)।"
      : "NASA POWER এবং SMAP L4 উপগ্রহ তথ্যের সাথে SoilGrids মাটির অনুমিত তথ্যের সংমিশ্রণ। এটি মাঠ পর্যায়ের নির্ভরযোগ্য আঞ্চলিক পরিবেশগত চিত্র প্রদান করে।",
  };
}

/**
 * Calculates quantitative comparative metrics between conventional monoculture
 * (Boro - Fallow - T. Aman) and the recommended rotation plan.
 */
export function computeQuantitativeMetrics(
  sequence: Crop[],
  cycleYears: number
): QuantitativeMetrics {
  // Conventional baseline: Annual Boro (1200 mm) + Fallow (0) + T.Aman (100 mm supp.) = 1300 mm/yr
  const conventionalIrrigationMm = 1300 * cycleYears;

  let recommendedTotalIrrigationMm = 0;
  let totalBNFMin = 0;
  let totalBNFMax = 0;
  let totalBiomassTon = 0;
  let monocultureBreaks = 0;
  let hasBiofumigation = false;

  for (let i = 0; i < sequence.length; i++) {
    const crop = sequence[i];
    const prev = i > 0 ? sequence[i - 1] : null;

    // Irrigation sum
    recommendedTotalIrrigationMm += crop.typicalIrrigationMm ?? (crop.waterDemand * 70);

    // Nitrogen fixation
    if (crop.family === "Fabaceae") {
      totalBNFMin += crop.nFixKgHa.min;
      totalBNFMax += crop.nFixKgHa.max;
      totalBiomassTon += 1.8; // Legume stover biomass
    }

    // Jute biomass
    if (crop.id === "jute") {
      totalBiomassTon += 3.5;
    }

    // Monoculture break count
    if (prev && prev.family === "Poaceae" && crop.family !== "Poaceae") {
      monocultureBreaks++;
    }

    // Biofumigation check (Mustard)
    if (crop.id === "mustard") {
      hasBiofumigation = true;
    }
  }

  const annualRecIrrigationMm = Math.round(recommendedTotalIrrigationMm / cycleYears);
  const annualConvIrrigationMm = 1300;
  const irrigationSavedMm = Math.max(0, annualConvIrrigationMm - annualRecIrrigationMm);
  const reductionPercent = Number(((irrigationSavedMm / annualConvIrrigationMm) * 100).toFixed(1));
  const waterSavedM3PerHa = irrigationSavedMm * 10; // 1 mm = 10 m3/ha

  // Pumping cost saved in BDT: ~110-140 L diesel saved per 750 mm pumping reduction (~110-135 BDT/L diesel)
  const pumpingSavedMin = Math.round(irrigationSavedMm * 14);
  const pumpingSavedMax = Math.round(irrigationSavedMm * 21);

  // Biological Nitrogen fixed per year
  const annualBNFMin = Math.round(totalBNFMin / cycleYears);
  const annualBNFMax = Math.round(totalBNFMax / cycleYears);

  // Synthetic Urea saved (1 kg biological N in soil ~ 1.8 kg synthetic urea equivalent)
  const ureaSavedMin = Math.round(annualBNFMin * 1.6);
  const ureaSavedMax = Math.round(annualBNFMax * 2.1);
  const ureaCostSavedMin = Math.round(ureaSavedMin * 27); // Subsidized BDT 27/kg
  const ureaCostSavedMax = Math.round(ureaSavedMax * 35);

  // Soil Organic Matter (SOM) Accretion per year: IPCC Tier 1 steady-state
  const annualBiomassTon = Number((totalBiomassTon / cycleYears).toFixed(1));
  const somAccretionMin = Number((0.08 + annualBiomassTon * 0.025).toFixed(2));
  const somAccretionMax = Number((0.12 + annualBiomassTon * 0.035).toFixed(2));

  return {
    waterUsageComparison: {
      conventionalIrrigationMm: annualConvIrrigationMm,
      recommendedIrrigationMm: annualRecIrrigationMm,
      reductionPercent,
      waterSavedM3PerHa,
      pumpingCostSavedBdtPerHa: {
        min: pumpingSavedMin,
        max: pumpingSavedMax,
      },
    },
    nitrogenMetrics: {
      biologicalNFixedKgHaPerYear: { min: annualBNFMin, max: annualBNFMax },
      syntheticUreaSavedKgHaPerYear: { min: ureaSavedMin, max: ureaSavedMax },
      fertilizerCostSavedBdtPerHa: { min: ureaCostSavedMin, max: ureaCostSavedMax },
    },
    soilOrganicMatterMetrics: {
      annualSomAccretionPercent: { min: somAccretionMin, max: somAccretionMax },
      biomassResidueTonHaPerYear: {
        min: Math.max(1.2, annualBiomassTon),
        max: Number((annualBiomassTon + 1.2).toFixed(1)),
      },
    },
    pestDisruptionScore: {
      pestVulnerabilityReductionPercent: Math.min(75, 45 + monocultureBreaks * 8),
      monocultureBreakCount: monocultureBreaks,
      biofumigationPresent: hasBiofumigation,
    },
    tradeOffs: {
      summaryEn: `Saves ~${reductionPercent}% groundwater irrigation and restores ${annualBNFMin}–${annualBNFMax} kg biological N/ha/year, while diversifying farm income.`,
      summaryBn: `ভূগর্ভস্থ সেচের পানি প্রায় ${reductionPercent}% সাশ্রয় করে এবং বছরে ${annualBNFMin}–${annualBNFMax} কেজি জৈব নাইট্রোজেন মাটিতে যোগ করে আয়ের বহুমুখীকরণ ঘটায়।`,
      caloricTradeOffEn: "Rice harvest volume is reduced compared to continuous double-rice, but pulse protein yield and mustard cooking oil cover household nutritional security.",
      caloricTradeOffBn: "টানা দুই মৌসুম ধান চাষের তুলনায় মোট ধানের পরিমাণ কিছুটা কমলেও, ডালের পুষ্টিকর প্রোটিন ও সরিষার খাঁটি ভোজ্যতেল পারিবারিক পুষ্টি চাহিদা নিশ্চিত করে।",
      economicReturnEn: `High-value cash crops (Mustard: 85–100 BDT/kg; Lentil/Mung: 110–135 BDT/kg) generate 2.2x to 3.1x higher gross revenue per kg than unhusked paddy (28–32 BDT/kg).`,
      economicReturnBn: `উচ্চমূল্যের অর্থকরী ফসল (সরিষা: ৮৫-১০০ টাকা/কেজি; ডাল: ১১০-১৩৫ টাকা/কেজি) ধানের তুলনায় (২৮-৩২ টাকা/কেজি) প্রতি কেজিতে ২.২ থেকে ৩.১ গুণ বেশি বাজারমূল্য এনে দেয়।`,
    },
  };
}

/**
 * Score a candidate sequence (3 or 4 years) and build a complete plan.
 */
export function scoreCandidateSequence(
  sequence: Crop[],
  slots: SeasonSlot[],
  context: NasaContext,
  goal: TargetGoal,
  planId: string = "plan_1",
  customWeights?: ScoringWeights
): RotationPlan {
  const weights = getGoalWeights(goal, customWeights);
  const confidence = determineConfidence(context);
  const planItems: PlanSeasonItem[] = [];
  const availableWeight = weights.water + weights.soil + weights.nitrogen + weights.heat;

  let totalScoreSum = 0;
  let totalNFixMin = 0;
  let totalNFixMax = 0;

  for (let i = 0; i < sequence.length; i++) {
    const crop = sequence[i];
    const prevCrop = i > 0 ? sequence[i - 1] : null;
    const slot = slots[i];

    const waterFit = calculateWaterFit(crop, context);
    const soilFit = calculateSoilFit(crop, context);
    const nitrogenBenefit = calculateNitrogenBenefit(crop, prevCrop);
    const heatRisk = calculateHeatRisk(crop, context);

    const seasonScore =
      ((waterFit * weights.water +
        soilFit * weights.soil +
        nitrogenBenefit * weights.nitrogen +
        heatRisk * weights.heat) /
        availableWeight) *
      100;

    totalScoreSum += seasonScore;
    totalNFixMin += crop.nFixKgHa.min;
    totalNFixMax += crop.nFixKgHa.max;

    const reasons = generateAgronomicReason(crop, prevCrop, slot);

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
        text: crop.nFixKgHa.max > 0 ? `${crop.nFixKgHa.min}–${crop.nFixKgHa.max} kg N/ha` : "0 kg N/ha",
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
  const cycleYears = Math.round(sequence.length / 3);

  const annualAvgNFixMin = Math.round(totalNFixMin / cycleYears);
  const annualAvgNFixMax = Math.round(totalNFixMax / cycleYears);
  const nitrogenGainRange = `${annualAvgNFixMin} – ${annualAvgNFixMax} kg biological N/ha per year`;

  const quantitativeMetrics = computeQuantitativeMetrics(sequence, cycleYears);
  const waterSavingsRange = `~${quantitativeMetrics.waterUsageComparison.reductionPercent}% reduction vs continuous Boro (~${quantitativeMetrics.waterUsageComparison.waterSavedM3PerHa.toLocaleString()} m³/ha saved)`;

  return {
    planId,
    targetGoal: goal,
    cycleYears,
    confidence: confidence.level,
    confidenceReasonEn: confidence.reasonEn,
    confidenceReasonBn: confidence.reasonBn,
    overallScore,
    seasons: planItems,
    waterSavingsRange,
    nitrogenGainRange,
    engineVersion: "3.2.0",
    quantitativeMetrics,
    weightsUsed: weights,
    inputsUsed: {
      meanTemp: context.powerMeanTemp,
      totalPrecip: context.powerTotalPrecip,
      smapRootzone: context.smapRootzone,
      et0Mean: context.et0Mean,
      soilTexture: context.soilTexture,
      soilPh: context.soilPh,
      soilSource: context.soilSource ?? "ESTIMATED",
      aezCode: context.aezCode,
      nasaFreshness: {
        powerFresh: context.powerMeanTemp != null,
        smapFresh: context.smapRootzone != null,
        smapGranuleDate: context.smapGranuleDate,
      },
    },
  };
}
