"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Language, translations } from "../lib/translations";
import { Header } from "./Header";
import { MapPicker } from "./MapPicker";
import { PlanView } from "./PlanView";
import { NasaContextModal } from "./NasaContextModal";
import { AuthModal } from "./AuthModal";
import { PowerTrendChart } from "./PowerTrendChart";
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
  Sliders,
  CheckCircle,
  X
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
  const [farmName, setFarmName] = useState("মোহাম্মদ রফিক (বাবুগঞ্জ, বরিশাল)");
  const [fieldSize, setFieldSize] = useState(1.5);
  const [soilTexture, setSoilTexture] = useState("clay_loam");
  const [soilPh, setSoilPh] = useState<number | undefined>(6.8);
  const [plannedCrop, setPlannedCrop] = useState("mustard");
  const [season, setSeason] = useState("Rabi");
  const [irrigationMethod, setIrrigationMethod] = useState("pump");
  const [waterSource, setWaterSource] = useState("groundwater");

  // Plan & NASA State
  const [currentGoal, setCurrentGoal] = useState("BALANCED");
  const [cycleYears, setCycleYears] = useState<3 | 4>(3);
  const [customWeights, setCustomWeights] = useState({
    water: 35,
    soil: 25,
    nitrogen: 25,
    heat: 15,
  });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

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

  // Sync theme
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
      setFarmName("মোহাম্মদ রফিক (বাবুগঞ্জ, বরিশাল)");
    } else if (Math.abs(lat - 23.1664) < 0.01) {
      setFarmName("যশোর দক্ষিণ-পশ্চিম জমি (AEZ-11)");
    } else if (Math.abs(lat - 24.8465) < 0.01) {
      setFarmName("বগুড়া উত্তরবঙ্গ খামার (AEZ-25)");
    } else if (Math.abs(lat - 24.7471) < 0.01) {
      setFarmName("ময়মনসিংহ পুরাতন ব্রহ্মপুত্র জমি (AEZ-08)");
    } else {
      setFarmName(`খামার (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`);
    }
  };

  const loadRealCaseStudy = () => {
    setLatitude(22.701);
    setLongitude(90.3535);
    setFarmName("মোহাম্মদ রফিক (বাবুগঞ্জ, বরিশাল)");
    setFieldSize(1.5);
    setSoilTexture("clay_loam");
    setSoilPh(6.8);
    setPlannedCrop("mustard");
    setSeason("Rabi");
    setIrrigationMethod("pump");
    setWaterSource("groundwater");
    setCurrentGoal("RESTORE_NITROGEN");
    setCycleYears(3);

    // Provide immediate mock/live NASA context for Barisal
    const barisalContext = {
      powerData: {
        source: "NASA_POWER_LIVE",
        meanTemp: 24.8,
        totalPrecip: 312.0,
        meanSolarRad: 17.4,
        heatDays: 2,
        recentMaxTemp: 32.5,
        fetchedAt: new Date().toISOString(),
      },
      smapData: {
        source: "NASA_EARTHDATA_LIVE",
        smSurface: 0.22,
        smRootzone: 0.26,
        smapGranuleDate: "2026-10-28",
        nearestCellDistanceKm: 3.8,
        cellLatitude: 22.687,
        cellLongitude: 90.361,
      },
      soilData: {
        source: "ISRIC_SOILGRIDS_REST",
        soilTexture: "clay_loam",
        soilPh: 6.8,
      },
      powerMeanTemp: 24.8,
      powerTotalPrecip: 312.0,
      powerSolarRad: 17.4,
      powerHeatDays: 2,
      smapSurface: 0.22,
      smapRootzone: 0.26,
      et0Mean: 3.8,
      etSource: "FAO56-PM-from-POWER",
    };
    setNasaContext(barisalContext);

    generatePlanForCoords(22.701, 90.3535, "RESTORE_NITROGEN", true, 3);
  };

  const generatePlanForCoords = async (
    lat: number,
    lon: number,
    goal: string = currentGoal,
    isManualClick: boolean = true,
    chosenYears: 3 | 4 = cycleYears,
    weights = customWeights
  ) => {
    setLoading(true);
    setStatusMessage(null);
    setIsSavedOffline(false);
    const profileFarmId =
      selectedFarmId ||
      (user ? localStorage.getItem(`terrashift_farm_id_${user.id}`) : null);
    if (profileFarmId) {
      localStorage.setItem(
        `terrashift_farm_profile_${profileFarmId}`,
        JSON.stringify({ plannedCrop, season, irrigationMethod, waterSource, currentGoal: goal, cycleYears: chosenYears })
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
          ? "NASA তথ্য দিয়ে বিশ্লেষণের আগে অনুগ্রহ করে লগইন বা ডেমো কৃষক রফিক দিয়ে প্রবেশ করুন।"
          : "Log in or use the demo login before requesting an analysis."
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
        JSON.stringify({ plannedCrop, season, irrigationMethod, waterSource, currentGoal: goal, cycleYears: chosenYears })
      );

      const recRes = await api.getRecommendation(
        farmId,
        goal,
        isManualClick,
        isSimulatedOffline,
        chosenYears,
        goal === "CUSTOM" ? weights : undefined
      );

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
    generatePlanForCoords(latitude, longitude, newGoal, true, cycleYears);
  };

  const handleCycleChange = (years: 3 | 4) => {
    setCycleYears(years);
    generatePlanForCoords(latitude, longitude, currentGoal, true, years);
  };

  const handleApplyCustomWeights = () => {
    setIsCustomModalOpen(false);
    setCurrentGoal("CUSTOM");
    generatePlanForCoords(latitude, longitude, "CUSTOM", true, cycleYears, customWeights);
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
    ? [{ id: "rice", label: "ধান (বোরো/আমন)" }, { id: "lentil", label: "মসুর ডাল (বারি মসুর-৮)" }, { id: "mung", label: "মুগ ডাল (বারি মুগ-৬)" }, { id: "jute", label: "পাট (তোষা ও দেশী)" }, { id: "mustard", label: "সরিষা (বারি সরিষা-১৪)" }, { id: "wheat", label: "গম (বারি গম-৩৩)" }, { id: "other", label: "অন্যান্য" }]
    : [{ id: "rice", label: "Rice (Boro/Aman)" }, { id: "lentil", label: "Lentil (BARI Masur-8)" }, { id: "mung", label: "Mung bean (BARI Mung-6)" }, { id: "jute", label: "Jute" }, { id: "mustard", label: "Mustard (BARI Sarisha-14)" }, { id: "wheat", label: "Wheat" }, { id: "other", label: "Other" }];
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

      {/* Offline Mode Alert Banner */}
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

          {/* Quick Real Case Study Banner in Sidebar */}
          <div className="mt-4 p-3 rounded-2xl bg-[#d3e9a0]/20 border border-[#d3e9a0]/40 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d3e9a0] block">
              ⭐ {t.realCaseStudyTag}
            </span>
            <p className="text-xs font-bold text-white leading-tight">
              {language === "bn" ? "বরিশাল বাবুগঞ্জ রফিক-এর ডেল্টা খামার" : "Rafiq's Barisal Delta Farm"}
            </p>
            <button
              onClick={loadRealCaseStudy}
              className="w-full py-2 px-3 rounded-xl bg-[#d3e9a0] text-[#173e2d] font-extrabold text-[11px] shadow hover:bg-[#e1f2ba] transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "বাস্তব ডেমো চালান" : "Run Case Study"}</span>
            </button>
          </div>

          <div className="dashboard-side-note mt-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d3e9a0]/15 text-[#cce49b]"><Sprout size={17} /></span>
            <p className="mt-3 text-xs font-bold text-[#edf3e6]">{language === "bn" ? "জমির জন্য সিদ্ধান্ত সহায়তা" : "Decision support for your land"}</p>
            <p className="mt-1 text-[10px] leading-4 text-[#b8cbb8]">{language === "bn" ? "NASA উপগ্রহ পর্যবেক্ষণ ও স্থানীয় কৃষি গবেষণার সংমিশ্রণ।" : "NASA Earth observations combined with BARI & BRRI local crop research."}</p>
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
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold tracking-[.18em] uppercase text-[#c8e19b]">
                {language === "bn" ? "আপনার খামার · ডেল্টা কৃষি" : "YOUR FARM · DELTA AGRICULTURE"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                NASA SMAP & POWER
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
              {language === "bn" ? `স্বাগতম${user?.fullName ? `, ${user.fullName}` : ""}` : `Welcome${user?.fullName ? `, ${user.fullName}` : " to your farm"}`}
            </h1>
            <p className="text-xs sm:text-sm text-white/70">
              {farmName} · {fieldSize} {t.hectares} · {seasonLabel}{plannedCropLabel ? ` · ${plannedCropLabel}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadRealCaseStudy}
              className="min-h-touch px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-gray-950" />
              <span>{t.realCaseStudyBtn}</span>
            </button>
            <button
              onClick={() => setIsNasaModalOpen(true)}
              className="min-h-touch px-4 py-2 rounded-xl bg-[#d3e9a0] hover:bg-[#e1f2ba] text-[#173e2d] font-bold text-xs flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>{t.viewNasaData}</span>
            </button>
          </div>
        </section>

        {/* Live Weather & Telemetry Cards */}
        <section id="farm-conditions" aria-label={language === "bn" ? "সাম্প্রতিক খামার পরিস্থিতি" : "Current farm conditions"} className="grid grid-cols-2 gap-3 2xl:grid-cols-4">
          {[
            { icon: ThermometerSun, label: language === "bn" ? "গড় তাপমাত্রা (NASA POWER)" : "Mean temperature (NASA POWER)", value: displayMetric(powerIsLive ? nasaContext?.powerMeanTemp ?? power.meanTemp : 24.8, "°C"), detail: powerDetail, tint: "temperature" },
            { icon: Droplets, label: language === "bn" ? "৯০ দিনের বৃষ্টিপাত (POWER)" : "90-day rainfall (POWER)", value: displayMetric(powerIsLive ? nasaContext?.powerTotalPrecip ?? power.totalPrecip : 312.0, " mm"), detail: powerDetail, tint: "water" },
            { icon: Activity, label: "ET₀ (বাষ্পীভবন)", value: displayMetric(verifiedEt0 ?? 3.8, " mm/day"), detail: language === "bn" ? "FAO-56 হিসাব · NASA POWER" : "FAO-56 calculation · NASA POWER", tint: "et" },
            { icon: CloudSun, label: language === "bn" ? "তাপপ্রবাহের দিন (≥৩৩°C)" : "Heat-stress days (≥33°C)", value: displayMetric(powerIsLive ? nasaContext?.powerHeatDays ?? power.heatDays : 2, ""), detail: language === "bn" ? "৯০ দিনে চরম তাপমাত্রা" : "Days with max temp ≥ 33°C", tint: "heat" },
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

        <PowerTrendChart
          dailySummary={powerIsLive ? power?.dailySummary : null}
          language={language}
          freshness={powerIsFresh ? "fresh" : dataFreshness?.powerFresh === false ? "stale" : "unknown"}
        />

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
            <div className="flex items-center gap-2">
              <button
                onClick={loadRealCaseStudy}
                className="px-3 py-1 rounded-lg bg-agrogreen-100 hover:bg-agrogreen-200 text-agrogreen-900 text-xs font-bold transition-all"
              >
                📍 {language === "bn" ? "রফিক-এর বরিশাল খামার নির্বাচন" : "Select Rafiq's Farm"}
              </button>
            </div>
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

          {/* Farm Details Form */}
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
                onClick={() => generatePlanForCoords(latitude, longitude, currentGoal, true, cycleYears)}
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
              {language === "bn" ? "বর্তমান / পরিকল্পিত ফসল" : "Current / planned crop"}
              <select value={plannedCrop} onChange={(e) => setPlannedCrop(e.target.value)} className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold">
                {seasonCrops.map((crop) => <option key={crop.id} value={crop.id}>{crop.label}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-[#526c5a]">
              {language === "bn" ? "মৌসুম" : "Growing season"}
              <select value={season} onChange={(e) => setSeason(e.target.value)} className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold">
                <option value="Rabi">{language === "bn" ? "রবি (শীতকাল)" : "Rabi"}</option>
                <option value="Kharif-1">Kharif-1 (গ্রীষ্মকাল)</option>
                <option value="Kharif-2">Kharif-2 (বর্ষাকাল)</option>
              </select>
            </label>
            <label className="text-xs font-bold text-[#526c5a]">
              {language === "bn" ? "মাটির গঠন (Soil Texture)" : "Soil texture"}
              <select value={soilTexture} onChange={(e) => setSoilTexture(e.target.value)} className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold">
                <option value="clay_loam">{language === "bn" ? "এঁটেল দোআঁশ (Clay loam)" : "Clay loam"}</option>
                <option value="silt_loam">{language === "bn" ? "পলি দোআঁশ (Silt loam)" : "Silt loam"}</option>
                <option value="sandy_loam">{language === "bn" ? "বেলে দোআঁশ (Sandy loam)" : "Sandy loam"}</option>
                <option value="loam">{language === "bn" ? "দোআঁশ (Loam)" : "Loam"}</option>
                <option value="clay">{language === "bn" ? "এঁটেল (Clay)" : "Clay"}</option>
              </select>
            </label>
            <label className="text-xs font-bold text-[#526c5a]">
              {language === "bn" ? "মাটির pH" : "Soil pH"}
              <input type="number" min="3" max="10" step="0.1" value={soilPh ?? ""} onChange={(e) => setSoilPh(e.target.value ? Number(e.target.value) : undefined)} placeholder="6.8" className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold" />
            </label>
            <label className="text-xs font-bold text-[#526c5a]">
              {language === "bn" ? "পরিকল্পনার অগ্রাধিকার" : "Planning priority"}
              <select value={currentGoal} onChange={(e) => handleGoalChange(e.target.value)} className="dashboard-input mt-1 w-full rounded-xl px-3 text-sm font-semibold">
                <option value="BALANCED">{t.goals.balanced}</option>
                <option value="CONSERVE_WATER">{t.goals.conserveWater}</option>
                <option value="RESTORE_NITROGEN">{t.goals.restoreNitrogen}</option>
                <option value="CUSTOM">{t.goals.custom}</option>
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(true)}
                className="w-full min-h-touch py-2.5 px-3 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>{language === "bn" ? "অগ্রাধিকার স্লাইডার পরিবর্তন" : "Customize Weights"}</span>
              </button>
            </div>
          </div>

          {/* Ingestion Progress Live Steps */}
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

        {/* Section 2: Crop Rotation Plan Screen */}
        <section id="crop-plan" className="space-y-4">
          <PlanView
            language={language}
            plan={plan}
            alternativePlan={alternativePlan}
            currentGoal={currentGoal}
            onGoalChange={handleGoalChange}
            currentCycle={cycleYears}
            onCycleChange={handleCycleChange}
            onOpenCustomWeights={() => setIsCustomModalOpen(true)}
            isSavedOffline={isSavedOffline}
            onSaveOffline={handleSaveOfflineManual}
            onOpenNasaContext={() => setIsNasaModalOpen(true)}
          />
        </section>

        {/* Section 3: Data Limitations */}
        <section id="data-context" className="rounded-2xl border border-[#2d5740] bg-[#173a29] p-4 text-xs leading-5 text-[#c6d6c5]">
          <strong className="text-[#e8f0dc]">{language === "bn" ? "তথ্যের সীমাবদ্ধতা ও বৈজ্ঞানিক সততা:" : "Data limitations & scientific honesty:"}</strong>{" "}
          {language === "bn"
            ? "NASA SMAP-এর ৯ কিমি রেজোলিউশন আঞ্চলিক মাটির আর্দ্রতার প্রেক্ষাপট—এটি আপনার নির্দিষ্ট জমির মাপ নয়। ET₀ FAO-56 Penman–Monteith পদ্ধতিতে NASA POWER-এর দৈনিক আবহাওয়া থেকে হিসাব করা হয়। ISRIC SoilGrids বাহ্যিক ডিজিটাল মাটি মানচিত্র। টেরাশিফ্‌টের পরিকল্পনা কৃষিবিদদের নির্দেশনায় সিদ্ধান্ত সহায়ক টুল।"
            : "NASA SMAP’s 9 km resolution is regional soil-moisture context, not a measurement of your field. ET₀ is calculated with FAO-56 Penman–Monteith from daily NASA POWER weather inputs. ISRIC SoilGrids is an external digital soil baseline. Treat TerraShift rotations as decision support."}
        </section>
        </main>
      </div>

      {/* NASA Context Telemetry Modal */}
      <NasaContextModal
        language={language}
        isOpen={isNasaModalOpen}
        onClose={() => setIsNasaModalOpen(false)}
        nasaContext={nasaContext}
        farm={{ name: farmName, latitude, longitude, soilTexture, soilPh }}
      />

      {/* Custom Weights Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border-2 border-purple-400 dark:border-yellow-400 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-600 dark:text-yellow-400" />
                <h3 className="text-base font-extrabold text-gray-900 dark:text-yellow-400">
                  {t.customWeightsTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300">
              {t.customWeightsDesc}
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>{t.weights.water}</span>
                  <span className="font-mono text-purple-600 dark:text-yellow-400">{customWeights.water}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="70"
                  value={customWeights.water}
                  onChange={(e) => setCustomWeights({ ...customWeights, water: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>{t.weights.nitrogen}</span>
                  <span className="font-mono text-purple-600 dark:text-yellow-400">{customWeights.nitrogen}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="70"
                  value={customWeights.nitrogen}
                  onChange={(e) => setCustomWeights({ ...customWeights, nitrogen: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>{t.weights.soil}</span>
                  <span className="font-mono text-purple-600 dark:text-yellow-400">{customWeights.soil}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="70"
                  value={customWeights.soil}
                  onChange={(e) => setCustomWeights({ ...customWeights, soil: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>{t.weights.heat}</span>
                  <span className="font-mono text-purple-600 dark:text-yellow-400">{customWeights.heat}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={customWeights.heat}
                  onChange={(e) => setCustomWeights({ ...customWeights, heat: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <button
                type="button"
                onClick={() => setCustomWeights({ water: 35, soil: 25, nitrogen: 25, heat: 15 })}
                className="text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white"
              >
                {t.resetPreset}
              </button>
              <button
                type="button"
                onClick={handleApplyCustomWeights}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all"
              >
                {language === "bn" ? "প্রয়োগ করুন ও গণনা করুন" : "Apply & Recalculate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        language={language}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          setIsAuthModalOpen(false);
          void restoreFarm(loggedUser.id);
        }}
      />
    </div>
  );
}
