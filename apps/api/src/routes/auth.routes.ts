import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../storage/db.js";
import { config } from "../config.js";
import { authRateLimiter } from "../middlewares/rateLimiter.js";
import { authenticate, AuthenticatedRequest } from "../middlewares/auth.js";

export const authRouter = Router();

const registerSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 characters").max(15),
  fullName: z.string().min(2, "Full name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["farmer", "extension_officer"]).optional().default("farmer"),
});

const loginSchema = z.object({
  phone: z.string().min(5, "Phone is required"),
  password: z.string().min(1, "Password is required"),
});

// POST /auth/register
authRouter.post("/register", authRateLimiter, async (req: Request, res: Response) => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: parse.error.flatten().fieldErrors,
      });
    }

    const { phone, fullName, password, role } = parse.data;

    const existing = await db.findUserByPhone(phone);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "A user with this phone number already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptCost);
    const user = await db.createUser({
      phone,
      fullName,
      passwordHash,
      role,
    });

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
      },
      token,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Internal server error during registration",
      details: err?.message,
    });
  }
});

// POST /auth/login
authRouter.post("/login", authRateLimiter, async (req: Request, res: Response) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: parse.error.flatten().fieldErrors,
      });
    }

    const { phone, password } = parse.data;
    const user = await db.findUserByPhone(phone);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid phone number or password.",
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid phone number or password.",
      });
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
      },
      token,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Internal server error during login",
      details: err?.message,
    });
  }
});

// GET /auth/me
authRouter.get("/me", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Unauthorized" });

  const user = await db.findUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
    },
  });
});
