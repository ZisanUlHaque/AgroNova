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
  loadCrops,
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

  it("determines correct seasonal slots for a 4-year cycle (12 seasons)", () => {
    const slots = generateSeasonSlots(new Date(2026, 10, 15), 12); // Nov 15 = Rabi
    expect(slots.length).toBe(12);
    expect(slots[0].season).toBe("Rabi");
    expect(slots[1].season).toBe("Kharif-1");
    expect(slots[2].season).toBe("Kharif-2");
    expect(slots[3].season).toBe("Rabi");
  });

  it("satisfies the 'no same-family repeat in consecutive seasons' rule", () => {
    const result = generateCropRotation(mockContext, "BALANCED");
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
    const result = generateCropRotation(mockContext, "BALANCED");
    const seasons = result.recommendedPlan.seasons;

    // Check years 1, 2, 3, 4
    for (let year = 1; year <= 4; year++) {
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

  it("assigns HIGH confidence when NASA is fresh and soil is measured", () => {
    const conf = determineConfidence(mockContext);
    expect(conf.level).toBe("HIGH");
  });

  it("assigns MEDIUM confidence when NASA is fresh but soil is estimated", () => {
    const estimatedContext: NasaContext = {
      ...mockContext,
      soilSource: "ESTIMATED",
    };
    const conf = determineConfidence(estimatedContext);
    expect(conf.level).toBe("MEDIUM");
  });

  it("does not describe partial farmer soil inputs as an ISRIC estimate", () => {
    const partialContext: NasaContext = {
      ...mockContext,
      soilTexture: "clay_loam",
      soilPh: null,
      soilSource: "PARTIAL",
    };
    const conf = determineConfidence(partialContext);
    expect(conf.level).toBe("MEDIUM");
    expect(conf.reasonEn).toContain("missing soil values remain unknown");
  });

  it("uses a neutral soil baseline when no soil measurements or estimate are available", () => {
    const defaultContext: NasaContext = {
      ...mockContext,
      soilTexture: null,
      soilPh: null,
      soilSource: "DEFAULT",
    };
    const conf = determineConfidence(defaultContext);
    expect(conf.level).toBe("MEDIUM");
    expect(conf.reasonEn).toContain("neutral soil scoring");
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

  it("returns both a recommended plan and an alternative plan with ranges", () => {
    const result = generateCropRotation(mockContext, "CONSERVE_WATER");
    expect(result.recommendedPlan).toBeDefined();
    expect(result.alternativePlan).toBeDefined();
    expect(result.recommendedPlan.seasons.length).toBe(12);
    expect(result.alternativePlan.seasons.length).toBe(12);
    expect(result.recommendedPlan.waterSavingsRange).toContain("%");
    expect(result.recommendedPlan.nitrogenGainRange).toContain("kg");
  });
});
