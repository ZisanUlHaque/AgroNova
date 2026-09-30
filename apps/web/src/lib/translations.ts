export type Language = "bn" | "en";

export interface Translations {
  appName: string;
  tagline: string;
  loginAsRafiq: string;
  login: string;
  register: string;
  logout: string;
  phone: string;
  password: string;
  fullName: string;
  farmName: string;
  fieldSize: string;
  hectares: string;
  bigha: string;
  dropPin: string;
  useGps: string;
  selectPilotFarm: string;
  barisalPilot: string;
  jessorePilot: string;
  boguraPilot: string;
  mymensinghPilot: string;
  analyzeNasa: string;
  analyzing: string;
  planTitle: string;
  recommendedPlan: string;
  alternativePlan: string;
  year: string;
  seasons: {
    rabi: string;
    kharif1: string;
    kharif2: string;
  };
  goals: {
    balanced: string;
    conserveWater: string;
    restoreNitrogen: string;
  };
  confidence: {
    high: string;
    medium: string;
    low: string;
  };
  waterDemand: string;
  nitrogenFixation: string;
  viewNasaData: string;
  nasaContextTitle: string;
  nasaSmapTitle: string;
  nasaPowerTitle: string;
  faoEt0Title: string;
  soilGridsTitle: string;
  smapDisclaimer: string;
  offlineBanner: string;
  simulateOffline: string;
  onlineMode: string;
  connectToGetNewPlan: string;
  highContrast: string;
  fontSize: string;
  agronomicReview: string;
  waterSavings: string;
  nitrogenGain: string;
  saveOffline: string;
  savedOfflineSuccess: string;
}

export const translations: Record<Language, Translations> = {
  bn: {
    appName: "টেরাশাফট",
    tagline: "নাসা স্যাটেলাইট তথ্যে খাপ খাইয়ে শস্য আবর্তন পরামর্শ",
    loginAsRafiq: "কৃষক রফিক হিসেবে প্রবেশ (ডেমো)",
    login: "লগইন",
    register: "নিবন্ধন",
    logout: "লগআউট",
    phone: "মোবাইল নম্বর",
    password: "পাসওয়ার্ড",
    fullName: "পুরো নাম",
    farmName: "জমির নাম",
    fieldSize: "জমির আকার (হেক্টর)",
    hectares: "হেক্টর",
    bigha: "বিঘা (~০.১৩ হেক্টর)",
    dropPin: "মানচিত্রে জমির অবস্থান নির্বাচন করুন",
    useGps: "আমার বর্তমান অবস্থান",
    selectPilotFarm: "পাইলট এলাকা বেছে নিন:",
    barisalPilot: "বরিশাল ডেল্টা (রফিক-এর খামার)",
    jessorePilot: "যশোর দক্ষিণ-পশ্চিম অঞ্চল",
    boguraPilot: "বগুড়া উত্তরবঙ্গ অঞ্চল",
    mymensinghPilot: "ময়মনসিংহ পুরাতন ব্রহ্মপুত্র",
    analyzeNasa: "নাসা তথ্যে জমি বিশ্লেষণ ও ৪ বছরের পরিকল্পনা তৈরি",
    analyzing: "নাসা উপগ্রহের তথ্য যাচাই করা হচ্ছে...",
    planTitle: "৪-বছরের টেকসই শস্য আবর্তন পরিকল্পনা (১২ মৌসুম)",
    recommendedPlan: "সর্বোত্তম সুপারিশকৃত পরিকল্পনা",
    alternativePlan: "বিকল্প পরিকল্পনা",
    year: "বছর",
    seasons: {
      rabi: "রবি (শীতকাল: নভে–ফেব্রু)",
      kharif1: "খরিফ-১ (গ্রীষ্মকাল: মার্চ–জুন)",
      kharif2: "খরিফ-২ (বর্ষাকাল: জুন–অক্টো)",
    },
    goals: {
      balanced: "ভারসাম্যপূর্ণ (ডিফল্ট)",
      conserveWater: "পানি সাশ্রয় (ভূগর্ভস্থ পানি রক্ষা)",
      restoreNitrogen: "নাইট্রোজেন বৃদ্ধি (ডাল ফসল জোর)",
    },
    confidence: {
      high: "উচ্চ নির্ভুলতা (লাইভ নাসা + পরীক্ষিত মাটি)",
      medium: "মাঝারি নির্ভরতা (লাইভ নাসা + আনুমানিক মাটি)",
      low: "কম নির্ভরতা (আঞ্চলিক গড় জলবায়ু)",
    },
    waterDemand: "পানি চাহিদা",
    nitrogenFixation: "প্রাকৃতিক নাইট্রোজেন",
    viewNasaData: "নাসা স্যাটেলাইট তথ্য দেখুন",
    nasaContextTitle: "নাসা উপগ্রহ পর্যবেক্ষণ তথ্য ও সূচক",
    nasaSmapTitle: "নাসা এসএমএপি (SMAP L4) মাটির আর্দ্রতা",
    nasaPowerTitle: "নাসা পাওয়ার (POWER) ৯০ দিনের আবহাওয়া",
    faoEt0Title: "FAO-56 পেনম্যান-মন্টিথ বাষ্পীভবন (ET₀)",
    soilGridsTitle: "ISRIC সয়েলগ্রিডস মাটির প্রাথমিক তথ্য",
    smapDisclaimer: "নোট: নাসা এসএমএপি-এর ৯ কিমি রেজোলিউশন আঞ্চলিক আর্দ্রতা বোঝায়, নির্দিষ্ট খামারের নিখুঁত একক সত্য নয়।",
    offlineBanner: "ইন্টারনেট নেই: ফোনে সংরক্ষিত ৪ বছরের পরিকল্পনা প্রদর্শিত হচ্ছে।",
    simulateOffline: "অফলাইন টেস্ট (এয়ারপ্লেন মোড)",
    onlineMode: "অনলাইন মোড",
    connectToGetNewPlan: "নতুন পরিকল্পনা তৈরি করতে ইন্টারনেটে যুক্ত হোন। সংরক্ষিত পরিকল্পনা অফলাইনে দেখা যাচ্ছে।",
    highContrast: "উচ্চ বৈসাদৃশ্য মোড (AAA)",
    fontSize: "অক্ষরের আকার",
    agronomicReview: "কৃষিবিদদের দ্বারা অনুমোদিত বৈজ্ঞানিক সিদ্ধান্ত সহায়তা।",
    waterSavings: "পানি সাশ্রয় অনুমান",
    nitrogenGain: "প্রাকৃতিক নাইট্রোজেন লাভ",
    saveOffline: "অফলাইনে সংরক্ষণ করুন",
    savedOfflineSuccess: "পরিকল্পনা সফলভাবে ফোনে সংরক্ষিত হয়েছে!",
  },
  en: {
    appName: "TerraShift",
    tagline: "Adapting Farms with NASA Climate & Soil Moisture Data",
    loginAsRafiq: "Login as Farmer Rafiq (1-Click Demo)",
    login: "Login",
    register: "Register",
    logout: "Logout",
    phone: "Phone Number",
    password: "Password",
    fullName: "Full Name",
    farmName: "Field Name",
    fieldSize: "Field Size (Hectares)",
    hectares: "Hectares",
    bigha: "Bigha (~0.13 ha)",
    dropPin: "Drop a Pin on Your Field",
    useGps: "Use My GPS Location",
    selectPilotFarm: "Quick Pilot Location:",
    barisalPilot: "Barisal Delta (Rafiq's Pilot Field)",
    jessorePilot: "Jessore Southwest Plain",
    boguraPilot: "Bogura North Bengal",
    mymensinghPilot: "Mymensingh Alluvium",
    analyzeNasa: "Analyze Field & Generate 4-Year Plan",
    analyzing: "Pulling Live NASA Observations...",
    planTitle: "4-Year Climate-Adaptive Crop Rotation Plan",
    recommendedPlan: "Recommended Rotation",
    alternativePlan: "Alternative Rotation",
    year: "Year",
    seasons: {
      rabi: "Rabi (Winter: Nov–Feb)",
      kharif1: "Kharif-1 (Pre-Monsoon: Mar–Jun)",
      kharif2: "Kharif-2 (Monsoon: Jun–Oct)",
    },
    goals: {
      balanced: "Balanced (Default)",
      conserveWater: "Conserve Water (Protect Groundwater)",
      restoreNitrogen: "Restore Nitrogen (Legume Priority)",
    },
    confidence: {
      high: "HIGH Confidence (Live NASA + Measured Soil)",
      medium: "MEDIUM Confidence (Live NASA + Estimated Soil)",
      low: "LOW Confidence (Regional Climatology)",
    },
    waterDemand: "Water Demand",
    nitrogenFixation: "Biological N Fixation",
    viewNasaData: "View NASA Satellite Metrics",
    nasaContextTitle: "NASA Earth Observation Telemetry",
    nasaSmapTitle: "NASA SMAP L4 (SPL4SMGP) Soil Moisture",
    nasaPowerTitle: "NASA POWER 90-Day Agroclimatology",
    faoEt0Title: "FAO-56 Penman-Monteith Evapotranspiration (ET₀)",
    soilGridsTitle: "ISRIC SoilGrids Baseline",
    smapDisclaimer: "Notice: NASA SMAP 9 km resolution provides regional hydrological context, not field truth.",
    offlineBanner: "You are offline. Showing saved 4-year plan from device memory.",
    simulateOffline: "Simulate Airplane Mode",
    onlineMode: "Online Mode",
    connectToGetNewPlan: "Connect to internet to calculate a new plan. Viewing saved offline plan.",
    highContrast: "High-Contrast Mode (AAA)",
    fontSize: "Font Size",
    agronomicReview: "Agronomist-reviewed decision support based on BARI & BRRI research.",
    waterSavings: "Estimated Water Savings",
    nitrogenGain: "Estimated Nitrogen Gain",
    saveOffline: "Save for Offline Access",
    savedOfflineSuccess: "Plan saved to phone memory for offline viewing!",
  },
};
