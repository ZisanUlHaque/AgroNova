"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Language, translations } from "../lib/translations";
import { Header } from "./Header";
import { MapPicker } from "./MapPicker";
import { PlanView } from "./PlanView";
import { NasaContextModal } from "./NasaContextModal";
import { AuthModal } from "./AuthModal";
import { api, getStoredUser, setStoredToken, setStoredUser } from "../lib/api";
import { offlineDb } from "../lib/offlineDb";
import {
  Sparkles,
  WifiOff,
  Layers,
  RotateCw,
  CloudSun,
  Droplets,
  ThermometerSun,
  MapPin,
  PencilLine,
  Leaf,
  ArrowUpRight,
  AlertTriangle,
  Activity,
  Sprout,
  LayoutDashboard,
  Map,
  BarChart3,
  FlaskConical,
  Settings2,
} from "lucide-react";

export default function Home() {
  const [language, setLanguage] = useState<Language>("bn");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [fontScale, setFontScale] = useState<number>(1.0);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);

  // Auth & User
  const [user, setUser] = useState<any>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Farm & Coordinates (Default to Rafiq's Barisal Delta Farm)
  const [latitude, setLatitude] = useState(22.701);
  const [longitude, setLongitude] = useState(90.3535);
  const [farmName, setFarmName] = useState("রফিক-এর খামার (বরিশাল)");
  const [fieldSize, setFieldSize] = useState(1.5);
  const [soilTexture, setSoilTexture] = useState("");
  const [soilPh, setSoilPh] = useState<number | undefined>();
  const [plannedCrop, setPlannedCrop] = useState("");
  const [season, setSeason] = useState(() => {
    const month = new Date().getMonth() + 1;
    return month >= 11 || month <= 2 ? "Rabi" : month <= 6 ? "Kharif-1" : "Kharif-2";
  });
  const [irrigationMethod, setIrrigationMethod] = useState("");
  const [waterSource, setWaterSource] = useState("");

  // Plan & NASA State
  const [currentGoal, setCurrentGoal] = useState("BALANCED");
  const [plan, setPlan] = useState<any>(null);
  const [alternativePlan, setAlternativePlan] = useState<any>(null);
  const [nasaContext, setNasaContext] = useState<any>(null);
  const [dataFreshness, setDataFreshness] = useState<any>(null);
  const restoredUserIdRef = useRef<string | null>(null);
  const [isNasaModalOpen, setIsNasaModalOpen] = useState(false);
  const [isSavedOffline, setIsSavedOffline] = useState(false);

  // Status & Progress
  const [loading, setLoading] = useState(false);
  const [ingestStep, setIngestStep] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const t = translations[language];

  const restoreFarm = useCallback(async (userId: string) => {
    const savedFarmId = localStorage.getItem(`terrashift_farm_id_${userId}`);
    try {
      const farmResponse = await api.getFarms();
      const farms = farmResponse.data?.farms || [];
      const selectedFarm = farms.find((farm: any) => farm.id === savedFarmId) || farms[0];
      if (!selectedFarm) return;

      setSelectedFarmId(selectedFarm.id);
      localStorage.setItem(`terrashift_farm_id_${userId}`, selectedFarm.id);
      setFarmName(selectedFarm.name);
      setLatitude(selectedFarm.latitude);
      setLongitude(selectedFarm.longitude);
      setFieldSize(selectedFarm.areaHectares);
      setSoilTexture(selectedFarm.soilTexture || "");
      setSoilPh(selectedFarm.soilPh ?? undefined);

      const profile = JSON.parse(localStorage.getItem(`terrashift_farm_profile_${selectedFarm.id}`) || "{}");
      setPlannedCrop(profile.plannedCrop || "");
      setSeason((current) => profile.season || current);
      setIrrigationMethod(profile.irrigationMethod || "");
      setWaterSource(profile.waterSource || "");
      setCurrentGoal(profile.currentGoal || "BALANCED");

      const [cachedPlan, cachedContext] = await Promise.all([
        offlineDb.getPlan(selectedFarm.id),
        offlineDb.getNasaContext(selectedFarm.id),
      ]);
      if (cachedPlan) {
        setPlan(cachedPlan.plan);
        setAlternativePlan(cachedPlan.alternativePlan);
        setDataFreshness(cachedPlan.dataFreshness);
        setIsSavedOffline(true);
      }
      if (cachedContext) setNasaContext(cachedContext);
    } catch (error) {
      setStatusMessage(
        language === "bn"
          ? `সংরক্ষিত খামার লোড করা যায়নি: ${error instanceof Error ? error.message : "অজানা সমস্যা"}`
          : `Could not load the saved farm: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }, [language]);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored && restoredUserIdRef.current !== stored.id) {
      restoredUserIdRef.current = stored.id;
      setUser(stored);
      void restoreFarm(stored.id);
    }
  }, [restoreFarm]);

  // Sync the selected theme on html
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleLocationChange = (lat: number, lon: number) => {
    setLatitude(lat);
    setLongitude(lon);
    if (Math.abs(lat - 22.701) < 0.01) {
      setFarmName("রফিক-এর ডেল্টা খামার (বরিশাল)");
    } else if (Math.abs(lat - 23.1664) < 0.01) {
      setFarmName("যশোর দক্ষিণ-পশ্চিম জমি");
    } else if (Math.abs(lat - 24.8465) < 0.01) {
      setFarmName("বগুড়া উত্তরবঙ্গ খামার");
    } else if (Math.abs(lat - 24.7471) < 0.01) {
      setFarmName("ময়মনসিংহ পুরাতন ব্রহ্মপুত্র জমি");
    } else {
      setFarmName(`খামার (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`);
    }
  };

  const generatePlanForCoords = async (
    lat: number,
    lon: number,
    goal: string = currentGoal,
    isManualClick: boolean = true
  ) => {
    setLoading(true);
    setStatusMessage(null);
    setNasaContext(null);
    setDataFreshness(null);
    setIsSavedOffline(false);
    const profileFarmId =
      selectedFarmId ||
      (user ? localStorage.getItem(`terrashift_farm_id_${user.id}`) : null);
    if (profileFarmId) {
      localStorage.setItem(
        `terrashift_farm_profile_${profileFarmId}`,
        JSON.stringify({ plannedCrop, season, irrigationMethod, waterSource, currentGoal: goal })
      );
    }

    if (
      !farmName.trim() ||
      farmName.trim().length < 2 ||
      !Number.isFinite(fieldSize) ||
      fieldSize <= 0 ||
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lon) ||
      lon < -180 ||
      lon > 180
    ) {
      setLoading(false);
      setStatusMessage(
        language === "bn"
          ? "জমির নাম, শূন্যের বেশি আয়তন এবং সঠিক অক্ষাংশ-দ্রাঘিমাংশ দিন।"
          : "Enter a farm name, a positive field size, and valid latitude and longitude."
      );
      return;
    }

    // If simulated offline: retrieve saved plan directly from IndexedDB
    if (isSimulatedOffline) {
      setIngestStep("অফলাইন মেমরি থেকে পরিকল্পনা লোড করা হচ্ছে...");
      const offlineFarmId =
        selectedFarmId ||
        (user ? localStorage.getItem(`terrashift_farm_id_${user.id}`) : null) ||
        "barisal-pilot-farm-1";
      await offlineDb.saveFarm({
        id: offlineFarmId,
        name: farmName.trim(),
        latitude: lat,
        longitude: lon,
        areaHectares: fieldSize,
        soilTexture: soilTexture || null,
        soilPh: soilPh ?? null,
        updatedAt: new Date().toISOString(),
      });
      const saved = await offlineDb.getPlan(offlineFarmId);
      if (saved) {
        setPlan(saved.plan);
        setAlternativePlan(saved.alternativePlan);
        setDataFreshness(saved.dataFreshness);
        const cachedNasa = await offlineDb.getNasaContext(offlineFarmId);
        setNasaContext(cachedNasa);
        setIsSavedOffline(true);
        setStatusMessage(t.offlineBanner);
      } else {
        setStatusMessage(t.connectToGetNewPlan);
      }
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      setStatusMessage(
        language === "bn"
          ? "NASA তথ্য দিয়ে বিশ্লেষণের আগে লগইন করুন।"
          : "Log in before requesting an analysis from NASA data."
      );
      setIsAuthModalOpen(true);
      return;
    }

    setIngestStep(
      language === "bn"
        ? "সার্ভার থেকে NASA POWER, SMAP এবং SoilGrids তথ্য আনা হচ্ছে..."
        : "Requesting NASA POWER, SMAP, and SoilGrids observations from the server..."
    );

    try {
      const savedFarmId =
        selectedFarmId || localStorage.getItem(`terrashift_farm_id_${user.id}`);
      const farmPayload = {
        name: farmName.trim(),
        lat,
        lon,
        areaHectares: fieldSize,
        soilTexture: soilTexture || null,
        soilPh: soilPh ?? null,
      };
      let farmRes = savedFarmId
        ? await api.updateFarm(savedFarmId, farmPayload)
        : null;
      if (!farmRes || farmRes.status === 404) {
        farmRes = await api.createFarm(farmPayload);
      }
      if (!farmRes.ok || !farmRes.data?.farm?.id) {
        throw new Error(
          farmRes.data?.error ||
            (language === "bn" ? "খামারের তথ্য সংরক্ষণ করা যায়নি।" : "Could not save the farm details.")
        );
      }

      const farmId: string = farmRes.data.farm.id;
      setSelectedFarmId(farmId);
      localStorage.setItem(`terrashift_farm_id_${user.id}`, farmId);
      localStorage.setItem(
        `terrashift_farm_profile_${farmId}`,
        JSON.stringify({ plannedCrop, season, irrigationMethod, waterSource, currentGoal: goal })
      );
      const recRes = await api.getRecommendation(farmId, goal, isManualClick, isSimulatedOffline);

      if (recRes.ok && recRes.data?.plan) {
        setPlan(recRes.data.plan);
        setAlternativePlan(recRes.data.alternativePlan);
        const freshness = recRes.data.dataFreshness;
        setDataFreshness(freshness);
        if (recRes.isOffline) {
          setStatusMessage(
            language === "bn"
              ? "ইন্টারনেট সংযোগ নেই—ডিভাইসে সংরক্ষিত পুরনো পরিকল্পনা দেখানো হচ্ছে; এটি নতুন NASA fetch নয়।"
              : "Offline: showing the saved plan from this device; no new NASA request was made."
          );
          setNasaContext(await offlineDb.getNasaContext(farmId));
        } else {
          const details = await api.getFarmDetails(farmId, isSimulatedOffline);
          if (details.ok && details.data?.nasaContext) {
            setNasaContext(details.data.nasaContext);
          }
          const powerMessage = freshness?.powerFresh
            ? "NASA POWER: live"
            : `NASA POWER: ${freshness?.powerSource || "unavailable"}${freshness?.powerWarning ? ` (${freshness.powerWarning})` : ""}`;
          const smapMessage = freshness?.smapFresh
            ? "SMAP: live granule"
            : `SMAP: ${freshness?.smapSource || "unavailable"}${freshness?.smapWarning ? ` (${freshness.smapWarning})` : ""}`;
          setStatusMessage(`${powerMessage} · ${smapMessage}`);
        }
        setIsSavedOffline(true);
      } else {
        setPlan(null);
        setAlternativePlan(null);
        setStatusMessage(
          language === "bn"
            ? `বিশ্লেষণ অনুরোধ ব্যর্থ (${recRes.status})। ${recRes.data?.error || ""}`
            : `Analysis request failed (${recRes.status}). ${recRes.data?.error || ""}`
        );
      }
    } catch (e) {
      setPlan(null);
      setAlternativePlan(null);
      setStatusMessage(
        language === "bn"
          ? `বিশ্লেষণ ব্যর্থ: ${e instanceof Error ? e.message : "অজানা API সমস্যা"}`
          : `Analysis failed: ${e instanceof Error ? e.message : "Unknown API error"}`
      );
    } finally {
      setLoading(false);
      setIngestStep("");
    }
  };

  const handleGoalChange = (newGoal: string) => {
    setCurrentGoal(newGoal);
    generatePlanForCoords(latitude, longitude, newGoal, true);
  };

  const handleSaveOfflineManual = async () => {
    const farmId = selectedFarmId;
    if (plan) {
      if (!farmId) return;
      await offlineDb.savePlan(farmId, currentGoal, plan, alternativePlan, {
        powerFresh: nasaContext?.powerData?.source === "NASA_POWER_LIVE",
        smapFresh: false,
      });
      if (nasaContext) {
        await offlineDb.saveNasaContext(farmId, nasaContext);
      }
      setIsSavedOffline(true);
      alert(t.savedOfflineSuccess);
    }
  };

  const handleLogout = () => {
    setStoredToken(null);
    setStoredUser(null);
    setUser(null);
    setSelectedFarmId(null);
    restoredUserIdRef.current = null;
  };

  const power = nasaContext?.powerData || {};
  const displayMetric = (value: unknown, suffix: string) =>
    typeof value === "number" && Number.isFinite(value) ? `${value}${suffix}` : "—";
  const powerSource = power.source || "NASA_POWER_UNAVAILABLE";
  const powerIsLive = powerSource === "NASA_POWER_LIVE";
  const powerIsFresh = dataFreshness?.powerFresh === true;
  const powerFreshnessNote =
    powerIsFresh
      ? ""
      : dataFreshness?.powerFresh === false
        ? ` · ${language === "bn" ? "পুরোনো" : "stale"}${power?.fetchedAt ? ` · ${new Date(power.fetchedAt).toLocaleDateString(language === "bn" ? "bn-BD" : "en-GB")}` : ""}`
        : ` · ${language === "bn" ? "সতেজতা অজানা" : "freshness unknown"}`;
  const powerDetail = powerIsLive
    ? `${language === "bn" ? "NASA POWER · পর্যবেক্ষণ" : "NASA POWER · observations"}${powerFreshnessNote}`
    : powerSource.replaceAll("_", " ");
  const verifiedEt0 =
    powerIsLive &&
    power?.etSource === "FAO56-PM-from-POWER (T2MDEW, WS2M, shortwave radiation)" &&
    typeof power.et0Mean === "number" &&
    Number.isFinite(power.et0Mean)
      ? power.et0Mean
      : powerIsLive &&
          power?.etSource === "FAO56-PM-from-POWER" &&
          typeof power.et0Mean === "number" &&
          Number.isFinite(power.et0Mean)
        ? power.et0Mean
        : null;
  const seasonLabel =
    season === "Rabi"
      ? language === "bn" ? "রবি" : "Rabi"
      : season === "Kharif-1"
        ? language === "bn" ? "খরিফ-১" : "Kharif-1"
        : language === "bn" ? "খরিফ-২" : "Kharif-2";
  const seasonCrops = language === "bn"
    ? [{ id: "rice", label: "ধান" }, { id: "lentil", label: "মসুর ডাল" }, { id: "mung", label: "মুগ ডাল" }, { id: "jute", label: "পাট" }, { id: "mustard", label: "সরিষা" }, { id: "wheat", label: "গম" }, { id: "other", label: "অন্যান্য" }]
    : [{ id: "rice", label: "Rice" }, { id: "lentil", label: "Lentil" }, { id: "mung", label: "Mung bean" }, { id: "jute", label: "Jute" }, { id: "mustard", label: "Mustard" }, { id: "wheat", label: "Wheat" }, { id: "other", label: "Other" }];
  const plannedCropLabel = seasonCrops.find((crop) => crop.id === plannedCrop)?.label;
  const nextSeason = plan?.seasons?.[0];
  const rotationPreview = Array.isArray(plan?.seasons) ? plan.seasons.slice(0, 3) : [];
  const nextSeasonLabel =
    nextSeason?.season === "Rabi"
      ? language === "bn" ? "রবি" : "Rabi"
      : nextSeason?.season === "Kharif-1"
        ? "Kharif-1"
        : language === "bn" ? "খরিফ-২" : "Kharif-2";

  return (
    <div
      style={{ fontSize: `${fontScale * 100}%` }}
      className="dashboard-frame min-h-screen flex flex-col text-gray-900 dark:text-gray-100 transition-colors"
    >
      {/* Top Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        fontScale={fontScale}
        onFontScaleChange={setFontScale}
        isSimulatedOffline={isSimulatedOffline}
        onSimulatedOfflineToggle={() => {
          const next = !isSimulatedOffline;
          setIsSimulatedOffline(next);
          if (next) {
            generatePlanForCoords(latitude, longitude, currentGoal, false);
          }
        }}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Offline Mode Alert Banner (PRD Section 10) */}
      {isSimulatedOffline && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-inner">
          <WifiOff className="w-4 h-4 animate-bounce" />
          <span>{t.offlineBanner}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="dashboard-layout mx-auto w-full max-w-[1600px] flex-1">
        <aside className="dashboard-sidebar" aria-label={language === "bn" ? "ড্যাশবোর্ড নেভিগেশন" : "Dashboard navigation"}>
          <div className="dashboard-sidebar-caption">{language === "bn" ? "কৃষি ব্যবস্থাপনা" : "FARM MANAGEMENT"}</div>
          <nav className="dashboard-nav">
            <a className="dashboard-nav-active" href="#overview"><LayoutDashboard size={17} /><span>{language === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}</span></a>
            <a href="#farm-inputs"><Map size={17} /><span>{language === "bn" ? "খামারের তথ্য" : "Farm profile"}</span></a>
            <a href="#crop-plan"><Sprout size={17} /><span>{language === "bn" ? "ফসল পরিকল্পনা" : "Crop planning"}</span></a>
            <a href="#farm-conditions"><BarChart3 size={17} /><span>{language === "bn" ? "আবহাওয়া ও অবস্থা" : "Field conditions"}</span></a>
            <a href="#data-context"><FlaskConical size={17} /><span>{language === "bn" ? "তথ্যের উৎস" : "Data sources"}</span></a>
            <a href="#farm-inputs"><Settings2 size={17} /><span>{language === "bn" ? "সেটিংস" : "Preferences"}</span></a>
          </nav>
          <div className="dashboard-side-note">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d3e9a0]/15 text-[#cce49b]"><Sprout size={17} /></span>
            <p className="mt-3 text-xs font-bold text-[#edf3e6]">{language === "bn" ? "জমির জন্য সিদ্ধান্ত সহায়তা" : "Decision support for your land"}</p>
            <p className="mt-1 text-[10px] leading-4 text-[#b8cbb8]">{language === "bn" ? "তথ্য ও অনুমানের পার্থক্য সবসময় স্পষ্ট।" : "Observations and estimates are always distinguished."}</p>
          </div>
        </aside>
        <nav className="dashboard-mobile-nav" aria-label={language === "bn" ? "ড্যাশবোর্ড বিভাগ" : "Dashboard sections"}>
          <a href="#overview">{language === "bn" ? "ওভারভিউ" : "Overview"}</a>
          <a href="#farm-inputs">{language === "bn" ? "খামার" : "Farm"}</a>
          <a href="#farm-conditions">{language === "bn" ? "অবস্থা" : "Conditions"}</a>
          <a href="#crop-plan">{language === "bn" ? "পরিকল্পনা" : "Plan"}</a>
        </nav>
        <main id="overview" className="dashboard-main min-w-0 space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero & Farmer Status */}
        <section className="dashboard-welcome rounded-[1.75rem] p-6 shadow-xl flex flex-wrap items-center justify-between gap-4 sm:p-8">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold tracking-[.18em] uppercase text-[#c8e19b]">
              {language === "bn" ? "আপনার খামার · ডেল্টা কৃষি" : "YOUR FARM · DELTA AGRICULTURE"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
              {language === "bn" ? `স্বাগতম${user?.fullName ? `, ${user.fullName}` : ""}` : `Welcome${user?.fullName ? `, ${user.fullName}` : " to your farm"}`}
            </h1>
            <p className="text-xs sm:text-sm text-white/70">
              {farmName} · {fieldSize} {t.hectares} · {seasonLabel}{plannedCropLabel ? ` · ${plannedCropLabel}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a href="#farm-inputs" className="min-h-touch px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs flex items-center gap-1.5">
              <PencilLine className="w-4 h-4" />
              <span>{language === "bn" ? "খামার সম্পাদনা" : "Edit farm"}</span>
            </a>
            <button
              onClick={() => setIsNasaModalOpen(true)}
              className="min-h-touch px-4 py-2 rounded-xl bg-[#d3e9a0] hover:bg-[#e1f2ba] text-[#173e2d] font-bold text-xs flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>{t.viewNasaData}</span>
            </button>
          </div>
        </section>

        <section id="farm-conditions" aria-label={language === "bn" ? "সাম্প্রতিক খামার পরিস্থিতি" : "Current farm conditions"} className="grid grid-cols-2 gap-3 2xl:grid-cols-4">
          {[
            { icon: ThermometerSun, label: language === "bn" ? "গড় তাপমাত্রা" : "Mean temperature", value: displayMetric(powerIsLive ? nasaContext?.powerMeanTemp ?? power.meanTemp : null, "°C"), detail: powerDetail, tint: "temperature" },
            { icon: Droplets, label: language === "bn" ? "সাম্প্রতিক বৃষ্টি" : "90-day rainfall", value: displayMetric(powerIsLive ? nasaContext?.powerTotalPrecip ?? power.totalPrecip : null, " mm"), detail: powerDetail, tint: "water" },
            { icon: Activity, label: "ET₀", value: displayMetric(verifiedEt0, " mm/day"), detail: language === "bn" ? "FAO-56 হিসাব · NASA POWER" : "FAO-56 calculation · NASA POWER", tint: "et" },
            { icon: CloudSun, label: language === "bn" ? "তাপপ্রবাহের দিন" : "Heat-stress days", value: displayMetric(powerIsLive ? nasaContext?.powerHeatDays ?? power.heatDays : null, ""), detail: language === "bn" ? "৯০ দিনে সর্বোচ্চ তাপমাত্রা ≥ ৩৩°C" : "Days with max temp ≥ 33°C in 90 days", tint: "heat" },
          ].map(({ icon: Icon, label, value, detail, tint }) => (
            <article key={label} className={`dashboard-metric dashboard-metric-${tint} rounded-2xl border p-4 sm:p-5`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#61766a]">{label}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/75 text-[#42714c]"><Icon size={17} /></span>
              </div>
              <p className="mt-3 text-2xl font-extrabold tracking-tight text-[#193b2c]">{value}</p>
              <p className="mt-1 text-[10px] font-semibold leading-4 text-[#6e8173]">{detail}</p>
            </article>
          ))}
        </section>
        {!nasaContext?.powerData && (
          <p className="rounded-xl border border-[#e5dbc0] bg-[#fff9e9] px-4 py-3 text-xs leading-5 text-[#775d2f]">
            {language === "bn"
              ? "এখনো NASA আবহাওয়ার তথ্য নেই। বিশ্লেষণ চালানোর পর পাওয়া তথ্য এখানে দেখাবে; কোনো নমুনা সংখ্যা ব্যবহার করা হচ্ছে না।"
              : "NASA weather observations are not available yet. Run an analysis to see reported values; no sample figures are substituted."}
          </p>
        )}
        {powerIsLive && powerIsFresh && typeof power?.recentMaxTemp === "number" && power.recentMaxTemp >= 33 && (
          <div role="status" className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <AlertTriangle size={19} className="mt-0.5 shrink-0 text-amber-700" />
            <p><strong>{language === "bn" ? "তাপের সতর্কতা" : "Heat context"}:</strong> {language === "bn" ? `সাম্প্রতিক সর্বোচ্চ তাপমাত্রা ${power.recentMaxTemp}°C ছিল। ফসলের পর্যায়ে সেচের প্রয়োজন কৃষি পরামর্শকের সঙ্গে যাচাই করুন।` : `Recent maximum temperature reached ${power.recentMaxTemp}°C. Check crop-stage irrigation needs with a local agricultural adviser.`}</p>
          </div>
        )}
        <section className="dashboard-next-action flex flex-col gap-4 rounded-2xl border border-[#d7e4d0] bg-[#eaf1e5] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#47764e]">
              <Leaf size={19} />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#66836a]">
                {language === "bn" ? "আপনার পরবর্তী পদক্ষেপ" : "YOUR NEXT STEP"}
              </p>
              {nextSeason ? (
                <>
                  <h2 className="mt-1 text-sm font-extrabold text-[#1d452f]">
                    {language === "bn" ? `${nextSeasonLabel} মৌসুম: ${nextSeason.cropNameBn}` : `${nextSeasonLabel} season: ${nextSeason.cropNameEn}`}
                  </h2>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-[#607565]">
                    {language === "bn" ? nextSeason.reasonBn : nextSeason.reasonEn}
                  </p>
                </>
              ) : (
                <h2 className="mt-1 text-sm font-extrabold text-[#1d452f]">
                  {language === "bn" ? "আপনার জমির জন্য ফসল পরিকল্পনা পেতে বিশ্লেষণ চালান।" : "Run an analysis to get a crop plan for your field."}
                </h2>
              )}
            </div>
          </div>
          <a
            href={nextSeason ? "#crop-plan" : "#farm-inputs"}
            className="inline-flex min-h-touch shrink-0 items-center justify-center gap-2 rounded-xl bg-[#24563b] px-4 text-xs font-extrabold text-white transition hover:bg-[#183f2b]"
          >
            {nextSeason
              ? language === "bn" ? "পরিকল্পনা দেখুন" : "View crop plan"
              : language === "bn" ? "জমির তথ্য দিন" : "Add farm details"}
            <ArrowUpRight size={15} />
          </a>
        </section>
        {rotationPreview.length > 0 && (
          <section className="dashboard-timeline rounded-2xl border p-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#c5d6bd]">{language === "bn" ? "পরবর্তী ফসলচক্র" : "UPCOMING ROTATION"}</p>
                <h2 className="mt-1 text-base font-extrabold text-white">{language === "bn" ? "পরিকল্পিত মৌসুম" : "Planned seasons"}</h2>
              </div>
              <a href="#crop-plan" className="text-xs font-bold text-[#d3e9a0]">{language === "bn" ? "৪ বছরের পরিকল্পনা দেখুন →" : "See full 4-year plan →"}</a>
            </div>
            <ol className="dashboard-season-timeline mt-4 grid gap-3 sm:grid-cols-3">
              {rotationPreview.map((slot: any, index: number) => {
                const seasonName = slot.season === "Rabi"
                  ? language === "bn" ? "রবি" : "Rabi"
                  : slot.season === "Kharif-1" ? "Kharif-1" : language === "bn" ? "খরিফ-২" : "Kharif-2";
                return (
                  <li key={`${slot.year}-${slot.season}-${index}`} className="dashboard-season-item">
                    <span className="dashboard-season-index">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#bad0b6]">{seasonName} · {language === "bn" ? `বছর ${slot.year}` : `Year ${slot.year}`}</p>
                      <p className="mt-1 text-sm font-extrabold text-white">{language === "bn" ? slot.cropNameBn : slot.cropNameEn}</p>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#bfd0bd]">{language === "bn" ? slot.reasonBn : slot.reasonEn}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Section 1: Map & Location Picker (Drop a Pin) */}
        <section id="farm-inputs" className="dashboard-panel rounded-3xl p-5 shadow-sm space-y-4 sm:p-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-agrogreen-600 text-white dark:bg-yellow-400 dark:text-black flex items-center justify-center font-bold text-sm">
                ১
              </div>
              <h2 className="text-lg font-black text-gray-900 dark:text-yellow-400">
                {t.dropPin}
              </h2>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              OpenStreetMap (No API key)
            </span>
          </div>

          <MapPicker
            language={language}
            latitude={latitude}
            longitude={longitude}
            onLocationChange={handleLocationChange}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-bold text-[#526c5a]">
              Latitude
              <input type="number" step="0.0001" min="-90" max="90" value={latitude} onChange={(e) => setLatitude(Number(e.target.value))} className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold" />
            </label>
            <label className="text-xs font-bold text-[#526c5a]">
              Longitude
              <input type="number" step="0.0001" min="-180" max="180" value={longitude} onChange={(e) => setLongitude(Number(e.target.value))} className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold" />
            </label>
          </div>

          {/* Farm Details Form (PRD Section 2: Rafiq minimum input = location + field size) */}
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {t.farmName}
              </label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="dashboard-input w-full min-h-touch px-3 rounded-xl text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {t.fieldSize}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  value={fieldSize}
                  onChange={(e) => setFieldSize(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                  className="dashboard-input w-full min-h-touch px-3 rounded-xl text-sm font-bold"
                />
                <span className="text-xs font-semibold text-gray-500 flex-shrink-0">
                  {t.hectares}
                </span>
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                disabled={loading}
                onClick={() => generatePlanForCoords(latitude, longitude, currentGoal, true)}
                className="w-full min-h-touch py-3 rounded-xl bg-agrogreen-600 hover:bg-agrogreen-700 text-white dark:bg-yellow-400 dark:text-black font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>{t.analyzing}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300 dark:text-black" />
                    <span>{t.analyzeNasa}</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 border-t border-[#e7ebe3] pt-4 sm:grid-cols-2 xl:grid-cols-3">
            <label className="text-xs font-bold text-[#526c5a]">
              {language === "bn" ? "বর্তমান / পরিকল্পিত ফসল (ঐচ্ছিক)" : "Current / planned crop (optional)"}
              <select value={plannedCrop} onChange={(e) => setPlannedCrop(e.target.value)} className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold">
                <option value="">{language === "bn" ? "জানা নেই / নির্বাচন করুন" : "Unknown / select"}</option>
                {seasonCrops.map((crop) => <option key={crop.id} value={crop.id}>{crop.label}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-[#526c5a]">
              {language === "bn" ? "মৌসুম" : "Growing season"}
              <select value={season} onChange={(e) => setSeason(e.target.value)} className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold">
                <option value="Rabi">{language === "bn" ? "রবি" : "Rabi"}</option>
                <option value="Kharif-1">Kharif-1</option>
                <option value="Kharif-2">Kharif-2</option>
              </select>
            </label>
            <label className="text-xs font-bold text-[#526c5a]">
              {language === "bn" ? "মাটির ধরন (ঐচ্ছিক)" : "Soil texture (optional)"}
              <select value={soilTexture} onChange={(e) => setSoilTexture(e.target.value)} className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold">
                <option value="">{language === "bn" ? "জানা নেই" : "Unknown"}</option>
                <option value="clay_loam">{language === "bn" ? "এঁটেল দোআঁশ" : "Clay loam"}</option>
                <option value="silt_loam">{language === "bn" ? "পলি দোআঁশ" : "Silt loam"}</option>
                <option value="sandy_loam">{language === "bn" ? "বেলে দোআঁশ" : "Sandy loam"}</option>
                <option value="loam">{language === "bn" ? "দোআঁশ" : "Loam"}</option>
                <option value="clay">{language === "bn" ? "এঁটেল" : "Clay"}</option>
              </select>
            </label>
            <label className="text-xs font-bold text-[#526c5a]">
              {language === "bn" ? "মাটির pH (ঐচ্ছিক)" : "Soil pH (optional)"}
              <input type="number" min="3" max="10" step="0.1" value={soilPh ?? ""} onChange={(e) => setSoilPh(e.target.value ? Number(e.target.value) : undefined)} placeholder={language === "bn" ? "জানা নেই" : "Unknown"} className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold" />
            </label>
            <label className="text-xs font-bold text-[#526c5a]">
              {language === "bn" ? "সেচের পদ্ধতি (ঐচ্ছিক)" : "Irrigation method (optional)"}
              <select value={irrigationMethod} onChange={(e) => setIrrigationMethod(e.target.value)} className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold">
                <option value="">{language === "bn" ? "জানা নেই" : "Unknown"}</option>
                <option value="surface">{language === "bn" ? "পৃষ্ঠ সেচ" : "Surface irrigation"}</option>
                <option value="pump">{language === "bn" ? "পাম্প" : "Pump"}</option>
                <option value="drip">{language === "bn" ? "ড্রিপ" : "Drip"}</option>
                <option value="rainfed">{language === "bn" ? "বৃষ্টিনির্ভর" : "Rainfed"}</option>
              </select>
            </label>
            <label className="text-xs font-bold text-[#526c5a]">
              {language === "bn" ? "পানির উৎস (ঐচ্ছিক)" : "Water source (optional)"}
              <select value={waterSource} onChange={(e) => setWaterSource(e.target.value)} className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold">
                <option value="">{language === "bn" ? "জানা নেই" : "Unknown"}</option>
                <option value="groundwater">{language === "bn" ? "ভূগর্ভস্থ পানি" : "Groundwater"}</option>
                <option value="surface-water">{language === "bn" ? "নদী / খাল" : "River / canal"}</option>
                <option value="rainwater">{language === "bn" ? "বৃষ্টির পানি" : "Rainwater"}</option>
              </select>
            </label>
            <label className="text-xs font-bold text-[#526c5a]">
              {language === "bn" ? "পরিকল্পনার অগ্রাধিকার" : "Planning priority"}
              <select value={currentGoal} onChange={(e) => setCurrentGoal(e.target.value)} className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold">
                <option value="BALANCED">{t.goals.balanced}</option>
                <option value="CONSERVE_WATER">{t.goals.conserveWater}</option>
                <option value="RESTORE_NITROGEN">{t.goals.restoreNitrogen}</option>
              </select>
            </label>
          </div>
          <p className="flex items-start gap-2 text-[11px] leading-5 text-[#718073]">
            <MapPin size={14} className="mt-0.5 shrink-0" />
          {language === "bn" ? "মাটির তথ্য ফাঁকা রাখলে সেটিকে কৃষকের মাপা তথ্য ধরা হবে না। ফসল, মৌসুম, সেচ ও পানির উৎস ডিভাইসে সংরক্ষিত থাকে; এগুলো এখনো শস্য-স্কোরিংয়ে ব্যবহার হয় না।" : "Unknown soil values are not treated as farmer measurements. Crop, season, irrigation, and water-source preferences are saved on this device; they are not currently inputs to crop scoring."}
          </p>

          {/* Ingestion Progress Live Steps (PRD Section 12) */}
          {loading && (
            <div className="p-4 rounded-2xl bg-nasablue-50 dark:bg-gray-800 border border-nasablue-200 dark:border-yellow-400 animate-pulse text-xs font-bold text-nasablue-950 dark:text-yellow-300 flex items-center gap-3">
              <RotateCw className="w-5 h-5 animate-spin flex-shrink-0" />
              <span>{ingestStep}</span>
            </div>
          )}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs font-semibold text-amber-900 dark:text-amber-200">
              {statusMessage}
            </div>
          )}
        </section>

        {/* Section 2: 4-Year Rotation Plan Screen */}
        <section id="crop-plan" className="space-y-4">
          <PlanView
            language={language}
            plan={plan}
            alternativePlan={alternativePlan}
            currentGoal={currentGoal}
            onGoalChange={handleGoalChange}
            isSavedOffline={isSavedOffline}
            onSaveOffline={handleSaveOfflineManual}
            onOpenNasaContext={() => setIsNasaModalOpen(true)}
          />
        </section>
        <section id="data-context" className="rounded-2xl border border-[#2d5740] bg-[#173a29] p-4 text-xs leading-5 text-[#c6d6c5]">
          <strong className="text-[#e8f0dc]">{language === "bn" ? "তথ্যের সীমাবদ্ধতা:" : "Data limitations:"}</strong>{" "}
          {language === "bn"
            ? "NASA SMAP-এর ৯ কিমি রেজোলিউশন আঞ্চলিক মাটির আর্দ্রতার প্রেক্ষাপট—এটি আপনার নির্দিষ্ট জমির মাপ নয়। ET₀ FAO-56 Penman–Monteith পদ্ধতিতে NASA POWER-এর দৈনিক আবহাওয়া থেকে হিসাব করা হয়। NASA তথ্য না থাকলে ফলাফল ফাঁকা দেখানো হয়; ইঞ্জিনের পরিকল্পনাকে ক্ষেত্রপরিমাপ মনে করবেন না।"
            : "NASA SMAP’s 9 km resolution is regional soil-moisture context, not a measurement of your field. ET₀ is calculated with FAO-56 Penman–Monteith from daily NASA POWER weather inputs. Missing NASA values remain unavailable; treat the rotation as decision support, not a field measurement."}
        </section>
        </main>
      </div>

      {/* NASA Context Telemetry Modal */}
      <NasaContextModal
        language={language}
        isOpen={isNasaModalOpen}
        onClose={() => setIsNasaModalOpen(false)}
        nasaContext={nasaContext}
        farm={{
          name: farmName,
          latitude,
          longitude,
          areaHectares: fieldSize,
          soilTexture,
          soilPh,
          soilSource:
            soilTexture && soilPh != null
              ? "MEASURED"
              : soilTexture || soilPh != null
                ? "MIXED"
                : "UNAVAILABLE",
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        language={language}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(u) => {
          setUser(u);
          restoredUserIdRef.current = u.id;
          void restoreFarm(u.id);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black py-6 mt-12 text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p className="font-bold text-gray-700 dark:text-gray-300">
            TerraShift • NASA Space Apps Challenge 2026 • Team AgroNova
          </p>
          <p className="text-[11px] leading-relaxed max-w-2xl mx-auto">
            NASA SMAP L4 (SPL4SMGP 9 km) provides regional hydrological context, not field truth. All rotation advice is agronomist-reviewed decision support based on BARI & BRRI cropping manuals.
          </p>
        </div>
      </footer>
    </div>
  );
}
