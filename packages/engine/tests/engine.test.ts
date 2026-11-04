import { describe, it, expect } from "vitest";
import {
  generateCropRotation,
  getCurrentSeason,
  generateSeasonSlots,
  calculateWaterFit,
  calculateSoilFit,
  calculateNitrogenBenefit,
  calculateHeatRisk,
  getGoalWeights,
  determineConfidence,
  computeQuantitativeMetrics,
  loadCrops,
  BANGLADESH_AEZ_BASELINES,
} from "../src/index.js";
import { NasaContext } from "../src/types.js";

describe("TerraShift Agronomic Rotation Engine", () => {
  const crops = loadCrops();
  const mockContext: NasaContext = {
    powerMeanTemp: 26.5,
    powerTotalPrecip: 120.0,
    powerSolarRad: 18.2,
    powerHeatDays: 2,
    powerRecentMaxTemp: 32.0,
    powerFetchedAt: new Date().toISOString(),
    smapSurface: 0.32,
    smapRootzone: 0.35,
    smapGranuleDate: "2026-09-28",
    smapFetchedAt: new Date().toISOString(),
    et0Mean: 3.8,
    etSource: "FAO56-PM-from-POWER",
    soilTexture: "clay_loam",
    soilPh: 6.5,
    soilSource: "MEASURED",
  };

  it("loads Bangladesh starter crops successfully", () => {
    expect(crops.length).toBeGreaterThanOrEqual(9);
    const cropNames = crops.map((c) => c.id);
    expect(cropNames).toContain("rice_boro");
    expect(cropNames).toContain("rice_aman");
    expect(cropNames).toContain("wheat");
    expect(cropNames).toContain("lentil");
    expect(cropNames).toContain("mustard");
  });

  it("determines correct seasonal slots for both 3-year (9 seasons) and 4-year (12 seasons) cycles", () => {
    const slots9 = generateSeasonSlots(new Date(2026, 10, 15), 9); // Nov 15 = Rabi
    expect(slots9.length).toBe(9);
    expect(slots9[0].season).toBe("Rabi");
    expect(slots9[1].season).toBe("Kharif-1");
    expect(slots9[2].season).toBe("Kharif-2");
    expect(slots9[8].year).toBe(3);

    const slots12 = generateSeasonSlots(new Date(2026, 10, 15), 12);
    expect(slots12.length).toBe(12);
    expect(slots12[11].year).toBe(4);
  });

  it("satisfies the 'no same-family repeat in consecutive seasons' rule", () => {
    const result = generateCropRotation(mockContext, { cycleYears: 3, targetGoal: "BALANCED" });
    const seasons = result.recommendedPlan.seasons;

    for (let i = 1; i < seasons.length; i++) {
      const prev = seasons[i - 1];
      const curr = seasons[i];
      // Consecutive crops should not share the same family (e.g. Poaceae -> Poaceae)
      expect(curr.family).not.toBe(prev.family);
      expect(curr.cropId).not.toBe(prev.cropId);
    }
  });

  it("enforces at least one nitrogen-fixing legume per agricultural year", () => {
    const result = generateCropRotation(mockContext, { cycleYears: 3, targetGoal: "BALANCED" });
    const seasons = result.recommendedPlan.seasons;

    // Check years 1, 2, 3
    for (let year = 1; year <= 3; year++) {
      const yearCrops = seasons.filter((s) => s.year === year);
      const hasLegume = yearCrops.some((s) => s.family === "Fabaceae");
      expect(hasLegume).toBe(true);
    }
  });

  it("correctly shifts scoring weights based on targetGoal", () => {
    const balancedWeights = getGoalWeights("BALANCED");
    const waterWeights = getGoalWeights("CONSERVE_WATER");
    const nitrogenWeights = getGoalWeights("RESTORE_NITROGEN");

    expect(waterWeights.water).toBe(0.5);
    expect(waterWeights.nitrogen).toBe(0.15);

    expect(nitrogenWeights.nitrogen).toBe(0.4);
    expect(nitrogenWeights.water).toBe(0.25);

    expect(balancedWeights.water).toBe(0.35);
    expect(balancedWeights.soil).toBe(0.25);
  });

  it("supports normalized custom farmer weights", () => {
    const customWeights = getGoalWeights("CUSTOM", {
      water: 40,
      soil: 20,
      nitrogen: 30,
      heat: 10,
    });

    expect(customWeights.water).toBe(0.4);
    expect(customWeights.soil).toBe(0.2);
    expect(customWeights.nitrogen).toBe(0.3);
    expect(customWeights.heat).toBe(0.1);
  });

  it("caps plan confidence at MEDIUM because no future seasonal forecast is used", () => {
    const conf = determineConfidence(mockContext);
    expect(conf.level).toBe("MEDIUM");
    expect(conf.reasonEn).toContain("weather");
  });

  it("assigns MEDIUM confidence when NASA is fresh but soil is estimated", () => {
    const estimatedContext: NasaContext = {
      ...mockContext,
      soilSource: "ESTIMATED",
    };
    const conf = determineConfidence(estimatedContext);
    expect(conf.level).toBe("MEDIUM");
  });

  it("assigns LOW confidence when NASA data is missing or stale", () => {
    const missingContext: NasaContext = {
      ...mockContext,
      powerMeanTemp: null,
      smapRootzone: null,
    };
    const conf = determineConfidence(missingContext);
    expect(conf.level).toBe("LOW");
  });

  it("supports pre-cached Bangladesh AEZ climatological baselines for offline generation", () => {
    expect(BANGLADESH_AEZ_BASELINES["AEZ-13"]).toBeDefined();
    expect(BANGLADESH_AEZ_BASELINES["AEZ-13"].divisions).toContain("Barisal");

    const offlineAezContext: NasaContext = {
      soilSource: "OFFLINE_AEZ",
      aezCode: "AEZ-13",
      isOfflineAezBaseline: true,
      soilTexture: BANGLADESH_AEZ_BASELINES["AEZ-13"].soilTexture,
      soilPh: BANGLADESH_AEZ_BASELINES["AEZ-13"].soilPh,
      smapRootzone: BANGLADESH_AEZ_BASELINES["AEZ-13"].typicalRabiRootzoneMoisture,
      et0Mean: BANGLADESH_AEZ_BASELINES["AEZ-13"].typicalEt0,
    };

    const conf = determineConfidence(offlineAezContext);
    expect(conf.level).toBe("MEDIUM");
    expect(conf.reasonEn).toContain("Agro-Ecological Zone");

    const result = generateCropRotation(offlineAezContext, { cycleYears: 3, targetGoal: "BALANCED" });
    expect(result.recommendedPlan.seasons.length).toBe(9);
  });

  it("computes rigorous quantitative metrics (water, nitrogen, SOM, pest disruption)", () => {
    const result = generateCropRotation(mockContext, { cycleYears: 3, targetGoal: "RESTORE_NITROGEN" });
    const metrics = result.recommendedPlan.quantitativeMetrics;

    expect(metrics).toBeDefined();
    expect(metrics.waterUsageComparison.reductionPercent).toBeGreaterThan(30);
    expect(metrics.waterUsageComparison.waterSavedM3PerHa).toBeGreaterThan(2000);
    expect(metrics.nitrogenMetrics.biologicalNFixedKgHaPerYear.min).toBeGreaterThan(0);
    expect(metrics.soilOrganicMatterMetrics.annualSomAccretionPercent.min).toBeGreaterThan(0.05);
    expect(metrics.pestDisruptionScore.pestVulnerabilityReductionPercent).toBeGreaterThan(40);
    expect(metrics.tradeOffs.economicReturnBn).toBeDefined();
  });
});
