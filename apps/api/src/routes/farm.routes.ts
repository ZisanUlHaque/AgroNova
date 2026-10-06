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
  soilTexture: z.string().nullable().optional(),
  soilPh: z.number().min(3).max(10).nullable().optional(),
});

const updateFarmSchema = z.object({
  name: z.string().min(2).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  areaHectares: z.number().positive().optional(),
  soilTexture: z.string().nullable().optional(),
  soilPh: z.number().min(3).max(10).nullable().optional(),
  soilSource: z.enum(["ESTIMATED", "MEASURED", "DEFAULT", "MIXED"]).optional(),
});

// POST /farms - persist farm metadata; recommendations trigger NASA ingestion
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
      soilSource:
        soilTexture != null && soilPh != null
          ? "MEASURED"
          : soilTexture != null || soilPh != null
            ? "MIXED"
            : "ESTIMATED",
    });

    return res.status(201).json({
      success: true,
      message: "Farm created successfully. NASA data will be fetched when a recommendation is requested.",
      farm,
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

    const parse = updateFarmSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: parse.error.flatten().fieldErrors,
      });
    }

    const update: Parameters<typeof db.updateFarm>[1] = {};
    if (parse.data.name !== undefined) update.name = parse.data.name;
    if (parse.data.lat !== undefined) update.latitude = parse.data.lat;
    if (parse.data.lon !== undefined) update.longitude = parse.data.lon;
    if (parse.data.areaHectares !== undefined) update.areaHectares = parse.data.areaHectares;
    if (parse.data.soilTexture !== undefined) update.soilTexture = parse.data.soilTexture;
    if (parse.data.soilPh !== undefined) update.soilPh = parse.data.soilPh;
    if (parse.data.soilSource !== undefined) update.soilSource = parse.data.soilSource;
    if (parse.data.soilTexture !== undefined || parse.data.soilPh !== undefined) {
      update.soilSource =
        parse.data.soilTexture != null && parse.data.soilPh != null
          ? "MEASURED"
          : parse.data.soilTexture != null || parse.data.soilPh != null
            ? "MIXED"
            : "ESTIMATED";
    }

    const updated = await db.updateFarm(farmId, update);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Farm not found." });
    }

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
