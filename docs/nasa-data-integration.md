# NASA Earth Observation Integration & Processing Pipeline

**NASA Space Apps Challenge 2026 | Field Shift: Adapting Farms with NASA Data | Team AgroNova**

---

## 1. Executive Overview

TerraShift operationalizes direct Earth observations from NASA to empower delta smallholders. This document provides a transparent, reproducible breakdown of how raw NASA telemetry is ingested, sanitized, geolocated, and processed into actionable agronomic metrics.

```
                           NASA DATASETS (DIRECT SATELLITE EO)
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                 │
 │   🛰️ NASA SMAP L4 (SPL4SMGP)                      🛰️ NASA POWER Daily AG         │
 │   - Global 9 km EASE-Grid 2.0                     - 0.5° × 0.5° Spatial Grid     │
 │   - Surface Soil Moisture (0–5 cm)                - Air Temp: T2M, T2M_MAX, MIN  │
 │   - Rootzone Soil Moisture (0–100 cm)             - Dewpoint: T2MDEW             │
 │   - 3-hourly Assimilation                         - Insolation: SW_DWN           │
 │                                                   - Precipitation: PRECTOTCORR   │
 │                                                   - Wind Speed: WS2M             │
 └──────────────────────┬──────────────────────────────────────────┬───────────────┘
                        │                                          │
                        ▼                                          ▼
 ┌──────────────────────────────────────────────┐  ┌───────────────────────────────┐
 │ Nearest-Cell Spherical Extraction (smap.py)  │  │ FAO-56 Penman-Monteith (et0.py│
 │ - Haversine spherical geodesic search        │  │ - Daily vapor pressure curve  │
 │ - Bounds check [0.0, 1.0 m3/m3]              │  │ - Net radiation balance       │
 │ - Fill value & latency sanitation            │  │ - Reference ET0 (mm/day)      │
 └──────────────────────┬───────────────────────┘  └───────────────┬───────────────┘
                        │                                          │
                        └───────────────────┬──────────────────────┘
                                            │
                                            ▼
                        ┌───────────────────────────────────────┐
                        │    Unified Agro-Ecological Context    │
                        │        (apps/worker/worker.py)        │
                        └───────────────────┬───────────────────┘
                                            │
                        ┌───────────────────┴───────────────────┐
                        │                                       │
                        ▼                                       ▼
       [ NON-NASA DATASETS: STRICTLY SEPARATE ]     [ RESTful Ingest Cache / DB ]
       - ISRIC SoilGrids REST (250m ML soil map)       Prisma 5 PostGIS Storage
       - BARI / BRRI / BJRI / BWMRI Crop Baselines     Offline IndexedDB PWA Cache
       - OpenStreetMap Cartography                     Zero Server Network Mode
```

---

## 2. NASA SMAP L4 Soil Moisture Processing (`smap.py`)

### 2.1 Product Description
- **Product ID**: `SPL4SMGP` (SMAP L4 Global 3-hourly 9 km EASE-Grid Surface and Rootzone Soil Moisture Geophysical Data).
- **Spatial Resolution**: 9 km cylindrical equal-area grid (EASE-Grid 2.0).
- **Latency**: 2.5 to 3 days (assimilated with NASA Catchment Land Surface Model).

### 2.2 Variables Extracted
1. `/Geophysical_Data/sm_surface`: Volumetric soil moisture in top $0 - 5\text{ cm}$ ($\text{m}^3/\text{m}^3$).
2. `/Geophysical_Data/sm_rootzone`: Volumetric soil moisture across the active $0 - 100\text{ cm}$ crop rooting depth ($\text{m}^3/\text{m}^3$).
3. `/cell_lat` and `/cell_lon`: Geolocation arrays of the 9 km cell centers.

### 2.3 Spherical Nearest-Cell Indexing
Because SMAP EASE-Grid cells are distributed across a projected curvilinear grid, finding the closest cell to a farmer's coordinates $(\phi_{\text{farm}}, \lambda_{\text{farm}})$ requires geodesic minimization rather than naive planar Euclidean distance:

$$\Delta \lambda = (\lambda_{\text{cell}} - \lambda_{\text{farm}} + 180^\circ) \pmod{360^\circ} - 180^\circ$$
$$D^2 = (\phi_{\text{cell}} - \phi_{\text{farm}})^2 + \left(\Delta \lambda \times \cos\left(\frac{\pi \phi_{\text{farm}}}{180^\circ}\right)\right)^2$$
$$\text{Distance (km)} = 111.195 \times \sqrt{\min(D^2)}$$

```python
# Exact implementation in apps/worker/smap.py
distance_squared = (lat_delta * lat_delta + (lon_delta * np.cos(np.radians(latitude))) ** 2)
distance_squared[~valid] = np.inf
row, column = np.unravel_index(np.argmin(distance_squared), distance_squared.shape)
distance_km = 111.195 * np.sqrt(distance_squared[row, column])
```

### 2.4 Hydrological Role in Bengal Delta
- **Rabi Moisture Deficit Assessment**: In the post-monsoon dry season (November–February), rootzone moisture recedes from $>0.35\ \text{m}^3/\text{m}^3$ to $<0.20\ \text{m}^3/\text{m}^3$. A rootzone moisture below $0.22\ \text{m}^3/\text{m}^3$ indicates that cultivating water-intensive Boro rice will deplete aquifers and require continuous diesel pumping (~1,200 mm water). TerraShift uses this regional hydrological context to boost pulses (Lentil: $150\text{ mm}$, Chickpea: $120\text{ mm}$) and oilseeds (Mustard: $180\text{ mm}$).

---

## 3. NASA POWER Agroclimatology & Evapotranspiration (`power.py`, `et0.py`)

### 3.1 Parameters Ingested
Ingested via the NASA POWER Daily Point API (`https://power.larc.nasa.gov/api/temporal/daily/point`):
- `T2M`: Air Temperature at 2 Meters ($^\circ\text{C}$).
- `T2M_MAX`: Maximum Daily Air Temperature ($^\circ\text{C}$).
- `T2M_MIN`: Minimum Daily Air Temperature ($^\circ\text{C}$).
- `T2MDEW`: Dew Point Temperature at 2 Meters ($^\circ\text{C}$).
- `PRECTOTCORR`: Precipitation Corrected ($\text{mm/day}$).
- `ALLSKY_SFC_SW_DWN`: All-Sky Shortwave Surface Solar Irradiance ($\text{MJ/m}^2/\text{day}$).
- `WS2M`: Wind Speed at 2 Meters ($\text{m/s}$).

### 3.2 Fill-Value Sanitization
NASA POWER encodes missing values as `-999.0`. TerraShift explicitly parses every record, converting $\le -900$ entries to `None` and raising strict validity errors if fewer than $80\%$ of days in the 90-day window are valid, avoiding fabricated interpolations.

### 3.3 FAO-56 Penman-Monteith Implementation
Reference evapotranspiration ($ET_0$) represents the evaporative demand of the atmosphere independently of crop type and soil conditions:

$$ET_0 = \frac{0.408 \Delta (R_n - G) + \gamma \frac{900}{T_{\text{mean}} + 273} u_2 (e_s - e_a)}{\Delta + \gamma (1 + 0.34 u_2)}$$

Where:
- $\Delta = \frac{4098 \cdot e^\circ(T_{\text{mean}})}{(T_{\text{mean}} + 237.3)^2}$: Slope of saturation vapor pressure curve ($\text{kPa/}^\circ\text{C}$).
- $e^\circ(T) = 0.6108 \cdot \exp\left(\frac{17.27 T}{T + 237.3}\right)$: Saturation vapor pressure at temperature $T$ ($\text{kPa}$).
- $e_s = \frac{e^\circ(T_{\text{max}}) + e^\circ(T_{\text{min}})}{2}$: Mean saturation vapor pressure ($\text{kPa}$).
- $e_a = e^\circ(T_{\text{dew}})$: Actual vapor pressure derived from NASA POWER dewpoint ($\text{kPa}$).
- $(e_s - e_a)$: Vapor pressure deficit ($\text{VPD}$).
- $\gamma = 0.000665 \cdot P_{\text{atm}}$: Psychrometric constant ($\approx 0.066\ \text{kPa/}^\circ\text{C}$ at delta sea level).
- $R_n = 0.77 \cdot R_s - R_{nl}$: Net radiation derived from incoming shortwave solar radiation ($R_s$) and Stefan-Boltzmann net longwave balance ($R_{nl}$).

---

## 4. Landsat-Derived Evapotranspiration Framework

In addition to FAO-56 reference evapotranspiration, high-resolution thermal observations from the **Landsat 8 and Landsat 9 Thermal Infrared Sensor (TIRS)** provide field-scale Land Surface Temperature (LST, 100m resampled to 30m).

### 4.1 Integration Architecture
Through the Operational Simplified Surface Energy Balance (**SSEBop**) and **OpenET** methodology:
$$ET_a = ET_f \times ET_0$$
Where:
- $ET_a$: Actual crop evapotranspiration ($\text{mm/day}$).
- $ET_f = \frac{T_h - T_s}{T_h - T_c}$: Evaporative fraction ($0.0$ to $1.05$) derived from Landsat thermal radiance, where $T_s$ is the observed surface temperature, $T_h$ is the hot bare soil boundary, and $T_c$ is the cold vegetated canopy boundary.
- $ET_0$: The NASA POWER FAO-56 reference benchmark.

In TerraShift, Landsat thermal context confirms whether a field is actively transpiring or sitting fallow, validating crop calendar transitions without requiring manual farm surveys.

---

## 5. Strict Demarcation: NASA Data vs. External Non-NASA Data

To uphold scientific honesty, TerraShift strictly separates NASA observations from external reference datasets:

| Data Layer | Source Organization | Type | NASA Asset? | Explicit Role in TerraShift |
| :--- | :--- | :--- | :---: | :--- |
| **SMAP L4 (SPL4SMGP)** | NASA GSFC / NSIDC | Satellite Microwave EO | **YES** | Rootzone ($0-100\text{ cm}$) water deficit context. |
| **NASA POWER AG** | NASA LaRC | Satellite & Assimilation Climatology | **YES** | Rolling 90-day temperature, rain, solar radiation, heat days. |
| **Landsat 8/9 TIRS** | NASA / USGS | Satellite Thermal Infrared | **YES** | Land surface temperature and evaporative fraction calibration. |
| **ISRIC SoilGrids** | ISRIC, Wageningen, Netherlands | Global Digital Soil Map (ML) | **NO** | Baseline soil texture (clay, silt, sand %) and pH estimate. |
| **Crop Physiology Tables** | BARI, BRRI, BJRI, BWMRI (Bangladesh) | Agronomic Research Trials | **NO** | Sowing calendars, varietal heat thresholds, biological N fixation ranges. |
| **Cartography & Maps** | OpenStreetMap / Leaflet | Crowd-sourced GIS | **NO** | Offline base tile rendering and pin-drop interface. |
