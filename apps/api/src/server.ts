import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { authRouter } from "./routes/auth.routes";
import { farmRouter } from "./routes/farm.routes";
import { recommendationRouter } from "./routes/recommendation.routes";
import { apiRateLimiter } from "./middlewares/rateLimiter";
import { db } from "./storage/db";

export const app = express();

// Security and standard middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(apiRateLimiter);

// Liveness & health check
app.get("/api/v1/health", async (req: Request, res: Response) => {
  const isDbConnected = await db.checkConnection();
  return res.json({
    status: "ok",
    service: "TerraShift API",
    version: "3.0.0",
    database: isDbConnected ? "PostgreSQL/PostGIS" : "In-Memory Store (Resilient Fallback)",
    timestamp: new Date().toISOString(),
  });
});

// Mount API v1 Routers
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/farms", farmRouter);
app.use("/api/v1/recommendations", recommendationRouter);
app.use("/api/v1", recommendationRouter); // Also handles /api/v1/farms/:id/rotations

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.url}`,
  });
});

// Centralized error handler adhering to PRD error shape
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled API Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(config.port, () => {
    console.log(`\n🌱 TerraShift API server listening on http://localhost:${config.port}/api/v1`);
    console.log(`📊 Health check: http://localhost:${config.port}/api/v1/health\n`);
  });
}

