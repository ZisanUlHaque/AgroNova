import { readFileSync } from "fs";
import { dirname, join } from "path";
import {
  Crop,
  NasaContext,
  TargetGoal,
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

    // Try relative to dist or src or root of package
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
        // try next
      }
    }
  } catch (e) {
    // fallback
  }

  // Built-in fallback if file system path resolution differs
  return getFallbackCrops();
}

/**
 * Main engine entrypoint: generates top recommendation and alternative 4-year plans
 */
export function generateCropRotation(
  context: NasaContext,
  targetGoal: TargetGoal = "BALANCED",
  startDate: Date = new Date()
): EngineResult {
  const crops = loadCrops();
  const slots = generateSeasonSlots(startDate, 12);

  const candidateSequences = generateCandidateSequences({
    crops,
    slots,
    context,
    maxCandidates: 40,
  });

  if (candidateSequences.length === 0) {
    throw new Error("No feasible crop rotation sequences found satisfying agronomic constraints.");
  }

  // Score all candidate sequences
  const scoredPlans: RotationPlan[] = candidateSequences.map((seq, idx) =>
    scoreCandidateSequence(seq, slots, context, targetGoal, `plan_${idx + 1}`)
  );

  // Sort descending by score
  scoredPlans.sort((a, b) => b.overallScore - a.overallScore);

  const recommendedPlan = scoredPlans[0];

  // Find a distinct alternative plan (differs in at least 3 seasons)
  let alternativePlan = scoredPlans[1] || scoredPlans[0];
  for (let i = 1; i < scoredPlans.length; i++) {
    const candidate = scoredPlans[i];
    let diffCount = 0;
    for (let s = 0; s < 12; s++) {
      if (candidate.seasons[s].cropId !== recommendedPlan.seasons[s].cropId) {
        diffCount++;
      }
    }
    if (diffCount >= 3) {
      alternativePlan = candidate;
      break;
    }
  }

  return {
    recommendedPlan,
    alternativePlan,
    generatedAt: new Date().toISOString(),
    disclaimerEn:
      "NASA SMAP soil moisture (9 km) provides regional hydrological context, not field truth. TerraShift crop rotations are agronomist-reviewed decision support tools, not guaranteed yield forecasts.",
    disclaimerBn:
      "নাসা এসএমএপি (৯ কিমি) মাটির আর্দ্রতা আঞ্চলিক চিত্র প্রকাশ করে, জমিনের সার্বিক সত্য নয়। টেরাশাফট শস্য আবর্তন কৃষিবিদদের নির্দেশনায় প্রস্তুতকৃত সিদ্ধান্ত সহায়ক পরামর্শ, কোনো নিশ্চিত ফলন প্রতিশ্রুতি নয়।",
  };
}

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
      soilPreference: { textures: ["clay", "clay_loam", "loam"], minPh: 5.5, maxPh: 7.5 },
      nFixKgHa: { min: 0, max: 0, cited: "BRRI" },
      rotationRules: { disallowedPrecedingFamilies: ["Poaceae"], minYearsBeforeRepeat: 0, maxConsecutiveSeasons: 1 },
      icon: "rice",
      agronomicRoleEn: "Winter staple rice",
      agronomicRoleBn: "শীতকালীন বোরো ধান"
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
      soilPreference: { textures: ["loam", "clay_loam"], minPh: 5.5, maxPh: 7.2 },
      nFixKgHa: { min: 0, max: 0, cited: "BRRI" },
      rotationRules: { disallowedPrecedingFamilies: ["Poaceae"], minYearsBeforeRepeat: 0, maxConsecutiveSeasons: 1 },
      icon: "sprout",
      agronomicRoleEn: "Early summer rice",
      agronomicRoleBn: "আউশ ধান"
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
      soilPreference: { textures: ["clay", "clay_loam", "loam"], minPh: 5.0, maxPh: 7.5 },
      nFixKgHa: { min: 0, max: 0, cited: "BRRI" },
      rotationRules: { disallowedPrecedingFamilies: ["Poaceae"], minYearsBeforeRepeat: 0, maxConsecutiveSeasons: 1 },
      icon: "rice",
      agronomicRoleEn: "Monsoon staple rice",
      agronomicRoleBn: "বর্ষাকালীন আমন ধান"
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
      soilPreference: { textures: ["loam", "clay_loam"], minPh: 6.0, maxPh: 7.8 },
      nFixKgHa: { min: 35, max: 65, cited: "BARI Pulses" },
      rotationRules: { disallowedPrecedingFamilies: ["Fabaceae"], minYearsBeforeRepeat: 1, maxConsecutiveSeasons: 1 },
      icon: "legume",
      agronomicRoleEn: "Nitrogen-fixing legume",
      agronomicRoleBn: "নাইট্রোজেন সংবন্ধনকারী মসুর ডাল"
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
      soilPreference: { textures: ["sandy_loam", "loam"], minPh: 6.0, maxPh: 7.5 },
      nFixKgHa: { min: 30, max: 60, cited: "BARI Pulses" },
      rotationRules: { disallowedPrecedingFamilies: ["Fabaceae"], minYearsBeforeRepeat: 0, maxConsecutiveSeasons: 1 },
      icon: "legume",
      agronomicRoleEn: "Fast summer pulse",
      agronomicRoleBn: "গ্রীষ্মকালীন মুগ ডাল"
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
      soilPreference: { textures: ["loam", "sandy_loam"], minPh: 5.8, maxPh: 7.5 },
      nFixKgHa: { min: 0, max: 0, cited: "BARI" },
      rotationRules: { disallowedPrecedingFamilies: ["Brassicaceae"], minYearsBeforeRepeat: 1, maxConsecutiveSeasons: 1 },
      icon: "flower",
      agronomicRoleEn: "Winter oilseed break crop",
      agronomicRoleBn: "শীতকালীন সরিষা"
    }
  ];
}
