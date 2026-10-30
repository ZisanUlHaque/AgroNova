export type SeasonName = "Rabi" | "Kharif-1" | "Kharif-2";

export type TargetGoal =
  | "BALANCED"
  | "CONSERVE_WATER"
  | "RESTORE_NITROGEN"
  | "CUSTOM";

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
  typicalIrrigationMm?: number; // Estimated typical irrigation requirement in mm
}

export interface SeasonSlot {
  year: number;
  season: SeasonName;
  index: number; // 0 to N-1
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
  landsatEtFraction?: number | null; // Landsat thermal evaporative fraction (ETa / ET0)
  soilTexture?: string | null;
  soilPh?: number | null;
  soilSource?: "ESTIMATED" | "MEASURED" | "DEFAULT" | "PARTIAL" | "OFFLINE_AEZ";
  aezCode?: string | null; // e.g. "AEZ-13: Deep Red-Brown & Deltaic Floodplain"
  isOfflineAezBaseline?: boolean;
}

export interface ScoringWeights {
  water: number;
  soil: number;
  nitrogen: number;
  heat: number;
}

export interface QuantitativeMetrics {
  waterUsageComparison: {
    conventionalIrrigationMm: number;
    recommendedIrrigationMm: number;
    reductionPercent: number;
    waterSavedM3PerHa: number;
    pumpingCostSavedBdtPerHa: { min: number; max: number };
  };
  nitrogenMetrics: {
    biologicalNFixedKgHaPerYear: { min: number; max: number };
    syntheticUreaSavedKgHaPerYear: { min: number; max: number };
    fertilizerCostSavedBdtPerHa: { min: number; max: number };
  };
  soilOrganicMatterMetrics: {
    annualSomAccretionPercent: { min: number; max: number };
    biomassResidueTonHaPerYear: { min: number; max: number };
  };
  pestDisruptionScore: {
    pestVulnerabilityReductionPercent: number;
    monocultureBreakCount: number;
    biofumigationPresent: boolean;
  };
  tradeOffs: {
    summaryEn: string;
    summaryBn: string;
    caloricTradeOffEn: string;
    caloricTradeOffBn: string;
    economicReturnEn: string;
    economicReturnBn: string;
  };
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
  cycleYears: number; // 3 or 4 years
  confidence: ConfidenceLevel;
  confidenceReasonEn: string;
  confidenceReasonBn: string;
  overallScore: number;
  seasons: PlanSeasonItem[];
  waterSavingsRange: string;
  nitrogenGainRange: string;
  engineVersion: string;
  quantitativeMetrics: QuantitativeMetrics;
  weightsUsed: ScoringWeights;
  inputsUsed: {
    meanTemp?: number | null;
    totalPrecip?: number | null;
    smapRootzone?: number | null;
    et0Mean?: number | null;
    soilTexture?: string | null;
    soilPh?: number | null;
    soilSource: string;
    aezCode?: string | null;
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
