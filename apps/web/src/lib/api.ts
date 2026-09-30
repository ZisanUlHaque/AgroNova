import { offlineDb } from "./offlineDb";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  isOffline?: boolean;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("terrashift_token");
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("terrashift_token", token);
  } else {
    localStorage.removeItem("terrashift_token");
  }
}

export function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("terrashift_user");
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: any | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("terrashift_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("terrashift_user");
  }
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: any }> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (networkError: any) {
    return { ok: false, status: 0, data: { error: "Network connection failed" } };
  }
}

export const api = {
  async register(phone: string, fullName: string, password: string) {
    const res = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ phone, fullName, password }),
    });

    if (res.ok && res.data.token) {
      setStoredToken(res.data.token);
      setStoredUser(res.data.user);
    }
    return res;
  },

  async login(phone: string, password: string) {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });

    if (res.ok && res.data.token) {
      setStoredToken(res.data.token);
      setStoredUser(res.data.user);
    }
    return res;
  },

  async getFarms(isSimulatedOffline: boolean = false) {
    if (isSimulatedOffline) {
      const localFarms = await offlineDb.getFarms();
      return { ok: true, status: 200, data: { success: true, farms: localFarms }, isOffline: true };
    }

    const res = await request("/farms", { method: "GET" });
    if (res.ok && res.data.farms) {
      // cache in IndexedDB
      for (const farm of res.data.farms) {
        await offlineDb.saveFarm(farm);
      }
      return { ...res, isOffline: false };
    }

    // Network failed -> return local IndexedDB
    const localFarms = await offlineDb.getFarms();
    return { ok: true, status: 200, data: { success: true, farms: localFarms }, isOffline: true };
  },

  async createFarm(farmData: { name: string; lat: number; lon: number; areaHectares: number; soilTexture?: string; soilPh?: number }, isSimulatedOffline: boolean = false) {
    if (isSimulatedOffline) {
      const offlineId = "offline_farm_" + Date.now();
      const localFarm = {
        id: offlineId,
        userId: "local_user",
        name: farmData.name,
        latitude: farmData.lat,
        longitude: farmData.lon,
        areaHectares: farmData.areaHectares,
        soilTexture: farmData.soilTexture,
        soilPh: farmData.soilPh,
        soilSource: farmData.soilPh != null ? "MEASURED" : "ESTIMATED",
        updatedAt: new Date().toISOString(),
      };
      await offlineDb.saveFarm(localFarm);
      await offlineDb.queuePendingAction("createFarm", farmData);
      return { ok: true, status: 201, data: { success: true, farm: localFarm }, isOffline: true };
    }

    const res = await request("/farms", {
      method: "POST",
      body: JSON.stringify(farmData),
    });

    if (res.ok && res.data.farm) {
      await offlineDb.saveFarm(res.data.farm);
    }
    return res;
  },

  async getFarmDetails(farmId: string, isSimulatedOffline: boolean = false) {
    if (isSimulatedOffline) {
      const cachedNasa = await offlineDb.getNasaContext(farmId);
      const farms = await offlineDb.getFarms();
      const farm = farms.find((f) => f.id === farmId);
      return {
        ok: true,
        status: 200,
        data: { success: true, farm, nasaContext: cachedNasa },
        isOffline: true,
      };
    }

    const res = await request(`/farms/${farmId}`, { method: "GET" });
    if (res.ok && res.data.nasaContext) {
      await offlineDb.saveNasaContext(farmId, res.data.nasaContext);
    }
    return res;
  },

  async getRecommendation(farmId: string, targetGoal: string = "BALANCED", forceRefresh: boolean = false, isSimulatedOffline: boolean = false) {
    if (isSimulatedOffline) {
      const saved = await offlineDb.getPlan(farmId);
      if (saved) {
        return {
          ok: true,
          status: 200,
          data: {
            success: true,
            plan: saved.plan,
            alternativePlan: saved.alternativePlan,
            dataFreshness: saved.dataFreshness,
          },
          isOffline: true,
        };
      }
      return {
        ok: false,
        status: 408,
        data: {
          error: "You are offline and no saved plan exists yet for this farm. Connect to internet to calculate a new plan.",
        },
        isOffline: true,
      };
    }

    const res = await request("/recommendations", {
      method: "POST",
      body: JSON.stringify({ farmId, targetGoal, forceRefresh }),
    });

    if (res.ok && res.data.plan) {
      // Save to IndexedDB for offline access
      await offlineDb.savePlan(farmId, targetGoal, res.data.plan, res.data.alternativePlan, res.data.dataFreshness);
    } else if (!res.ok) {
      // If network fails, check IndexedDB fallback
      const saved = await offlineDb.getPlan(farmId);
      if (saved) {
        return {
          ok: true,
          status: 200,
          data: {
            success: true,
            plan: saved.plan,
            alternativePlan: saved.alternativePlan,
            dataFreshness: saved.dataFreshness,
          },
          isOffline: true,
        };
      }
    }

    return res;
  },

  async syncPendingQueue() {
    const queue = await offlineDb.getPendingActions();
    if (queue.length === 0) return;

    for (const item of queue) {
      if (item.action === "createFarm") {
        await request("/farms", { method: "POST", body: JSON.stringify(item.payload) });
      }
    }
    await offlineDb.clearPendingQueue();
  },
};
