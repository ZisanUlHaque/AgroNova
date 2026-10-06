import { afterEach, describe, expect, it, vi } from "vitest";
import { config } from "../src/config";
import { nasaService } from "../src/services/nasaService";

const farmId = "barisal-pilot-farm-1";
const latitude = 22.701;
const longitude = 90.3535;

function powerPayload() {
  const dates = ["20260928", "20260929"];
  const values: Record<string, number[]> = {
    T2M: [28, 29],
    T2M_MAX: [33, 34],
    T2M_MIN: [23, 24],
    T2MDEW: [20, 21],
    PRECTOTCORR: [5, 0],
    ALLSKY_SFC_SW_DWN: [18, 20],
    WS2M: [1.8, 2],
  };
  return {
    properties: {
      parameter: Object.fromEntries(
        Object.entries(values).map(([key, series]) => [
          key,
          Object.fromEntries(dates.map((date, index) => [date, series[index]])),
        ])
      ),
    },
  };
}

describe("NASA data ingestion", () => {
  const originalWorkerUrl = config.nasaIngestWorkerUrl;

  afterEach(() => {
    config.nasaIngestWorkerUrl = originalWorkerUrl;
    vi.unstubAllGlobals();
  });

  it("stores NASA POWER observations and leaves unavailable SMAP values empty", async () => {
    config.nasaIngestWorkerUrl = "";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => powerPayload(),
      })
    );

    const cache = await nasaService.ingestForFarm(farmId, latitude, longitude, true);

    expect(cache.powerData.source).toBe("NASA_POWER_LIVE");
    expect(cache.powerData.parameters).toContain("T2MDEW");
    expect(cache.powerMeanTemp).toBe(28.5);
    expect(cache.powerTotalPrecip).toBe(5);
    expect(cache.smapData.source).toBe("NASA_EARTHDATA_NOT_CONFIGURED");
    expect(cache.smapSurface).toBeNull();
    expect(cache.smapRootzone).toBeNull();
    expect(nasaService.isPowerFresh(cache)).toBe(true);
    expect(nasaService.isSmapFresh(cache)).toBe(false);
  });

  it("does not substitute invented climate values when NASA POWER is unavailable", async () => {
    config.nasaIngestWorkerUrl = "";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("upstream offline")));

    const cache = await nasaService.ingestForFarm(farmId, latitude, longitude, true);

    expect(cache.powerData.source).toBe("NASA_POWER_UNAVAILABLE");
    expect(cache.powerData.warning).toContain("upstream offline");
    expect(cache.powerMeanTemp).toBeNull();
    expect(cache.powerTotalPrecip).toBeNull();
    expect(cache.et0Mean).toBeNull();
  });
});
