-- Enable PostGIS extension as required by PRD Section 8
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'farmer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "areaHectares" DOUBLE PRECISION NOT NULL,
    "soilTexture" TEXT,
    "soilPh" DOUBLE PRECISION,
    "soilSource" TEXT NOT NULL DEFAULT 'ESTIMATED',
    "boundary" geometry(Polygon, 4326),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nasa_cache" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "powerData" JSONB,
    "powerMeanTemp" DOUBLE PRECISION,
    "powerTotalPrecip" DOUBLE PRECISION,
    "powerSolarRad" DOUBLE PRECISION,
    "powerHeatDays" INTEGER,
    "powerFetchedAt" TIMESTAMP(3),
    "powerExpiresAt" TIMESTAMP(3),
    "smapSurface" DOUBLE PRECISION,
    "smapRootzone" DOUBLE PRECISION,
    "smapGranuleDate" TEXT,
    "smapFetchedAt" TIMESTAMP(3),
    "smapExpiresAt" TIMESTAMP(3),
    "et0Mean" DOUBLE PRECISION,
    "etSource" TEXT DEFAULT 'FAO56-PM-from-POWER',
    "soilData" JSONB,
    "isStale" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nasa_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_rotations" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "targetGoal" TEXT NOT NULL DEFAULT 'BALANCED',
    "confidence" TEXT NOT NULL,
    "seasons" JSONB NOT NULL,
    "alternativePlan" JSONB,
    "inputsUsed" JSONB NOT NULL,
    "waterSavingsRange" TEXT,
    "nitrogenGainRange" TEXT,
    "engineVersion" TEXT NOT NULL DEFAULT '3.0.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_rotations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "farms_latitude_longitude_idx" ON "farms"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "nasa_cache_farmId_key" ON "nasa_cache"("farmId");

-- CreateIndex
CREATE INDEX "crop_rotations_farmId_idx" ON "crop_rotations"("farmId");

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nasa_cache" ADD CONSTRAINT "nasa_cache_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_rotations" ADD CONSTRAINT "crop_rotations_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
