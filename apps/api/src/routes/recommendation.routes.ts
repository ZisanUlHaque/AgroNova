import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../storage/db";
import { authenticate, AuthenticatedRequest, verifyFarmOwnership } from "../middlewares/auth";
import { recommendationService } from "../services/recommendationService";

export const recommendationRouter = Router();

const recommendSchema = z.object({
  farmId: z.string().min(1, "Farm ID is required"),
  targetGoal: z.enum(["BALANCED", "CONSERVE_WATER", "RESTORE_NITROGEN"]).optional().default("BALANCED"),
  forceRefresh: z.boolean().optional().default(false),
});

// POST /recommendations - generate 4-year rotation plan
recommendationRouter.post("/", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = recommendSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: parse.error.flatten().fieldErrors,
      });
    }

    const { farmId, targetGoal, forceRefresh } = parse.data;
    const isOwner = await verifyFarmOwnership(req, res, farmId);
    if (!isOwner) return;

    const farm = await db.findFarmById(farmId);
    if (!farm) {
      return res.status(404).json({ success: false, error: "Farm not found" });
    }

    const startTime = Date.now();
    const { result, dataFreshness } = await recommendationService.generateForFarm(
      farm,
      targetGoal,
      forceRefresh
    );
    const executionTimeMs = Date.now() - startTime;

    return res.json({
      success: true,
      executionTimeMs,
      dataFreshness,
      plan: result.recommendedPlan,
      alternativePlan: result.alternativePlan,
      disclaimerEn: result.disclaimerEn,
      disclaimerBn: result.disclaimerBn,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Error generating crop rotation recommendation",
      details: err?.message,
    });
  }
});

// GET /farms/:id/rotations - saved plans for farm
recommendationRouter.get("/farms/:id/rotations", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmId = req.params.id;
    const isOwner = await verifyFarmOwnership(req, res, farmId);
    if (!isOwner) return;

    const rotations = await db.getRotationsByFarmId(farmId);

    return res.json({
      success: true,
      rotations,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Error fetching saved rotations",
      details: err?.message,
    });
  }
});

