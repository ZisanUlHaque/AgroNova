import { openDB, DBSchema, IDBPDatabase } from "idb";

interface TerraShiftDB extends DBSchema {
  farms: {
    key: string;
    value: {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      areaHectares: number;
      soilTexture?: string | null;
      soilPh?: number | null;
      soilSource?: string;
      updatedAt: string;
    };
  };
  plans: {
    key: string;
    value: {
      farmId: string;
      targetGoal: string;
      plan: any;
      alternativePlan: any;
      dataFreshness: any;
      savedAt: string;
    };
  };
  nasaContext: {
    key: string;
    value: {
      farmId: string;
      data: any;
      cachedAt: string;
    };
  };
  pendingQueue: {
    key: number;
    value: {
      action: string;
      payload: any;
      queuedAt: string;
    };
    autoIncrement: true;
  };
}

const DB_NAME = "terrashift_offline_db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TerraShiftDB>> | null = null;

function getDb(): Promise<IDBPDatabase<TerraShiftDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is only available in browser"));
  }
  if (!dbPromise) {
    dbPromise = openDB<TerraShiftDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("farms")) {
          db.createObjectStore("farms", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("plans")) {
          db.createObjectStore("plans", { keyPath: "farmId" });
        }
        if (!db.objectStoreNames.contains("nasaContext")) {
          db.createObjectStore("nasaContext", { keyPath: "farmId" });
        }
        if (!db.objectStoreNames.contains("pendingQueue")) {
          db.createObjectStore("pendingQueue", { keyPath: "id", autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export const offlineDb = {
  async saveFarm(farm: any) {
    try {
      const db = await getDb();
      await db.put("farms", {
        id: farm.id,
        name: farm.name,
        latitude: farm.latitude,
        longitude: farm.longitude,
        areaHectares: farm.areaHectares,
        soilTexture: farm.soilTexture,
        soilPh: farm.soilPh,
        soilSource: farm.soilSource,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Error saving farm to IndexedDB:", e);
    }
  },

  async getFarms() {
    try {
      const db = await getDb();
      return await db.getAll("farms");
    } catch (e) {
      return [];
    }
  },

  async savePlan(farmId: string, targetGoal: string, plan: any, alternativePlan: any, dataFreshness: any) {
    try {
      const db = await getDb();
      await db.put("plans", {
        farmId,
        targetGoal,
        plan,
        alternativePlan,
        dataFreshness,
        savedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Error saving plan to IndexedDB:", e);
    }
  },

  async getPlan(farmId: string) {
    try {
      const db = await getDb();
      return await db.get("plans", farmId);
    } catch (e) {
      return null;
    }
  },

  async saveNasaContext(farmId: string, data: any) {
    try {
      const db = await getDb();
      await db.put("nasaContext", {
        farmId,
        data,
        cachedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Error saving NASA context to IndexedDB:", e);
    }
  },

  async getNasaContext(farmId: string) {
    try {
      const db = await getDb();
      const res = await db.get("nasaContext", farmId);
      return res ? res.data : null;
    } catch (e) {
      return null;
    }
  },

  async queuePendingAction(action: string, payload: any) {
    try {
      const db = await getDb();
      await db.add("pendingQueue", {
        action,
        payload,
        queuedAt: new Date().toISOString(),
      } as any);
    } catch (e) {
      console.warn("Error queuing pending action:", e);
    }
  },

  async getPendingActions() {
    try {
      const db = await getDb();
      return await db.getAll("pendingQueue");
    } catch (e) {
      return [];
    }
  },

  async clearPendingQueue() {
    try {
      const db = await getDb();
      await db.clear("pendingQueue");
    } catch (e) {
      console.warn("Error clearing pending queue:", e);
    }
  },
};
