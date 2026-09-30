import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { db } from "../storage/db";

export interface AuthUser {
  userId: string;
  phone: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Bearer token missing.",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as any;
    req.user = {
      userId: payload.userId,
      phone: payload.phone,
      role: payload.role || "farmer",
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired authorization token.",
    });
  }
}

export async function verifyFarmOwnership(
  req: AuthenticatedRequest,
  res: Response,
  farmId: string
): Promise<boolean> {
  const farm = await db.findFarmById(farmId);
  if (!farm) {
    res.status(404).json({
      success: false,
      error: "Farm not found.",
    });
    return false;
  }

  if (farm.userId !== req.user?.userId && req.user?.role !== "extension_officer") {
    res.status(403).json({
      success: false,
      error: "Access denied. You do not own this farm.",
    });
    return false;
  }

  return true;
}

