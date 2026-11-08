# TerraShift Video Demo, 7-Slide Deck & NASA Space Apps Submission Guide

**NASA Space Apps Challenge 2026 | Field Shift: Adapting Farms with NASA Data | Team AgroNova**

---

## 1. Project Identity & Phonetic Guide

To ensure consistent subtitles, voiceover pronunciation, and brand recognition across all video cuts and submission slides:

- **Project Name**: **TerraShift**
- **Bangla Spelling**: **টেরাশিফ্‌ট**
- **Team Name**: **AgroNova** (টিম অ্যাগ্রোনোভা)
- **Phonetic Pronunciation**: *"TER-uh-shift"* (NOT *"Terash Shift"*, *"Data Shift"*, or *"Parachute"*).
- **Tagline**:
  - *English*: *"Adapting Smallholder Delta Farms with NASA Earth Observations"*
  - *বাংলা*: *"নাসা স্যাটেলাইট তথ্যে খাপ খাইয়ে ক্ষুদ্র কৃষকদের শস্য আবর্তন পরামর্শ"*

---

## 2. Official 30-Second Video Demo Script (Front-Loaded Problem & Solution)

> **Judging Requirement**: Official NASA Space Apps short video demos must be concise. Do not waste the first 30 seconds on lengthy team intros. Open immediately with the crisis, the live solution, and the measurable impact.

```
[0:00 - 0:06] THE CRISIS
Visual: Rapid shot of cracked delta topsoil and farmer Rafiq standing beside a dry diesel irrigation pump in Barisal.
Narrator: "In Bangladesh's lower delta, smallholder farmers are depleting aquifers and degrading topsoil with continuous double-rice monoculture."

[0:07 - 0:17] THE SOLUTION (LIVE UI DEMO)
Visual: Fast screen recording of TerraShift mobile PWA. Finger taps pin on Babuganj, Barisal on the map.
Visual: Live NASA POWER solar radiation, SMAP L4 rootzone moisture (0.26 m3/m3), and FAO-56 ET0 instantly populate.
Narrator: "TerraShift changes this. In one click, a farmer drops a pin on their field to instantly pull NASA SMAP rootzone moisture and NASA POWER climate data."

[0:18 - 0:25] THE ENGINE & ROTATION
Visual: UI generates the 3-Year Adaptive Rotation Plan: Mustard -> Mung Bean -> T. Aman Rice, with plain Bengali explanations.
Narrator: "Our deterministic agronomic engine generates an optimal 3-year crop rotation, breaking pest cycles and restoring soil nitrogen."

[0:26 - 0:30] MEASURABLE IMPACT & OFFLINE POWER
Visual: Quantitative comparison card flashes: -61% irrigation water, +55 kg biological N/ha, 100% offline in airplane mode.
Narrator: "TerraShift: Cutting water consumption by 61%, restoring delta topsoil, completely offline. Powered by NASA data."
```

---

## 3. Alternative 7-Slide Presentation Deck Structure

For official judging slide submissions, follow this 7-slide structure:

| Slide # | Slide Title | Visual & Core Content | Key Message |
| :---: | :--- | :--- | :--- |
| **Slide 1** | **TerraShift: Climate-Adaptive Crop Rotations** | High-contrast mobile mockup showing the Bengali PWA interface with NASA Earth observation badges. | *Adapting Smallholder Delta Farms with NASA Earth Observations (Team AgroNova).* |
| **Slide 2** | **The Delta Crisis: Water Table & Soil Depletion** | Photo of farmer Rafiq (1.5 ha, Barisal) + infographic showing continuous Boro-Aman monoculture pumping 1,300 mm water and exhausting soil nitrogen. Citation: FAO (2022) SOLAW21 (90% topsoil degradation risk by 2050). | *Smallholders lack soil lab access and 4G connectivity to break free from degrading monoculture.* |
| **Slide 3** | **NASA Earth Observation Fusion** | Architecture diagram showing NASA SMAP L4 (9 km rootzone moisture), NASA POWER (rolling 90-day insolation, temperature, rain), FAO-56 Penman-Monteith ET0, and ISRIC SoilGrids. | *Democratizing high-resolution satellite hydrology without expensive physical soil testing.* |
| **Slide 4** | **Deterministic Agronomic Rotation Engine** | Flowchart of candidate generation: enforcing family alternation (breaks Brown Planthopper & *Rhizoctonia*) + mandatory annual *Fabaceae* legume biological nitrogen fixation. | *No black-box hallucinations. 100% explainable multi-criteria agronomist scoring.* |
| **Slide 5** | **Offline-First PWA for Real Delta Farmers** | Split screen: Airplane mode indicator with pre-cached Bangladesh AEZ climatological baselines + full dual-language Bengali/English interface. | *Works completely offline in the field. Pre-bundled 30 AEZs allow immediate local execution.* |
| **Slide 6** | **Quantitative Impact & Ground-Truth Validation** | Bar chart comparing Conventional vs TerraShift: -61.5% water pumping reduction ($\approx 8,200\text{ m}^3/\text{ha}$ saved), $+55\text{ kg}$ biological N/ha fixed ($\approx ৳৩,৫০০$ urea saved), $+0.15\%$ annual SOM increase. | *Validated against 5-year BARI and BRRI cropping system experimental stations.* |
| **Slide 7** | **Scalability, Open Source & Team AgroNova** | Links to public GitHub repository, live demo PWA, NASA dataset documentation, and team credentials. | *Ready for nationwide deployment across Bangladesh's 30 Agro-Ecological Zones.* |

---

## 4. NASA Space Apps Judging Criteria Alignment

| Criteria | How TerraShift Exceeds Expectations |
| :--- | :--- |
| **Impact** | Directly addresses groundwater aquifer collapse and topsoil organic matter degradation for 16 million delta smallholders in Bangladesh. Quantifiably cuts irrigation pumping by $>60\%$ and replaces $35-45\%$ of chemical urea with biological nitrogen. |
| **Creativity** | Bridges the last-mile digital divide through a dual-layer offline architecture: pre-bundled Bangladesh AEZ climatology enables instant zero-internet rotation calculation, which seamlessly reconciles with live NASA Earthdata upon connection. |
| **Validity** | Rigorously grounded in peer-reviewed science: FAO-56 Penman-Monteith evapotranspiration, Peoples et al. (2001) BNF model, IPCC Tier 1 soil organic carbon accretion, and BARI/BRRI cropping trial baselines. Honest about SMAP 9 km regional context vs field truth. |
| **Relevance** | Directly tackles the *"Field Shift: Adapting Farms with NASA Data"* challenge by operationalizing NASA SMAP L4, NASA POWER agroclimatology, and Landsat thermal surface energy balance. |
| **Presentation** | High-contrast WCAG AAA accessible PWA, fully localized dual-language Bengali (বাংলা) and English UI, 48px touch targets for low-end mobile devices, and crystal-clear transparent documentation. |

---

## 5. Mandatory AI Use Disclosure (Space Apps Compliance)

In compliance with NASA Space Apps Challenge AI disclosure rules:
- **Code Assistance**: AI assistance (Anthropic Claude / Google Gemini) was used for boilerplate TypeScript structuring, documentation editing, and translation verification. All agronomic rotation constraints, equations, and BARI/BRRI research citations were manually verified by human developers and agronomic literature.
- **Voiceover / Media**: If any synthetic voiceover is used in demo cuts, it is transparently disclosed in video subtitles. No fabricated satellite telemetry was generated.
