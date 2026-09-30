import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  jwtSecret: process.env.JWT_SECRET || "terrashift-dev-secret-key-2026-agronova",
  jwtExpiresIn: "7d",
  bcryptCost: 12,
  databaseUrl: process.env.DATABASE_URL || "postgresql://terrashift:terrashift@localhost:5432/terrashift",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  powerTtlHours: parseInt(process.env.POWER_TTL_HOURS || "24", 10),
  smapTtlDays: parseInt(process.env.SMAP_TTL_DAYS || "7", 10),
  earthdataUsername: process.env.EARTHDATA_USERNAME || "",
  earthdataPassword: process.env.EARTHDATA_PASSWORD || "",
};
