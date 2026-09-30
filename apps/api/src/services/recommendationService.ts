import { db, FarmEntity } from "../storage/db.js";
import { nasaService } from "./nasaService.js";
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

    const isPowerFresh = cache.powerFetchedAt
      ? (new Date().getTime() - new Date(cache.powerFetchedAt).getTime()) < 24 * 3600 * 1000
      : false;
    const isSmapFresh = cache.smapFetchedAt
      ? (new Date().getTime() - new Date(cache.smapFetchedAt).getTime()) < 7 * 24 * 3600 * 1000
      : false;

    // 2. Prepare Engine Context
    const engineContext: NasaContext = {
      powerMeanTemp: cache.powerMeanTemp,
      powerTotalPrecip: cache.powerTotalPrecip,
      powerSolarRad: cache.powerSolarRad,
      powerHeatDays: cache.powerHeatDays,
      powerRecentMaxTemp: (cache.powerData as any)?.recentMaxTemp ?? 33.2,
      powerFetchedAt: cache.powerFetchedAt ? new Date(cache.powerFetchedAt).toISOString() : null,
      smapSurface: cache.smapSurface,
      smapRootzone: cache.smapRootzone,
      smapGranuleDate: cache.smapGranuleDate,
      smapFetchedAt: cache.smapFetchedAt ? new Date(cache.smapFetchedAt).toISOString() : null,
      et0Mean: cache.et0Mean,
      etSource: cache.etSource,
      soilTexture: farm.soilTexture || (cache.soilData as any)?.texture || "clay_loam",
      soilPh: farm.soilPh ?? (cache.soilData as any)?.ph ?? 6.8,
      soilSource: (farm.soilSource as any) || "ESTIMATED",
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
      soilSource: engineContext.soilSource || "ESTIMATED",
      smapGranuleDate: cache.smapGranuleDate,
      lastUpdated: new Date().toISOString(),
    };

    return { result, dataFreshness };
  },
};
