import { readFileSync } from "fs";
import { dirname, join } from "path";
import {
  Crop,
  NasaContext,
  TargetGoal,
  ScoringWeights,
  EngineResult,
  RotationPlan,
} from "./types.js";
import { generateSeasonSlots } from "./seasons.js";
import { generateCandidateSequences } from "./candidateGenerator.js";
import { scoreCandidateSequence } from "./scoring.js";

export * from "./types.js";
export * from "./seasons.js";
export * from "./candidateGenerator.js";
export * from "./scoring.js";

// Helper to resolve crops.json robustly in both ESM and CJS contexts
export function loadCrops(): Crop[] {
  try {
    const currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();

    const candidates = [
      join(currentDir, "../crops.json"),
      join(currentDir, "../../crops.json"),
      join(currentDir, "crops.json"),
      join(process.cwd(), "packages/engine/crops.json"),
      join(process.cwd(), "crops.json"),
    ];

    for (const p of candidates) {
      try {
        const raw = readFileSync(p, "utf-8");
        return JSON.parse(raw);
      } catch (err) {
        // try next candidate
      }
    }
  } catch (e) {
    // fallback
  }

  return getFallbackCrops();
}

export interface GenerateOptions {
  targetGoal?: TargetGoal;
  cycleYears?: 3 | 4;
  customWeights?: ScoringWeights;
  startDate?: Date;
}

/**
 * Main engine entrypoint: generates top recommendation and alternative plans (3-year or 4-year cycle)
 */
export function generateCropRotation(
  context: NasaContext,
  optionsOrGoal: TargetGoal | GenerateOptions = "BALANCED",
  legacyStartDate: Date = new Date()
): EngineResult {
  const options: GenerateOptions =
    typeof optionsOrGoal === "string"
      ? { targetGoal: optionsOrGoal, cycleYears: 3, startDate: legacyStartDate }
      : { cycleYears: 3, targetGoal: "BALANCED", ...optionsOrGoal };

  const targetGoal = options.targetGoal || "BALANCED";
  const cycleYears = options.cycleYears || 3;
  const startDate = options.startDate || new Date();
  const totalSlots = cycleYears * 3; // 3 years = 9 seasons; 4 years = 12 seasons

  const crops = loadCrops();
  const slots = generateSeasonSlots(startDate, totalSlots);

  const candidateSequences = generateCandidateSequences({
    crops,
    slots,
    maxCandidates: 40,
  });

  if (candidateSequences.length === 0) {
    throw new Error("No feasible crop rotation sequences found satisfying agronomic constraints.");
  }

  // Score all candidate sequences
  const scoredPlans: RotationPlan[] = candidateSequences.map((seq, idx) =>
    scoreCandidateSequence(
      seq,
      slots,
      context,
      targetGoal,
      `plan_${idx + 1}`,
      options.customWeights
    )
  );

  // Sort descending by score
  scoredPlans.sort((a, b) => b.overallScore - a.overallScore);

  const recommendedPlan = scoredPlans[0];

  // Find a distinct alternative plan (differs in at least 2-3 seasons)
  const minDiffs = cycleYears === 3 ? 2 : 3;
  let alternativePlan = scoredPlans[1] || scoredPlans[0];
  for (let i = 1; i < scoredPlans.length; i++) {
    const candidate = scoredPlans[i];
    let diffCount = 0;
    for (let s = 0; s < totalSlots; s++) {
      if (candidate.seasons[s].cropId !== recommendedPlan.seasons[s].cropId) {
        diffCount++;
      }
    }
    if (diffCount >= minDiffs) {
      alternativePlan = candidate;
      break;
    }
  }

  return {
    recommendedPlan,
    alternativePlan,
    generatedAt: new Date().toISOString(),
    disclaimerEn:
      "NASA SMAP L4 soil moisture (9 km) provides regional hydrological context, not field truth. ISRIC SoilGrids is an external digital soil baseline. TerraShift crop rotations are agronomist-validated decision support tools, not guaranteed yield forecasts.",
    disclaimerBn:
      "নাসা এসএমএপি এল৪ (৯ কিমি) মাটির আর্দ্রতা আঞ্চলিক চিত্র প্রকাশ করে, মাঠ পর্যায়ের একক সত্য নয়। সয়েলগ্রিডস একটি বাহ্যিক ডিজিটাল রেফারেন্স। টেরাশিফ্‌ট শস্য আবর্তন কৃষিবিদদের নির্দেশনায় প্রস্তুতকৃত সিদ্ধান্ত সহায়ক পরামর্শ, কোনো নিশ্চিত ফলন প্রতিশ্রুতি নয়।",
  };
}

/**
 * Bangladesh Agro-Ecological Zone (AEZ) Climatological Baselines for Offline Operation.
 * Enables zero-internet recommendation generation anywhere in Bangladesh!
 */
export const BANGLADESH_AEZ_BASELINES: Record<
  string,
  {
    nameEn: string;
    nameBn: string;
    divisions: string[];
    soilTexture: string;
    soilPh: number;
    typicalRabiRootzoneMoisture: number; // m3/m3
    typicalRabiSolarRad: number; // MJ/m2/day
    typicalMeanTemp: number; // C
    typicalEt0: number; // mm/day
  }
> = {
  "AEZ-13": {
    nameEn: "Ganges Tidal Floodplain (Barisal / Patuakhali)",
    nameBn: "গঙ্গা জোয়ার-ভাটা প্লাবনভূমি (বরিশাল / পটুয়াখালী)",
    divisions: ["Barisal", "Khulna"],
    soilTexture: "clay_loam",
    soilPh: 6.8,
    typicalRabiRootzoneMoisture: 0.25,
    typicalRabiSolarRad: 17.2,
    typicalMeanTemp: 24.5,
    typicalEt0: 3.7,
  },
  "AEZ-11": {
    nameEn: "High Ganges River Floodplain (Jessore / Kushtia)",
    nameBn: "উঁচু গঙ্গা নদী প্লাবনভূমি (যশোর / কুষ্টিয়া)",
    divisions: ["Khulna", "Dhaka"],
    soilTexture: "silt_loam",
    soilPh: 7.2,
    typicalRabiRootzoneMoisture: 0.21,
    typicalRabiSolarRad: 18.0,
    typicalMeanTemp: 23.8,
    typicalEt0: 3.9,
  },
  "AEZ-18": {
    nameEn: "Young Meghna Estuarine Floodplain (Bhola / Noakhali / Chandpur)",
    nameBn: "তরুণ মেঘনা মোহনা প্লাবনভূমি (ভোলা / নোয়াখালী / চাঁদপুর)",
    divisions: ["Chittagong", "Barisal"],
    soilTexture: "silty_clay_loam",
    soilPh: 7.0,
    typicalRabiRootzoneMoisture: 0.27,
    typicalRabiSolarRad: 17.5,
    typicalMeanTemp: 24.8,
    typicalEt0: 3.8,
  },
  "AEZ-25": {
    nameEn: "Level Barind Tract (Rajshahi / Naogaon)",
    nameBn: "সমতল বরেন্দ্র ভূমি (রাজশাহী / নওগাঁ)",
    divisions: ["Rajshahi"],
    soilTexture: "clay",
    soilPh: 5.6,
    typicalRabiRootzoneMoisture: 0.18,
    typicalRabiSolarRad: 18.5,
    typicalMeanTemp: 22.5,
    typicalEt0: 4.1,
  },
  "AEZ-08": {
    nameEn: "Young Brahmaputra and Jamuna Floodplain (Mymensingh / Tangail)",
    nameBn: "তরুণ ব্রহ্মপুত্র ও যমুনা প্লাবনভূমি (ময়মনসিংহ / টাঙ্গাইল)",
    divisions: ["Mymensingh", "Dhaka"],
    soilTexture: "loam",
    soilPh: 6.5,
    typicalRabiRootzoneMoisture: 0.23,
    typicalRabiSolarRad: 16.8,
    typicalMeanTemp: 23.2,
    typicalEt0: 3.6,
  },
  "AEZ-20": {
    nameEn: "Eastern Surma-Kushiyara Floodplain (Sylhet / Moulvibazar)",
    nameBn: "পূর্ব সুরমা-কুশিয়ারা প্লাবনভূমি (সিলেট / মৌলভীবাজার)",
    divisions: ["Sylhet"],
    soilTexture: "clay",
    soilPh: 5.2,
    typicalRabiRootzoneMoisture: 0.29,
    typicalRabiSolarRad: 16.2,
    typicalMeanTemp: 22.8,
    typicalEt0: 3.5,
  },
  "AEZ-23": {
    nameEn: "Chittagong Coastal Plain (Chittagong / Cox's Bazar)",
    nameBn: "চট্টগ্রাম উপকূলীয় সমভূমি (চট্টগ্রাম / কক্সবাজার)",
    divisions: ["Chittagong"],
    soilTexture: "sandy_loam",
    soilPh: 5.8,
    typicalRabiRootzoneMoisture: 0.22,
    typicalRabiSolarRad: 18.2,
    typicalMeanTemp: 25.1,
    typicalEt0: 4.0,
  },
  "AEZ-03": {
    nameEn: "Tista Meander Floodplain (Rangpur / Dinajpur)",
    nameBn: "তিস্তা সর্পিল প্লাবনভূমি (রংপুর / দিনাজপুর)",
    divisions: ["Rangpur"],
    soilTexture: "sandy_loam",
    soilPh: 5.9,
    typicalRabiRootzoneMoisture: 0.20,
    typicalRabiSolarRad: 17.0,
    typicalMeanTemp: 21.8,
    typicalEt0: 3.7,
  },
};

function getFallbackCrops(): Crop[] {
  return [
    {
      id: "rice_boro",
      nameEn: "Boro Rice",
      nameBn: "বোরো ধান",
      variety: "BRRI dhan28 / BRRI dhan89",
      family: "Poaceae",
      seasons: ["Rabi"],
      waterDemand: 5,
      heatTolerance: 35,
      typicalIrrigationMm: 1200,
      soilPreference: { textures: ["clay", "clay_loam", "loam"], minPh: 5.5, maxPh: 7.5 },
      nFixKgHa: { min: 0, max: 0, cited: "BRRI" },
      rotationRules: { disallowedPrecedingFamilies: ["Poaceae"], minYearsBeforeRepeat: 0, maxConsecutiveSeasons: 1 },
      icon: "rice",
      agronomicRoleEn: "Winter staple rice",
      agronomicRoleBn: "শীতকালীন বোরো ধান",
    },
    {
      id: "rice_aus",
      nameEn: "Aus Rice",
      nameBn: "আউশ ধান",
      variety: "BRRI dhan48",
      family: "Poaceae",
      seasons: ["Kharif-1"],
      waterDemand: 3,
      heatTolerance: 36,
      typicalIrrigationMm: 300,
      soilPreference: { textures: ["loam", "clay_loam"], minPh: 5.5, maxPh: 7.2 },
      nFixKgHa: { min: 0, max: 0, cited: "BRRI" },
      rotationRules: { disallowedPrecedingFamilies: ["Poaceae"], minYearsBeforeRepeat: 0, maxConsecutiveSeasons: 1 },
      icon: "sprout",
      agronomicRoleEn: "Early summer rice",
      agronomicRoleBn: "আউশ ধান",
    },
    {
      id: "rice_aman",
      nameEn: "T. Aman Rice",
      nameBn: "রোপা আমন ধান",
      variety: "BRRI dhan49",
      family: "Poaceae",
      seasons: ["Kharif-2"],
      waterDemand: 4,
      heatTolerance: 36,
      typicalIrrigationMm: 100,
      soilPreference: { textures: ["clay", "clay_loam", "loam"], minPh: 5.0, maxPh: 7.5 },
      nFixKgHa: { min: 0, max: 0, cited: "BRRI" },
      rotationRules: { disallowedPrecedingFamilies: ["Poaceae"], minYearsBeforeRepeat: 0, maxConsecutiveSeasons: 1 },
      icon: "rice",
      agronomicRoleEn: "Monsoon staple rice",
      agronomicRoleBn: "বর্ষাকালীন আমন ধান",
    },
    {
      id: "lentil",
      nameEn: "Lentil",
      nameBn: "মসুর ডাল",
      variety: "BARI Masur-8",
      family: "Fabaceae",
      seasons: ["Rabi"],
      waterDemand: 2,
      heatTolerance: 32,
      typicalIrrigationMm: 150,
      soilPreference: { textures: ["loam", "clay_loam"], minPh: 6.0, maxPh: 7.8 },
      nFixKgHa: { min: 35, max: 65, cited: "BARI Pulses" },
      rotationRules: { disallowedPrecedingFamilies: ["Fabaceae"], minYearsBeforeRepeat: 1, maxConsecutiveSeasons: 1 },
      icon: "legume",
      agronomicRoleEn: "Nitrogen-fixing legume",
      agronomicRoleBn: "নাইট্রোজেন সংবন্ধনকারী মসুর ডাল",
    },
    {
      id: "mung_bean",
      nameEn: "Mung Bean",
      nameBn: "মুগ ডাল",
      variety: "BARI Mung-6",
      family: "Fabaceae",
      seasons: ["Kharif-1", "Kharif-2"],
      waterDemand: 2,
      heatTolerance: 38,
      typicalIrrigationMm: 180,
      soilPreference: { textures: ["sandy_loam", "loam"], minPh: 6.0, maxPh: 7.5 },
      nFixKgHa: { min: 30, max: 60, cited: "BARI Pulses" },
      rotationRules: { disallowedPrecedingFamilies: ["Fabaceae"], minYearsBeforeRepeat: 0, maxConsecutiveSeasons: 1 },
      icon: "legume",
      agronomicRoleEn: "Fast summer pulse",
      agronomicRoleBn: "গ্রীষ্মকালীন মুগ ডাল",
    },
    {
      id: "mustard",
      nameEn: "Mustard",
      nameBn: "সরিষা",
      variety: "BARI Sarisha-14",
      family: "Brassicaceae",
      seasons: ["Rabi"],
      waterDemand: 2,
      heatTolerance: 32,
      typicalIrrigationMm: 180,
      soilPreference: { textures: ["loam", "sandy_loam"], minPh: 5.8, maxPh: 7.5 },
      nFixKgHa: { min: 0, max: 0, cited: "BARI" },
      rotationRules: { disallowedPrecedingFamilies: ["Brassicaceae"], minYearsBeforeRepeat: 1, maxConsecutiveSeasons: 1 },
      icon: "flower",
      agronomicRoleEn: "Winter oilseed break crop",
      agronomicRoleBn: "শীতকালীন সরিষা",
    },
  ];
}
