export type SeasonName = "Rabi" | "Kharif-1" | "Kharif-2";

export type TargetGoal = "BALANCED" | "CONSERVE_WATER" | "RESTORE_NITROGEN";

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface SoilPreference {
  textures: string[];
  minPh: number;
  maxPh: number;
}

export interface NFixRange {
  min: number;
  max: number;
  cited: string;
}

export interface RotationRules {
  disallowedPrecedingFamilies: string[];
  minYearsBeforeRepeat: number;
  maxConsecutiveSeasons: number;
}

export interface Crop {
  id: string;
  nameEn: string;
  nameBn: string;
  variety: string;
  family: string;
  seasons: SeasonName[];
  waterDemand: number; // 1 (low) - 5 (very high)
  heatTolerance: number; // Max degrees C for flowering
  soilPreference: SoilPreference;
  nFixKgHa: NFixRange;
  rotationRules: RotationRules;
  icon: string;
  agronomicRoleEn: string;
  agronomicRoleBn: string;
}

export interface SeasonSlot {
  year: number;
  season: SeasonName;
  index: number; // 0 to 11
}

export interface NasaContext {
  powerMeanTemp?: number | null;
  powerTotalPrecip?: number | null;
  powerSolarRad?: number | null;
  powerHeatDays?: number | null;
  powerRecentMaxTemp?: number | null;
  powerFetchedAt?: string | null;
  smapSurface?: number | null; // m3/m3
  smapRootzone?: number | null; // m3/m3
  smapGranuleDate?: string | null;
  smapFetchedAt?: string | null;
  et0Mean?: number | null; // mm/day
  etSource?: string | null;
  soilTexture?: string | null;
  soilPh?: number | null;
  soilSource?: "ESTIMATED" | "MEASURED" | "DEFAULT" | "PARTIAL";
}

export interface ScoringWeights {
  water: number;
  soil: number;
  nitrogen: number;
  heat: number;
}

export interface PlanSeasonItem {
  year: number;
  season: SeasonName;
  cropId: string;
  cropNameEn: string;
  cropNameBn: string;
  variety: string;
  family: string;
  icon: string;
  waterDemand: number;
  heatTolerance: number;
  nFixRange: {
    min: number;
    max: number;
    text: string;
  };
  reasonEn: string;
  reasonBn: string;
  scoreBreakdown: {
    waterFit: number;
    soilFit: number;
    nitrogenBenefit: number;
    heatRisk: number;
    overall: number;
  };
}

export interface RotationPlan {
  planId: string;
  targetGoal: TargetGoal;
  confidence: ConfidenceLevel;
  confidenceReasonEn: string;
  confidenceReasonBn: string;
  overallScore: number;
  seasons: PlanSeasonItem[];
  waterSavingsRange: string;
  nitrogenGainRange: string;
  engineVersion: string;
  inputsUsed: {
    meanTemp?: number | null;
    totalPrecip?: number | null;
    smapRootzone?: number | null;
    et0Mean?: number | null;
    soilTexture?: string | null;
    soilPh?: number | null;
    soilSource: string;
    nasaFreshness: {
      powerFresh: boolean;
      smapFresh: boolean;
      smapGranuleDate?: string | null;
    };
  };
}

export interface EngineResult {
  recommendedPlan: RotationPlan;
  alternativePlan: RotationPlan;
  generatedAt: string;
  disclaimerEn: string;
  disclaimerBn: string;
}
