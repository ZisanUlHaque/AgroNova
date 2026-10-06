import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  jwtSecret: process.env.JWT_SECRET || "terrashift-dev-secret-key-2026-agronova",
  jwtExpiresIn: "7d" as const,
  bcryptCost: 12,
  databaseUrl: process.env.DATABASE_URL || "postgresql://terrashift:terrashift@localhost:5432/terrashift",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  powerTtlHours: parseInt(process.env.POWER_TTL_HOURS || "24", 10),
  smapTtlDays: parseInt(process.env.SMAP_TTL_DAYS || "7", 10),
  nasaIngestWorkerUrl: process.env.NASA_INGEST_WORKER_URL || "",
  nasaIngestTimeoutMs: parseInt(process.env.NASA_INGEST_TIMEOUT_MS || "120000", 10),
};
