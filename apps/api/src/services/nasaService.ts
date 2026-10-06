import { db, NasaCacheEntity } from "../storage/db";
import { config } from "../config";

const POWER_ENDPOINT = "https://power.larc.nasa.gov/api/temporal/daily/point";
const POWER_PARAMETERS = [
  "T2M",
  "T2M_MAX",
  "T2M_MIN",
  "T2MDEW",
  "PRECTOTCORR",
  "ALLSKY_SFC_SW_DWN",
  "WS2M",
];

type PowerParameters = Record<string, Record<string, number>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractPowerParameters(payload: unknown): PowerParameters {
  if (!isRecord(payload) || !isRecord(payload.properties) || !isRecord(payload.properties.parameter)) {
    throw new Error("NASA POWER response did not include daily parameter series");
  }

  const parameters = payload.properties.parameter;
  for (const parameter of POWER_PARAMETERS) {
    const series = parameters[parameter];
    if (
      !isRecord(series) ||
      !Object.values(series).every((value) => typeof value === "number" && Number.isFinite(value))
    ) {
      throw new Error(`NASA POWER response is missing or has invalid ${parameter} observations`);
    }
  }
  return parameters as PowerParameters;
}

function saturationVaporPressure(temperature: number): number {
  return 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
}

function computeDailyEt0(
  tMax: number,
  tMin: number,
  dewPoint: number,
  windSpeed: number,
  solarRadiation: number,
  latitude: number,
  dayOfYear: number,
  elevation = 10
): number {
  const meanTemperature = (tMax + tMin) / 2;
  const es = (saturationVaporPressure(tMax) + saturationVaporPressure(tMin)) / 2;
  const ea = saturationVaporPressure(dewPoint);
  const vpd = Math.max(0, es - ea);
  const delta =
    (4098 * saturationVaporPressure(meanTemperature)) /
    Math.pow(meanTemperature + 237.3, 2);
  const pressure = 101.3 * Math.pow((293 - 0.0065 * elevation) / 293, 5.26);
  const gamma = 0.000665 * pressure;

  const latitudeRadians = (latitude * Math.PI) / 180;
  const inverseDistance = 1 + 0.033 * Math.cos((2 * Math.PI * dayOfYear) / 365);
  const solarDeclination = 0.409 * Math.sin((2 * Math.PI * dayOfYear) / 365 - 1.39);
  const sunsetArgument = Math.max(
    -1,
    Math.min(1, -Math.tan(latitudeRadians) * Math.tan(solarDeclination))
  );
  const sunsetAngle = Math.acos(sunsetArgument);
  const extraterrestrialRadiation =
    ((24 * 60) / Math.PI) *
    0.082 *
    inverseDistance *
    (sunsetAngle * Math.sin(latitudeRadians) * Math.sin(solarDeclination) +
      Math.cos(latitudeRadians) * Math.cos(solarDeclination) * Math.sin(sunsetAngle));
  const solar = Math.max(0, solarRadiation);
  const clearSkyRadiation = (0.75 + 2e-5 * elevation) * extraterrestrialRadiation;
  const netShortwave = 0.77 * solar;
  const netLongwave =
    clearSkyRadiation > 0
      ? 4.903e-9 *
        ((Math.pow(tMax + 273.16, 4) + Math.pow(tMin + 273.16, 4)) / 2) *
        (0.34 - 0.14 * Math.sqrt(Math.max(0, ea))) *
        (1.35 * Math.min(solar / clearSkyRadiation, 1) - 0.35)
      : 0;
  const netRadiation = netShortwave - netLongwave;
  const u2 = Math.max(0.2, windSpeed);
  const numerator =
    0.408 * delta * netRadiation +
    gamma * (900 / (meanTemperature + 273)) * u2 * vpd;
  const denominator = delta + gamma * (1 + 0.34 * u2);
  return Math.max(0, Number((numerator / denominator).toFixed(2)));
}

function valid(value: number | undefined): value is number {
  return value !== undefined && value > -900;
}

function asDate(value: unknown, fallback: Date): Date {
  if (typeof value !== "string") return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

async function fetchPower(latitude: number, longitude: number): Promise<Record<string, any>> {
  const now = new Date();
  const end = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const start = new Date(end.getTime() - 89 * 24 * 60 * 60 * 1000);
  const formatDate = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, "");
  const url = new URL(POWER_ENDPOINT);
  url.search = new URLSearchParams({
    parameters: POWER_PARAMETERS.join(","),
    community: "AG",
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    start: formatDate(start),
    end: formatDate(end),
    format: "JSON",
  }).toString();

  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) {
    throw new Error(`NASA POWER returned HTTP ${response.status} ${response.statusText}`);
  }
  const params = extractPowerParameters(await response.json());
  const dates = Object.keys(params.T2M).sort();
  if (dates.length === 0) throw new Error("NASA POWER returned no observations for this location");

  const aggregates = {
    temperature: [] as number[],
    precipitation: [] as number[],
    solar: [] as number[],
    maximumTemperature: [] as number[],
    et0: [] as number[],
  };
  const dailySummary: Record<string, number | string | null>[] = [];

  for (const date of dates) {
    const t = params.T2M[date];
    const max = params.T2M_MAX[date];
    const min = params.T2M_MIN[date];
    const dewPoint = params.T2MDEW[date];
    const precipitation = params.PRECTOTCORR[date];
    const solar = params.ALLSKY_SFC_SW_DWN[date];
    const wind = params.WS2M[date];
    if (valid(t)) aggregates.temperature.push(t);
    if (valid(precipitation)) aggregates.precipitation.push(Math.max(0, precipitation));
    if (valid(solar)) aggregates.solar.push(Math.max(0, solar));
    if (valid(max)) aggregates.maximumTemperature.push(max);
    const dayNumber = Math.floor(
      (Date.UTC(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8))) -
        Date.UTC(Number(date.slice(0, 4)), 0, 0)) /
        86_400_000
    );
    const dailyEt0 =
      valid(max) && valid(min) && valid(dewPoint) && valid(wind) && valid(solar)
        ? computeDailyEt0(max, min, dewPoint, wind, solar, latitude, dayNumber)
        : null;
    if (dailyEt0 != null) aggregates.et0.push(dailyEt0);
    dailySummary.push({
      date,
      t2m: valid(t) ? t : null,
      t2m_max: valid(max) ? max : null,
      t2m_min: valid(min) ? min : null,
      precipitation: valid(precipitation) ? Math.max(0, precipitation) : null,
      solarRadiation: valid(solar) ? Math.max(0, solar) : null,
      et0: dailyEt0,
    });
  }

  if (aggregates.temperature.length === 0) {
    throw new Error("NASA POWER returned no valid temperature observations");
  }
  const mean = (values: number[]) =>
    values.length
      ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2))
      : null;
  return {
    source: "NASA_POWER_LIVE",
    product: "POWER Daily Point (AG)",
    parameters: POWER_PARAMETERS,
    latitude,
    longitude,
    startDate: formatDate(start),
    endDate: formatDate(end),
    daysCount: dates.length,
    validTemperatureDays: aggregates.temperature.length,
    validPrecipitationDays: aggregates.precipitation.length,
    validSolarDays: aggregates.solar.length,
    validEt0Days: aggregates.et0.length,
    meanTemp: mean(aggregates.temperature),
    totalPrecip:
      aggregates.precipitation.length
        ? Number(aggregates.precipitation.reduce((sum, value) => sum + value, 0).toFixed(2))
        : null,
    meanSolarRad: mean(aggregates.solar),
    recentMaxTemp: aggregates.maximumTemperature.length
      ? Number(Math.max(...aggregates.maximumTemperature).toFixed(2))
      : null,
    heatDays: aggregates.maximumTemperature.filter((value) => value >= 33).length,
    et0Mean: mean(aggregates.et0),
    etSource: "FAO56-PM-from-POWER (T2MDEW, WS2M, shortwave radiation)",
    fetchedAt: now.toISOString(),
    dailySummary: dailySummary.slice(-14),
  };
}

function failedPower(error: unknown, latitude: number, longitude: number) {
  const detail = error instanceof Error ? error.message : String(error);
  return {
    source: "NASA_POWER_UNAVAILABLE",
    product: "POWER Daily Point (AG)",
    latitude,
    longitude,
    meanTemp: null,
    totalPrecip: null,
    meanSolarRad: null,
    recentMaxTemp: null,
    heatDays: null,
    et0Mean: null,
    daysCount: 0,
    fetchedAt: new Date().toISOString(),
    warning: detail,
    dailySummary: [],
  };
}

async function fetchWorkerIngest(latitude: number, longitude: number): Promise<Record<string, any>> {
  if (!config.nasaIngestWorkerUrl) {
    throw new Error("NASA ingest worker is not configured");
  }
  const baseUrl = config.nasaIngestWorkerUrl.replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/v1/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude, longitude }),
    signal: AbortSignal.timeout(config.nasaIngestTimeoutMs),
  });
  if (!response.ok) {
    throw new Error(`NASA ingest worker returned HTTP ${response.status}`);
  }
  const data: unknown = await response.json();
  if (!isRecord(data)) throw new Error("NASA ingest worker returned an invalid response");
  return data;
}

function ageMs(date: Date | null, now: number): number {
  return date ? now - date.getTime() : Number.POSITIVE_INFINITY;
}

export const nasaService = {
  isPowerFresh(cache: NasaCacheEntity | null): boolean {
    return Boolean(
      cache?.powerData?.source === "NASA_POWER_LIVE" &&
        ageMs(cache.powerFetchedAt, Date.now()) <= config.powerTtlHours * 3_600_000
    );
  },

  isSmapFresh(cache: NasaCacheEntity | null): boolean {
    return Boolean(
      cache?.smapData?.source === "NASA_EARTHDATA_LIVE" &&
        ageMs(cache.smapFetchedAt, Date.now()) <= config.smapTtlDays * 86_400_000
    );
  },

  isCacheFresh(cache: NasaCacheEntity | null): boolean {
    if (!cache) return false;
    const now = Date.now();
    const powerAttemptFresh =
      ageMs(cache.powerFetchedAt, now) <= config.powerTtlHours * 3_600_000;
    const smapAttemptFresh =
      ageMs(cache.smapFetchedAt, now) <= config.smapTtlDays * 86_400_000;
    return powerAttemptFresh && smapAttemptFresh;
  },

  async ingestForFarm(
    farmId: string,
    latitude: number,
    longitude: number,
    forceRefresh = false
  ): Promise<NasaCacheEntity> {
    const existing = await db.getNasaCache(farmId);
    const seededDemo = existing?.powerData?.source === "NASA_POWER_DEMO_FALLBACK";
    const now = new Date();
    const powerAttemptFresh =
      existing && ageMs(existing.powerFetchedAt, now.getTime()) <= config.powerTtlHours * 3_600_000;
    const smapAttemptFresh =
      existing && ageMs(existing.smapFetchedAt, now.getTime()) <= config.smapTtlDays * 86_400_000;
    if (!forceRefresh && existing && !seededDemo && powerAttemptFresh && smapAttemptFresh) {
      return existing;
    }

    let workerData: Record<string, any> | null = null;
    let workerWarning: string | null = null;
    if (config.nasaIngestWorkerUrl && (forceRefresh || !existing || !smapAttemptFresh)) {
      try {
        workerData = await fetchWorkerIngest(latitude, longitude);
      } catch (error) {
        workerWarning = error instanceof Error ? error.message : String(error);
        console.warn(`NASA worker ingest failed for farm ${farmId}: ${workerWarning}`);
      }
    }

    const workerPowerData = workerData?.powerData as Record<string, any> | undefined;
    let powerData =
      workerPowerData?.source === "NASA_POWER_LIVE" ? workerPowerData : undefined;
    if (!powerData && (forceRefresh || !powerAttemptFresh || seededDemo)) {
      try {
        powerData = await fetchPower(latitude, longitude);
      } catch (error) {
        if (existing?.powerData?.source === "NASA_POWER_LIVE") {
          const detail = error instanceof Error ? error.message : String(error);
          powerData = {
            ...existing.powerData,
            refreshWarning: `NASA POWER refresh failed; retaining the previous observation: ${detail}`,
          };
        } else {
          powerData = failedPower(error, latitude, longitude);
          console.warn(`NASA POWER fetch failed for farm ${farmId}: ${powerData.warning}`);
        }
      }
    }
    if (workerPowerData?.warning && powerData?.source === "NASA_POWER_LIVE") {
      powerData = { ...powerData, workerWarning: workerPowerData.warning };
    }
    if (!powerData && existing) powerData = existing.powerData;
    if (!powerData) powerData = failedPower(new Error("No NASA POWER observation is cached"), latitude, longitude);
    if (workerWarning && powerData.source === "NASA_POWER_LIVE") {
      powerData = { ...powerData, workerWarning };
    }

    const powerFetchedAt =
      powerData.source === "NASA_POWER_LIVE" || powerData.source === "NASA_POWER_UNAVAILABLE"
        ? asDate(powerData.fetchedAt, now)
        : existing?.powerFetchedAt ?? null;

    const workerSmapData = workerData?.smapData as Record<string, any> | undefined;
    let smapData =
      workerSmapData?.source === "NASA_EARTHDATA_LIVE" ? workerSmapData : undefined;
    if (!smapData && existing?.smapData?.source === "NASA_EARTHDATA_LIVE") {
      smapData = {
        ...existing.smapData,
        ...(workerWarning || workerSmapData?.warning
          ? { refreshWarning: workerWarning || workerSmapData?.warning }
          : {}),
      };
    }
    if (!smapData && workerSmapData) smapData = workerSmapData;
    if (!smapData) {
      smapData = {
        source: "NASA_EARTHDATA_NOT_CONFIGURED",
        product: "SPL4SMGP",
        resolution: "9 km",
        smSurface: null,
        smRootzone: null,
        fetchedAt: now.toISOString(),
        warning: config.nasaIngestWorkerUrl
          ? workerWarning || "NASA worker did not return SMAP data."
          : "Configure the NASA ingest worker and Earthdata credentials to retrieve live SMAP data.",
      };
    }
    const smapFetchedAt =
      smapData.source === "NASA_EARTHDATA_LIVE" && existing?.smapData?.source === "NASA_EARTHDATA_LIVE" && smapData === existing.smapData
        ? existing.smapFetchedAt ?? now
        : workerData && smapData.fetchedAt
          ? asDate(smapData.fetchedAt, now)
          : existing?.smapFetchedAt ?? now;
    const soilData = workerData?.soilData ?? existing?.soilData ?? null;
    const fetchedPowerAt = asDate(powerData.fetchedAt, now);
    const powerExpiresAt = new Date(fetchedPowerAt.getTime() + config.powerTtlHours * 3_600_000);
    const smapExpiresAt = new Date(smapFetchedAt.getTime() + config.smapTtlDays * 86_400_000);

    return db.upsertNasaCache(farmId, {
      powerData,
      powerMeanTemp: typeof powerData.meanTemp === "number" ? powerData.meanTemp : null,
      powerTotalPrecip: typeof powerData.totalPrecip === "number" ? powerData.totalPrecip : null,
      powerSolarRad: typeof powerData.meanSolarRad === "number" ? powerData.meanSolarRad : null,
      powerHeatDays: typeof powerData.heatDays === "number" ? powerData.heatDays : null,
      powerFetchedAt,
      powerExpiresAt,
      smapData,
      smapSurface: typeof smapData.smSurface === "number" ? smapData.smSurface : null,
      smapRootzone: typeof smapData.smRootzone === "number" ? smapData.smRootzone : null,
      smapGranuleDate: typeof smapData.smapGranuleDate === "string" ? smapData.smapGranuleDate : null,
      smapFetchedAt,
      smapExpiresAt,
      et0Mean: typeof powerData.et0Mean === "number" ? powerData.et0Mean : null,
      etSource: typeof powerData.etSource === "string" ? powerData.etSource : "UNAVAILABLE",
      soilData,
      isStale:
        powerData.source !== "NASA_POWER_LIVE" ||
        smapData.source !== "NASA_EARTHDATA_LIVE",
    });
  },
};
