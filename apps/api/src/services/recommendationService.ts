import { db, FarmEntity } from "../storage/db";
import { nasaService } from "./nasaService";
import {
  generateCropRotation,
  NasaContext,
  TargetGoal,
  EngineResult,
} from "@terrashift/engine";

export const recommendationService = {
  async generateForFarm(
    farm: FarmEntity,
    targetGoal: TargetGoal = "BALANCED",
    forceRefresh: boolean = false
  ): Promise<{
    result: EngineResult;
    dataFreshness: {
      powerFresh: boolean;
      smapFresh: boolean;
      powerSource: string;
      powerWarning: string | null;
      smapSource: string;
      smapWarning: string | null;
      soilSource: string;
      smapGranuleDate: string | null;
      lastUpdated: string;
    };
  }> {
    // 1. Ensure NASA Cache is present
    const cache = await nasaService.ingestForFarm(
      farm.id,
      farm.latitude,
      farm.longitude,
      forceRefresh
    );

    const isPowerFresh = nasaService.isPowerFresh(cache);
    const isSmapFresh = nasaService.isSmapFresh(cache);
    const powerData = cache.powerData as Record<string, any> | null;
    const smapData = cache.smapData as Record<string, any> | null;
    const soilData = cache.soilData as Record<string, any> | null;
    const userSoilProvided = farm.soilSource === "MEASURED" || farm.soilSource === "MIXED";
    const isSoilGrids = soilData?.source === "ISRIC_SOILGRIDS_REST";
    const soilGridsTexture = isSoilGrids
      ? soilData?.soilTexture ?? soilData?.texture ?? null
      : null;
    const soilGridsPh = isSoilGrids
      ? soilData?.soilPh ?? soilData?.ph ?? null
      : null;
    const soilTexture =
      (userSoilProvided ? farm.soilTexture : null) ?? soilGridsTexture;
    const soilPh =
      (userSoilProvided ? farm.soilPh : null) ?? soilGridsPh;
    const usedSoilGrids =
      (farm.soilTexture == null && soilGridsTexture != null) ||
      (farm.soilPh == null && soilGridsPh != null);
    const soilSource =
      farm.soilSource === "MEASURED" && farm.soilTexture != null && farm.soilPh != null
        ? "MEASURED"
        : usedSoilGrids
          ? "ESTIMATED"
          : userSoilProvided ? "PARTIAL" : "DEFAULT";

    // 2. Prepare Engine Context
    const engineContext: NasaContext = {
      powerMeanTemp: isPowerFresh ? cache.powerMeanTemp : null,
      powerTotalPrecip: isPowerFresh ? cache.powerTotalPrecip : null,
      powerSolarRad: isPowerFresh ? cache.powerSolarRad : null,
      powerHeatDays: isPowerFresh ? cache.powerHeatDays : null,
      powerRecentMaxTemp:
        isPowerFresh && typeof powerData?.recentMaxTemp === "number"
          ? powerData.recentMaxTemp
          : null,
      powerFetchedAt:
        isPowerFresh && cache.powerFetchedAt
          ? new Date(cache.powerFetchedAt).toISOString()
          : null,
      smapSurface: isSmapFresh ? cache.smapSurface : null,
      smapRootzone: isSmapFresh ? cache.smapRootzone : null,
      smapGranuleDate: isSmapFresh ? cache.smapGranuleDate : null,
      smapFetchedAt: cache.smapFetchedAt ? new Date(cache.smapFetchedAt).toISOString() : null,
      et0Mean: isPowerFresh ? cache.et0Mean : null,
      etSource: isPowerFresh ? cache.etSource : null,
      soilTexture,
      soilPh,
      soilSource,
    };

    // 3. Run Rotation Engine
    const result = generateCropRotation(engineContext, targetGoal);

    // 4. Persist to DB
    await db.createRotation({
      farmId: farm.id,
      targetGoal,
      confidence: result.recommendedPlan.confidence,
      seasons: result.recommendedPlan.seasons,
      alternativePlan: result.alternativePlan.seasons,
      inputsUsed: result.recommendedPlan.inputsUsed,
      waterSavingsRange: result.recommendedPlan.waterSavingsRange,
      nitrogenGainRange: result.recommendedPlan.nitrogenGainRange,
      engineVersion: result.recommendedPlan.engineVersion,
    });

    const dataFreshness = {
      powerFresh: isPowerFresh,
      smapFresh: isSmapFresh,
      powerSource: powerData?.source ?? "UNKNOWN",
      powerWarning: powerData?.warning ?? null,
      smapSource: smapData?.source ?? "UNKNOWN",
      smapWarning: smapData?.warning ?? null,
      soilSource: engineContext.soilSource || "ESTIMATED",
      smapGranuleDate: cache.smapGranuleDate,
      lastUpdated: cache.updatedAt.toISOString(),
    };

    return { result, dataFreshness };
  },
};
