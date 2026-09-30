# TerraShift 🌱
### Adapting Smallholder Delta Farms with NASA Earth Observations

[![NASA Space Apps Challenge 2026](https://img.shields.io/badge/NASA%20Space%20Apps-2026-blue.svg)](https://www.spaceappschallenge.org/)
[![Challenge](https://img.shields.io/badge/Challenge-Field%20Shift%3A%20Adapting%20Farms%20with%20NASA%20Data-orange.svg)]()
[![Team](https://img.shields.io/badge/Team-AgroNova-green.svg)]()
[![Status](https://img.shields.io/badge/Status-Build--Ready%20MVP-success.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Executive Summary

Smallholder farmers in the lower Ganges-Brahmaputra-Meghna delta (e.g. Barisal, Khulna, Patuakhali) face erratic monsoons, surging groundwater pumping tariffs for winter Boro rice, and accelerating soil degradation. Most modern digital agriculture solutions require expensive soil laboratory tests or uninterrupted 4G connectivity—luxuries unavailable to 1.5-hectare farmers like **Rafiq**.

**TerraShift** is a climate-adaptive, mobile-first Progressive Web App (PWA). A farmer simply drops a pin on their field; TerraShift automatically ingests NASA Earth observation data, computes reference evapotranspiration ($ET_0$) via the standard FAO-56 Penman-Monteith method, and executes a deterministic, agronomist-validated rule engine to generate a **4-Year (12-Season) Crop Rotation Plan**. 

Each season includes plain-language agronomic explanations in **Bengali (বাংলা) and English**, accessible pictograms, confidence indicators, and honest ranges for water savings and biological nitrogen fixation. Plans are cached locally in **IndexedDB** so farmers can review their plan offline in airplane mode directly in the field.

---

## 🚀 Key Features

1. **Pin-Drop Farm Ingest (Zero Lab Testing Needed)**:
   - Farmer drops a pin using Leaflet & OpenStreetMap (no paid API keys).
   - Instant ingest of rolling 90-day **NASA POWER** agroclimatology.
   - Soil moisture extraction from **NASA SMAP L4 (SPL4SMGP 9 km)**.
   - Soil baseline from **ISRIC SoilGrids REST** (clay loam, pH baseline).
2. **Deterministic Agronomic Rotation Engine**:
   - Covers all 3 Bangladesh cropping seasons: **Rabi (শীতকাল)**, **Kharif-1 (গ্রীষ্মকাল)**, and **Kharif-2 (বর্ষাকাল)**.
   - Enforces biological diversity: **no consecutive same-family plantings** (breaks pest and pathogen cycles).
   - Enforces soil regeneration: **mandatory biological nitrogen-fixing legume** (*Fabaceae*: lentil, chickpea, mung bean) every agricultural year.
   - Dynamic weight shifting for farmer priorities: **Balanced**, **Conserve Water**, or **Restore Nitrogen**.
3. **PWA & True Offline Airplane Mode**:
   - Workbox and Service Worker precache app shell and visited OpenStreetMap tiles.
   - All generated 4-year plans, farm metadata, and NASA telemetry persist in browser IndexedDB.
   - Seamless offline viewing in the field with offline indicator banner.
4. **Radical Transparency & Scientific Honesty**:
   - **No Black-Box ML**: Explainable scoring formulas documented in [`docs/scoring.md`](docs/scoring.md).
   - **No Precise Illusions**: Water savings and nitrogen gains are displayed as sourced ranges (e.g. *15% – 25% lower irrigation demand*), never false single numbers.
   - **Explicit Disclaimer**: The UI prominently states that *NASA SMAP's 9 km resolution provides regional hydrological context, not field truth*.
5. **Accessibility for Delta Farmers**:
   - Dual-language support (**বাংলা** / **English**).
   - WCAG AAA High-Contrast Mode toggle (bold yellow on black).
   - Font scaling (A / A+) and 48px touch targets for low-end mobile devices.

---

## 🛰️ NASA Data Attribution & Science Basis

TerraShift directly operationalizes Earth observation assets from NASA and international science bodies:

| NASA / Scientific Asset | Parameter / Product | Spatial / Temporal Resolution | Role in TerraShift |
| :--- | :--- | :--- | :--- |
| **NASA POWER** | `T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`, `ALLSKY_SFC_SW_DWN`, `RH2M`, `WS2M` | $0.5^\circ \times 0.5^\circ$, Daily (90-day rolling window) | Daily rainfall, solar radiation, heat-day accumulation ($T_{max} \ge 33^\circ\text{C}$), and temperature stress monitoring. |
| **NASA SMAP L4** | `SPL4SMGP` (Surface $0-5\text{ cm}$, Rootzone $0-100\text{ cm}$) | 9 km, 3-hourly assimilation | Hydrological context for rootzone water deficit; prevents planting water-intensive crops in dry Rabi. |
| **FAO-56 Penman-Monteith** | Reference Evapotranspiration ($ET_0$) | Daily ($mm/day$) | Derived from NASA POWER inputs; provides atmospheric evaporative demand benchmark. Stored as `FAO56-PM-from-POWER`. |
| **ISRIC SoilGrids** | Texture fractions (clay, silt, sand) & pH | 250 m digital soil map | Estimated baseline soil profile without requiring physical soil testing. |

---

## 🏗️ Architecture & Monorepo Structure

```
terrashift/
├── apps/
│   ├── web/                    # Next.js 14 PWA (App Router, Tailwind CSS, Leaflet, IndexedDB)
│   ├── api/                    # Express 4 + TypeScript REST API (Zod, JWT, bcrypt, helmet, rate-limit)
│   └── worker/                 # Python 3 Ingest Worker (power.py, smap.py, et0.py, soilgrids.py)
├── packages/
│   └── engine/                 # Deterministic Crop Rotation Engine & Bangladesh Crop Table
├── prisma/
│   ├── schema.prisma           # Prisma 5 Data Model with PostGIS Support
│   └── migrations/             # PostGIS extension & spatial migration
├── docs/
│   ├── scoring.md              # Agronomic formulas, component weights, and confidence logic
│   ├── crop-table-sources.md   # Peer-reviewed research citations (BARI, BRRI, BWMRI, BJRI, FAO)
│   └── demo-script.md          # 2-minute video presentation and demo walkthrough
├── docker-compose.yml          # Production multi-container composition
└── .env.example                # Template for environment variables
```

---

## ⚡ Quickstart Guide (One-Command Setup)

### Option A: Local Development Run

**Prerequisites**: Node.js 18+ (tested on Node 20 & 24), Python 3.11+, npm.

```bash
# 1. Clone repository
git clone https://github.com/AgroNova/terrashift.git
cd terrashift

# 2. Install monorepo dependencies
npm install

# 3. Build rotation engine
npm run build:engine

# 4. Start API backend (runs on http://localhost:4000)
npm run dev:api

# 5. In a second terminal, start Next.js PWA (runs on http://localhost:3000)
npm run dev:web
```

### Option B: Docker Compose (Full Stack with PostGIS & Redis)

```bash
# Start PostgreSQL/PostGIS, Redis, API, Worker, and Web frontend
docker compose up --build

# Run initial PostGIS migration
npx prisma migrate deploy
```

---

## 🧪 Testing & Validation

All components have automated test suites:

```bash
# Run Rotation Engine Vitest unit tests (rotation constraints, legume check, scoring)
npm run test:engine

# Run API integration tests (auth, ownership isolation, persistence)
npm run test:api

# Run Python Ingest pytest tests (POWER -999 fill value handling, FAO-56 worked example, SMAP fallback)
npm run test:worker
# or: pytest apps/worker/tests -v
```

---

## 🌾 Pilot Farm Coordinates (Bangladesh Delta)

- **Primary Pilot Farm (Rafiq)**: Barisal Delta ($22.7010^\circ\text{N}, 90.3535^\circ\text{E}$)
- **Jessore Southwest Region**: ($23.1664^\circ\text{N}, 89.2081^\circ\text{E}$)
- **Bogura North Bengal**: ($24.8465^\circ\text{N}, 89.3777^\circ\text{E}$)
- **Mymensingh Old Brahmaputra**: ($24.7471^\circ\text{N}, 90.4203^\circ\text{E}$)

---

## 👥 Team AgroNova • NASA Space Apps 2026

*Dedicated to climate resilience and food security for smallholder farmers across Bangladesh.*
