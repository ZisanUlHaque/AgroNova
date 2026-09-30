import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../storage/db";
import { authenticate, AuthenticatedRequest, verifyFarmOwnership } from "../middlewares/auth";
import { nasaService } from "../services/nasaService";

export const farmRouter = Router();

const createFarmSchema = z.object({
  name: z.string().min(2, "Farm name must be at least 2 characters"),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  areaHectares: z.number().positive("Area in hectares must be positive"),
  soilTexture: z.string().optional(),
  soilPh: z.number().min(3).max(10).optional(),
});

const updateSoilSchema = z.object({
  soilTexture: z.string().optional(),
  soilPh: z.number().min(3).max(10).optional(),
  soilSource: z.enum(["ESTIMATED", "MEASURED", "DEFAULT"]).optional().default("MEASURED"),
});

// POST /farms - create farm + trigger NASA ingest
farmRouter.post("/", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = createFarmSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: parse.error.flatten().fieldErrors,
      });
    }

    const { name, lat, lon, areaHectares, soilTexture, soilPh } = parse.data;
    const userId = req.user!.userId;

    const farm = await db.createFarm({
      userId,
      name,
      latitude: lat,
      longitude: lon,
      areaHectares,
      soilTexture,
      soilPh,
      soilSource: soilPh != null ? "MEASURED" : "ESTIMATED",
    });

    // Ingest NASA climate & soil moisture
    let nasaCache = null;
    try {
      nasaCache = await nasaService.ingestForFarm(farm.id, farm.latitude, farm.longitude);
    } catch (ingestErr) {
      console.warn("Background NASA ingest delayed:", ingestErr);
    }

    return res.status(201).json({
      success: true,
      message: "Farm created successfully.",
      farm: {
        ...farm,
        nasaCache: nasaCache || null,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Internal server error creating farm",
      details: err?.message,
    });
  }
});

// GET /farms - own farms
farmRouter.get("/", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const farms = await db.findFarmsByUserId(userId);

    const farmsWithNasa = await Promise.all(
      farms.map(async (f) => {
        const cache = await db.getNasaCache(f.id);
        return {
          ...f,
          nasaCache: cache ? {
            powerMeanTemp: cache.powerMeanTemp,
            powerTotalPrecip: cache.powerTotalPrecip,
            smapRootzone: cache.smapRootzone,
            et0Mean: cache.et0Mean,
            smapGranuleDate: cache.smapGranuleDate,
            isFresh: nasaService.isCacheFresh(cache),
          } : null,
        };
      })
    );

    return res.json({
      success: true,
      farms: farmsWithNasa,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Error retrieving farms",
      details: err?.message,
    });
  }
});

// GET /farms/:id - farm + full NASA context
farmRouter.get("/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmId = req.params.id;
    const isOwner = await verifyFarmOwnership(req, res, farmId);
    if (!isOwner) return;

    const farm = await db.findFarmById(farmId);
    let cache = await db.getNasaCache(farmId);

    if (!cache) {
      cache = await nasaService.ingestForFarm(farmId, farm!.latitude, farm!.longitude);
    }

    return res.json({
      success: true,
      farm,
      nasaContext: cache,
      dataDisclaimer: "SMAP 9 km provides regional context, not field truth.",
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Error fetching farm details",
      details: err?.message,
    });
  }
});

// PATCH /farms/:id - update soil inputs
farmRouter.patch("/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmId = req.params.id;
    const isOwner = await verifyFarmOwnership(req, res, farmId);
    if (!isOwner) return;

    const parse = updateSoilSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: parse.error.flatten().fieldErrors,
      });
    }

    const updated = await db.updateFarm(farmId, {
      soilTexture: parse.data.soilTexture,
      soilPh: parse.data.soilPh,
      soilSource: parse.data.soilSource || "MEASURED",
    });

    return res.json({
      success: true,
      message: "Soil parameters updated successfully.",
      farm: updated,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Error updating soil inputs",
      details: err?.message,
    });
  }
});

// POST /farms/:id/refresh - force refresh NASA cache
farmRouter.post("/:id/refresh", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmId = req.params.id;
    const isOwner = await verifyFarmOwnership(req, res, farmId);
    if (!isOwner) return;

    const farm = await db.findFarmById(farmId);
    const refreshedCache = await nasaService.ingestForFarm(farmId, farm!.latitude, farm!.longitude, true);

    return res.json({
      success: true,
      message: "NASA satellite cache refreshed successfully.",
      nasaContext: refreshedCache,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Error refreshing NASA cache",
      details: err?.message,
    });
  }
});

// DELETE /farms/:id - delete farm
farmRouter.delete("/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmId = req.params.id;
    const isOwner = await verifyFarmOwnership(req, res, farmId);
    if (!isOwner) return;

    await db.deleteFarm(farmId);
    return res.json({
      success: true,
      message: "Farm deleted successfully.",
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Error deleting farm",
      details: err?.message,
    });
  }
});

