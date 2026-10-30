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
  cycleSwitchLabel: string;
  cycle3Years: string;
  cycle4Years: string;
  seasons: {
    rabi: string;
    kharif1: string;
    kharif2: string;
  };
  goals: {
    balanced: string;
    conserveWater: string;
    restoreNitrogen: string;
    custom: string;
  };
  customWeightsTitle: string;
  customWeightsDesc: string;
  weights: {
    water: string;
    soil: string;
    nitrogen: string;
    heat: string;
  };
  resetPreset: string;
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
  realCaseStudyBtn: string;
  realCaseStudyTag: string;
  quantitativeImpactTitle: string;
  comparisonView: string;
  rotationTimelineView: string;
  metrics: {
    conventionalLabel: string;
    terrashiftLabel: string;
    waterReductionLabel: string;
    pumpingSavingsLabel: string;
    nFixedLabel: string;
    ureaSavedLabel: string;
    ureaCostSavedLabel: string;
    somGainLabel: string;
    biomassResidueLabel: string;
    pestCutLabel: string;
    tradeOffTitle: string;
    economicTitle: string;
  };
  dataAttribution: {
    nasaBadge: string;
    externalBadge: string;
    soilGridsNotice: string;
    bariNotice: string;
  };
}

export const translations: Record<Language, Translations> = {
  bn: {
    appName: "টেরাশিফ্‌ট",
    tagline: "নাসা স্যাটেলাইট তথ্যে খাপ খাইয়ে ক্ষুদ্র কৃষকদের শস্য আবর্তন পরামর্শ",
    loginAsRafiq: "কৃষক রফিক হিসেবে প্রবেশ (১-ক্লিক ডেমো)",
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
    analyzeNasa: "নাসা উপগ্রহ তথ্যে শস্য আবর্তন প্রস্তুত করুন",
    analyzing: "নাসা উপগ্রহের তথ্য যাচাই করা হচ্ছে...",
    planTitle: "জলবায়ু-সহনশীল শস্য আবর্তন পরিকল্পনা",
    recommendedPlan: "সর্বোত্তম সুপারিশকৃত পরিকল্পনা",
    alternativePlan: "বিকল্প পরিকল্পনা",
    year: "বছর",
    cycleSwitchLabel: "আবর্তনের মেয়াদ:",
    cycle3Years: "৩-বছর (৯ মৌসুম - ডেল্টা স্ট্যান্ডার্ড)",
    cycle4Years: "৪-বছর (১২ মৌসুম - দীর্ঘমেয়াদী)",
    seasons: {
      rabi: "রবি (শীতকাল: নভে–ফেব্রু)",
      kharif1: "খরিফ-১ (গ্রীষ্মকাল: মার্চ–জুন)",
      kharif2: "খরিফ-২ (বর্ষাকাল: জুন–অক্টো)",
    },
    goals: {
      balanced: "সুষম ব্যবস্থাপনা (ডিফল্ট)",
      conserveWater: "পানি সাশ্রয়ী (ভূগর্ভস্থ পানি রক্ষা)",
      restoreNitrogen: "মাটি ও নাইট্রোজেন পুনরুজ্জীবন",
      custom: "কাস্টম অগ্রাধিকার (কৃষক নির্ধারিত)",
    },
    customWeightsTitle: "স্বনির্ধারিত অগ্রাধিকার (Custom Weights)",
    customWeightsDesc: "আপনার মাঠের পরিস্থিতি অনুযায়ী বিভিন্ন বিষয়ের গুরুত্বের শতকরা হার নিজে নির্ধারণ করুন:",
    weights: {
      water: "পানি সাশ্রয় ও খরা সহনশীলতা",
      soil: "মাটির গঠন ও পিএইচ (pH) মেলানো",
      nitrogen: "প্রাকৃতিক নাইট্রোজেন সংবন্ধন (ডাল)",
      heat: "গ্রীষ্ম ও প্রাক-মৌসুম উত্তাপ সহনশীলতা",
    },
    resetPreset: "সুষম মানে রিসেট",
    confidence: {
      high: "উপাত্ত পূর্ণ (মৌসুমি পূর্বাভাস নয়)",
      medium: "মাঝারি নির্ভরতা (মৌসুমি পূর্বাভাস নেই)",
      low: "কম নির্ভরতা (সাম্প্রতিক NASA তথ্য অসম্পূর্ণ)",
    },
    waterDemand: "পানির আপেক্ষিক চাহিদা",
    nitrogenFixation: "প্রাকৃতিক নাইট্রোজেন সংবন্ধন",
    viewNasaData: "নাসা স্যাটেলাইট তথ্য ও বিশ্লেষণ",
    nasaContextTitle: "নাসা উপগ্রহ পর্যবেক্ষণ তথ্য ও সূচক",
    nasaSmapTitle: "নাসা এসএমএপি (SMAP L4) মাটির আর্দ্রতা",
    nasaPowerTitle: "নাসা পাওয়ার (POWER) ৯০ দিনের আবহাওয়া",
    faoEt0Title: "FAO-56 পেনম্যান-মন্টিথ বাষ্পীভবন (ET₀)",
    soilGridsTitle: "ISRIC সয়েলগ্রিডস মাটির প্রাথমিক তথ্য (বাহ্যিক ডেটাসেট)",
    smapDisclaimer: "সতর্কবার্তা: নাসা এসএমএপি (SMAP)-এর ৯ কিমি রেজোলিউশন আঞ্চলিক আর্দ্রতা ও হাইড্রোলজিকাল প্রেক্ষাপট নির্দেশ করে, নির্দিষ্ট জমিনের একক ল্যাব টেস্ট নয়।",
    offlineBanner: "অফলাইন মোড চালু: ফোনে সংরক্ষিত জলবায়ু তথ্য ও পরিকল্পনা প্রদর্শিত হচ্ছে।",
    simulateOffline: "অফলাইন টেস্ট (এয়ারপ্লেন মোড)",
    onlineMode: "অনলাইন মোড",
    connectToGetNewPlan: "নতুন পরিকল্পনা তৈরি করতে ইন্টারনেটে যুক্ত হোন। সংরক্ষিত পরিকল্পনা অফলাইনে দেখা যাচ্ছে।",
    highContrast: "উচ্চ বৈসাদৃশ্য মোড (AAA)",
    fontSize: "অক্ষরের আকার",
    agronomicReview: "বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) ও ধান গবেষণা ইনস্টিটিউট (BRRI)-এর সুপারিশকৃত প্রযুক্তিভিত্তিক।",
    waterSavings: "পানি সাশ্রয়",
    nitrogenGain: "সম্ভাব্য নাইট্রোজেন স্থিরীকরণ",
    saveOffline: "অফলাইনে সংরক্ষণ করুন",
    savedOfflineSuccess: "পরিকল্পনা সফলভাবে ফোনে সংরক্ষিত হয়েছে!",
    realCaseStudyBtn: "বাস্তব উদাহরণ দেখুন: মোহাম্মদ রফিক (বাবুগঞ্জ, বরিশাল)",
    realCaseStudyTag: "১-ক্লিক বাস্তব কেস স্টাডি",
    quantitativeImpactTitle: "পরিমাণগত বৈজ্ঞানিক প্রভাব ও আর্থিক সাশ্রয়",
    comparisonView: "পরিমাণগত প্রভাব বিশ্লেষণ",
    rotationTimelineView: "শস্য আবর্তন ক্যালেন্ডার",
    metrics: {
      conventionalLabel: "প্রচলিত একক চাষ (বোরো - পতিত - আমন)",
      terrashiftLabel: "টেরাশিফ্‌ট আবর্তন (ডাল/তেলবীজ - আমন)",
      waterReductionLabel: "সেচের পানি সাশ্রয়",
      pumpingSavingsLabel: "সেচের ডিজেল/বিদ্যুৎ খরচ সাশ্রয়",
      nFixedLabel: "প্রাকৃতিক জৈব নাইট্রোজেন যোগ",
      ureaSavedLabel: "রাসায়নিক ইউরিয়া সারের সাশ্রয়",
      ureaCostSavedLabel: "ইউরিয়া সারের খরচ সাশ্রয়",
      somGainLabel: "মাটিতে জৈব পদার্থের বার্ষিক বৃদ্ধি",
      biomassResidueLabel: "মাটিতে যোগ হওয়া জৈব বস্তু",
      pestCutLabel: "পোকা ও রোগবালাই ঝুঁকি হ্রাস",
      tradeOffTitle: "কৃষিবিদদের সৎ মূল্যায়ন ও পুষ্টির ভারসাম্য:",
      economicTitle: "অর্থনৈতিক মুনাফা ও বাজারমূল্য:",
    },
    dataAttribution: {
      nasaBadge: "NASA উপগ্রহ উপাত্ত",
      externalBadge: "বাহ্যিক গবেষণা / সয়েলগ্রিডস",
      soilGridsNotice: "সয়েলগ্রিডস (SoilGrids) নেদারল্যান্ডের ISRIC-এর একটি বৈশ্বিক ডিজিটাল সয়েল মডেল, এটি NASA-র ডেটাসেট নয়।",
      bariNotice: "ফসল চক্র, নাইট্রোজেন সংবন্ধন এবং পানির চাহিদা BARI ও BRRI-এর বৈজ্ঞানিক নির্দেশিকা থেকে নেওয়া।",
    },
  },
  en: {
    appName: "TerraShift",
    tagline: "Adapting Smallholder Delta Farms with NASA Earth Observations",
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
    analyzeNasa: "Analyze Field & Generate Adaptive Plan",
    analyzing: "Pulling Live NASA Observations...",
    planTitle: "Climate-Adaptive Crop Rotation Plan",
    recommendedPlan: "Recommended Rotation",
    alternativePlan: "Alternative Rotation",
    year: "Year",
    cycleSwitchLabel: "Rotation Cycle:",
    cycle3Years: "3-Year (9 Seasons - Delta Standard)",
    cycle4Years: "4-Year (12 Seasons - Extended)",
    seasons: {
      rabi: "Rabi (Winter: Nov–Feb)",
      kharif1: "Kharif-1 (Pre-Monsoon: Mar–Jun)",
      kharif2: "Kharif-2 (Monsoon: Jun–Oct)",
    },
    goals: {
      balanced: "Balanced (Default)",
      conserveWater: "Conserve Water (Protect Aquifer)",
      restoreNitrogen: "Restore Soil Nitrogen (Legume Focus)",
      custom: "Custom Priorities (Farmer Set)",
    },
    customWeightsTitle: "Farmer Custom Priority Weights",
    customWeightsDesc: "Adjust the percentage weights according to your immediate field needs:",
    weights: {
      water: "Water Conservation & Drought Avoidance",
      soil: "Soil Texture & pH Matching",
      nitrogen: "Biological Nitrogen Fixation (Pulses)",
      heat: "Pre-Monsoon & Terminal Heat Tolerance",
    },
    resetPreset: "Reset to Balanced",
    confidence: {
      high: "HIGH data coverage (not a seasonal forecast)",
      medium: "MEDIUM confidence (no seasonal forecast)",
      low: "LOW confidence (recent NASA data incomplete)",
    },
    waterDemand: "Relative Water Demand",
    nitrogenFixation: "Biological N Fixation",
    viewNasaData: "View NASA Satellite Metrics",
    nasaContextTitle: "NASA Earth Observation Telemetry",
    nasaSmapTitle: "NASA SMAP L4 (SPL4SMGP) Soil Moisture",
    nasaPowerTitle: "NASA POWER 90-Day Agroclimatology",
    faoEt0Title: "FAO-56 Penman-Monteith Evapotranspiration (ET₀)",
    soilGridsTitle: "ISRIC SoilGrids Baseline (External Non-NASA Dataset)",
    smapDisclaimer: "Notice: NASA SMAP 9 km resolution provides regional hydrological context, not single-field laboratory truth.",
    offlineBanner: "Offline Mode Active: Showing cached Bangladesh AEZ baseline & local plan from device storage.",
    simulateOffline: "Simulate Airplane Mode",
    onlineMode: "Online Mode",
    connectToGetNewPlan: "Connect to internet to calculate a new plan. Viewing saved offline plan.",
    highContrast: "High-Contrast Mode (AAA)",
    fontSize: "Font Size",
    agronomicReview: "Agronomist-validated decision support based on BARI & BRRI peer-reviewed research.",
    waterSavings: "Water Savings",
    nitrogenGain: "Potential Nitrogen Fixation",
    saveOffline: "Save for Offline Access",
    savedOfflineSuccess: "Plan saved to phone memory for offline viewing!",
    realCaseStudyBtn: "Real Case Study: Mohammad Rafiq (Babuganj, Barisal)",
    realCaseStudyTag: "1-Click Real Delta Farm",
    quantitativeImpactTitle: "Quantitative Scientific Impact & Financial Savings",
    comparisonView: "Quantitative Impact Analysis",
    rotationTimelineView: "Crop Rotation Calendar",
    metrics: {
      conventionalLabel: "Conventional Monoculture (Boro - Fallow - T. Aman)",
      terrashiftLabel: "TerraShift Adaptive Rotation (Pulse/Oilseed - Aman)",
      waterReductionLabel: "Irrigation Pumping Reduction",
      pumpingSavingsLabel: "Pumping Fuel/Electricity Savings",
      nFixedLabel: "Biological Soil Nitrogen Added",
      ureaSavedLabel: "Synthetic Urea Replaced",
      ureaCostSavedLabel: "Fertilizer Cost Saved",
      somGainLabel: "Annual Topsoil Organic Matter Accretion",
      biomassResidueLabel: "Organic Biomass Residue Added",
      pestCutLabel: "Pest Vulnerability Cut",
      tradeOffTitle: "Honest Agronomic Evaluation & Caloric Balance:",
      economicTitle: "Economic Net Revenue Comparison:",
    },
    dataAttribution: {
      nasaBadge: "NASA Satellite Observation",
      externalBadge: "External Research / ISRIC",
      soilGridsNotice: "SoilGrids is a global digital soil map produced by ISRIC Wageningen (Netherlands), NOT a NASA dataset.",
      bariNotice: "Crop parameters, BNF potentials, and physiological heat limits are validated against BARI and BRRI field trials.",
    },
  },
};
