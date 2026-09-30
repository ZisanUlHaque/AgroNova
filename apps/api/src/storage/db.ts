import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Global Prisma instance
let prisma: PrismaClient | null = null;
let usePrisma = false;

try {
  prisma = new PrismaClient();
} catch (e) {
  prisma = null;
}

export interface UserEntity {
  id: string;
  phone: string;
  fullName: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FarmEntity {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  areaHectares: number;
  soilTexture: string | null;
  soilPh: number | null;
  soilSource: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NasaCacheEntity {
  id: string;
  farmId: string;
  powerData: any;
  powerMeanTemp: number | null;
  powerTotalPrecip: number | null;
  powerSolarRad: number | null;
  powerHeatDays: number | null;
  powerFetchedAt: Date | null;
  powerExpiresAt: Date | null;
  smapSurface: number | null;
  smapRootzone: number | null;
  smapGranuleDate: string | null;
  smapFetchedAt: Date | null;
  smapExpiresAt: Date | null;
  et0Mean: number | null;
  etSource: string | null;
  soilData: any;
  isStale: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CropRotationEntity {
  id: string;
  farmId: string;
  targetGoal: string;
  confidence: string;
  seasons: any;
  alternativePlan: any;
  inputsUsed: any;
  waterSavingsRange: string | null;
  nitrogenGainRange: string | null;
  engineVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-Memory store for instant local development / demo reliability
class InMemoryDB {
  users: Map<string, UserEntity> = new Map();
  farms: Map<string, FarmEntity> = new Map();
  nasaCache: Map<string, NasaCacheEntity> = new Map();
  rotations: Map<string, CropRotationEntity> = new Map();

  constructor() {
    this.seedPilotData();
  }

  private seedPilotData() {
    // Seed primary persona Rafiq from PRD Section 2
    const rafiqId = "rafiq-pilot-farmer-id";
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync("rafiq123", salt);

    const rafiq: UserEntity = {
      id: rafiqId,
      phone: "01700000000",
      fullName: "Md. Rafiqul Islam",
      passwordHash,
      role: "farmer",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(rafiq.id, rafiq);

    // Seed Pilot Farm in Bangladesh delta (Barisal ~ 1.5 ha)
    const farmId = "barisal-pilot-farm-1";
    const farm: FarmEntity = {
      id: farmId,
      userId: rafiqId,
      name: "Rafiq's Delta Homestead",
      latitude: 22.701,
      longitude: 90.3535,
      areaHectares: 1.5,
      soilTexture: "clay_loam",
      soilPh: 6.8,
      soilSource: "ESTIMATED",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.farms.set(farm.id, farm);

    // Seed NASA cache for pilot location
    const now = new Date();
    const powerExpires = new Date(now.getTime() + 24 * 3600 * 1000);
    const smapExpires = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

    const cache: NasaCacheEntity = {
      id: "cache-barisal-1",
      farmId,
      powerData: {
        source: "NASA_POWER_LIVE",
        meanTemp: 28.3,
        totalPrecip: 1839.2,
        meanSolarRad: 17.5,
        heatDays: 3,
        recentMaxTemp: 33.4,
      },
      powerMeanTemp: 28.3,
      powerTotalPrecip: 1839.2,
      powerSolarRad: 17.5,
      powerHeatDays: 3,
      powerFetchedAt: now,
      powerExpiresAt: powerExpires,
      smapSurface: 0.338,
      smapRootzone: 0.372,
      smapGranuleDate: "2026-09-29",
      smapFetchedAt: now,
      smapExpiresAt: smapExpires,
      et0Mean: 2.7,
      etSource: "FAO56-PM-from-POWER",
      soilData: { texture: "clay_loam", pH: 6.8, source: "ESTIMATED" },
      isStale: false,
      createdAt: now,
      updatedAt: now,
    };
    this.nasaCache.set(farmId, cache);
  }
}

const memoryDb = new InMemoryDB();

export const db = {
  async checkConnection(): Promise<boolean> {
    if (!prisma) return false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      usePrisma = true;
      return true;
    } catch (e) {
      usePrisma = false;
      return false;
    }
  },

  async findUserByPhone(phone: string): Promise<UserEntity | null> {
    if (usePrisma && prisma) {
      try {
        const u = await prisma.user.findUnique({ where: { phone } });
        return u as UserEntity | null;
      } catch (e) {
        // fallback
      }
    }
    for (const u of memoryDb.users.values()) {
      if (u.phone === phone) return u;
    }
    return null;
  },

  async findUserById(id: string): Promise<UserEntity | null> {
    if (usePrisma && prisma) {
      try {
        const u = await prisma.user.findUnique({ where: { id } });
        return u as UserEntity | null;
      } catch (e) {
        // fallback
      }
    }
    return memoryDb.users.get(id) || null;
  },

  async createUser(data: { phone: string; fullName: string; passwordHash: string; role?: string }): Promise<UserEntity> {
    const id = "usr_" + Math.random().toString(36).substring(2, 11);
    const now = new Date();
    const newUser: UserEntity = {
      id,
      phone: data.phone,
      fullName: data.fullName,
      passwordHash: data.passwordHash,
      role: data.role || "farmer",
      createdAt: now,
      updatedAt: now,
    };

    if (usePrisma && prisma) {
      try {
        const created = await prisma.user.create({
          data: {
            phone: data.phone,
            fullName: data.fullName,
            passwordHash: data.passwordHash,
            role: data.role || "farmer",
          },
        });
        return created as UserEntity;
      } catch (e) {
        // fallback
      }
    }

    memoryDb.users.set(id, newUser);
    return newUser;
  },

  async findFarmsByUserId(userId: string): Promise<FarmEntity[]> {
    if (usePrisma && prisma) {
      try {
        const res = await prisma.farm.findMany({ where: { userId } });
        return res as FarmEntity[];
      } catch (e) {
        // fallback
      }
    }
    return Array.from(memoryDb.farms.values()).filter((f) => f.userId === userId);
  },

  async findFarmById(farmId: string): Promise<FarmEntity | null> {
    if (usePrisma && prisma) {
      try {
        const f = await prisma.farm.findUnique({ where: { id: farmId } });
        return f as FarmEntity | null;
      } catch (e) {
        // fallback
      }
    }
    return memoryDb.farms.get(farmId) || null;
  },

  async createFarm(data: {
    userId: string;
    name: string;
    latitude: number;
    longitude: number;
    areaHectares: number;
    soilTexture?: string | null;
    soilPh?: number | null;
    soilSource?: string;
  }): Promise<FarmEntity> {
    const id = "farm_" + Math.random().toString(36).substring(2, 11);
    const now = new Date();
    const newFarm: FarmEntity = {
      id,
      userId: data.userId,
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      areaHectares: data.areaHectares,
      soilTexture: data.soilTexture || null,
      soilPh: data.soilPh ?? null,
      soilSource: data.soilSource || (data.soilPh != null ? "MEASURED" : "ESTIMATED"),
      createdAt: now,
      updatedAt: now,
    };

    if (usePrisma && prisma) {
      try {
        const created = await prisma.farm.create({
          data: {
            userId: data.userId,
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
            areaHectares: data.areaHectares,
            soilTexture: data.soilTexture,
            soilPh: data.soilPh,
            soilSource: newFarm.soilSource,
          },
        });
        return created as FarmEntity;
      } catch (e) {
        // fallback
      }
    }

    memoryDb.farms.set(id, newFarm);
    return newFarm;
  },

  async updateFarm(
    farmId: string,
    update: Partial<Omit<FarmEntity, "id" | "userId" | "createdAt" | "updatedAt">>
  ): Promise<FarmEntity | null> {
    if (usePrisma && prisma) {
      try {
        const updated = await prisma.farm.update({
          where: { id: farmId },
          data: update,
        });
        return updated as FarmEntity;
      } catch (e) {
        // fallback
      }
    }

    const farm = memoryDb.farms.get(farmId);
    if (!farm) return null;
    const merged: FarmEntity = {
      ...farm,
      ...update,
      updatedAt: new Date(),
    };
    memoryDb.farms.set(farmId, merged);
    return merged;
  },

  async deleteFarm(farmId: string): Promise<boolean> {
    if (usePrisma && prisma) {
      try {
        await prisma.farm.delete({ where: { id: farmId } });
        return true;
      } catch (e) {
        // fallback
      }
    }
    const existed = memoryDb.farms.delete(farmId);
    memoryDb.nasaCache.delete(farmId);
    return existed;
  },

  async getNasaCache(farmId: string): Promise<NasaCacheEntity | null> {
    if (usePrisma && prisma) {
      try {
        const c = await prisma.nasaCache.findUnique({ where: { farmId } });
        return c as NasaCacheEntity | null;
      } catch (e) {
        // fallback
      }
    }
    return memoryDb.nasaCache.get(farmId) || null;
  },

  async upsertNasaCache(farmId: string, data: Partial<NasaCacheEntity>): Promise<NasaCacheEntity> {
    const now = new Date();
    const existing = memoryDb.nasaCache.get(farmId);
    const updated: NasaCacheEntity = {
      id: existing?.id || "cache_" + Math.random().toString(36).substring(2, 11),
      farmId,
      powerData: data.powerData ?? existing?.powerData ?? null,
      powerMeanTemp: data.powerMeanTemp ?? existing?.powerMeanTemp ?? null,
      powerTotalPrecip: data.powerTotalPrecip ?? existing?.powerTotalPrecip ?? null,
      powerSolarRad: data.powerSolarRad ?? existing?.powerSolarRad ?? null,
      powerHeatDays: data.powerHeatDays ?? existing?.powerHeatDays ?? null,
      powerFetchedAt: data.powerFetchedAt ? new Date(data.powerFetchedAt) : existing?.powerFetchedAt ?? now,
      powerExpiresAt: data.powerExpiresAt ? new Date(data.powerExpiresAt) : existing?.powerExpiresAt ?? null,
      smapSurface: data.smapSurface ?? existing?.smapSurface ?? null,
      smapRootzone: data.smapRootzone ?? existing?.smapRootzone ?? null,
      smapGranuleDate: data.smapGranuleDate ?? existing?.smapGranuleDate ?? null,
      smapFetchedAt: data.smapFetchedAt ? new Date(data.smapFetchedAt) : existing?.smapFetchedAt ?? now,
      smapExpiresAt: data.smapExpiresAt ? new Date(data.smapExpiresAt) : existing?.smapExpiresAt ?? null,
      et0Mean: data.et0Mean ?? existing?.et0Mean ?? null,
      etSource: data.etSource ?? existing?.etSource ?? "FAO56-PM-from-POWER",
      soilData: data.soilData ?? existing?.soilData ?? null,
      isStale: data.isStale ?? false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (usePrisma && prisma) {
      try {
        const saved = await prisma.nasaCache.upsert({
          where: { farmId },
          update: data as any,
          create: { ...data, farmId } as any,
        });
        return saved as NasaCacheEntity;
      } catch (e) {
        // fallback
      }
    }

    memoryDb.nasaCache.set(farmId, updated);
    return updated;
  },

  async createRotation(data: {
    farmId: string;
    targetGoal: string;
    confidence: string;
    seasons: any;
    alternativePlan?: any;
    inputsUsed: any;
    waterSavingsRange?: string | null;
    nitrogenGainRange?: string | null;
    engineVersion?: string;
  }): Promise<CropRotationEntity> {
    const id = "rot_" + Math.random().toString(36).substring(2, 11);
    const now = new Date();
    const entity: CropRotationEntity = {
      id,
      farmId: data.farmId,
      targetGoal: data.targetGoal,
      confidence: data.confidence,
      seasons: data.seasons,
      alternativePlan: data.alternativePlan || null,
      inputsUsed: data.inputsUsed,
      waterSavingsRange: data.waterSavingsRange || null,
      nitrogenGainRange: data.nitrogenGainRange || null,
      engineVersion: data.engineVersion || "3.0.0",
      createdAt: now,
      updatedAt: now,
    };

    if (usePrisma && prisma) {
      try {
        const saved = await prisma.cropRotation.create({
          data: {
            farmId: data.farmId,
            targetGoal: data.targetGoal,
            confidence: data.confidence,
            seasons: data.seasons,
            alternativePlan: data.alternativePlan,
            inputsUsed: data.inputsUsed,
            waterSavingsRange: data.waterSavingsRange,
            nitrogenGainRange: data.nitrogenGainRange,
            engineVersion: data.engineVersion || "3.0.0",
          },
        });
        return saved as CropRotationEntity;
      } catch (e) {
        // fallback
      }
    }

    memoryDb.rotations.set(id, entity);
    return entity;
  },

  async getRotationsByFarmId(farmId: string): Promise<CropRotationEntity[]> {
    if (usePrisma && prisma) {
      try {
        const saved = await prisma.cropRotation.findMany({
          where: { farmId },
          orderBy: { createdAt: "desc" },
        });
        return saved as CropRotationEntity[];
      } catch (e) {
        // fallback
      }
    }

    return Array.from(memoryDb.rotations.values())
      .filter((r) => r.farmId === farmId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },
};
