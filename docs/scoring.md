# TerraShift Agronomic Scoring & Rotation Logic

**NASA Space Apps 2026 | Field Shift: Adapting Farms with NASA Data | Team AgroNova**

---

## 1. Overview & Objective

TerraShift generates actionable, deterministic, and explainable **4-year (12-season)** crop rotation sequences for smallholder farmers in Bangladesh. The engine evaluates local agroclimatology from **NASA POWER**, regional soil moisture from **NASA SMAP L4 (SPL4SMGP)**, reference evapotranspiration ($ET_0$) via the **FAO-56 Penman-Monteith** method, and baseline soil data from **ISRIC SoilGrids**.

---

## 2. Bangladesh Cropping Seasons

Cropping patterns in Bangladesh are governed by the three distinct agronomic seasons:

| Season | Calendar Months | Typical Climatic Conditions | Dominant Crops |
| :--- | :--- | :--- | :--- |
| **Rabi** | November – February | Cool, dry, minimal rainfall (<40 mm), groundwater-dependent | Boro Rice, Wheat, Mustard, Lentil, Chickpea, Potato, Maize |
| **Kharif-1** | March – June | Hot, high evaporative demand, pre-monsoon showers / Nor'westers | Aus Rice, Mung Bean, Jute, Maize |
| **Kharif-2** | June – October | Monsoon, heavy precipitation (>1,200 mm), flood risk, high humidity | T. Aman Rice, Late Mung Bean |

---

## 3. Allowed Candidate Transitions (Rules)

Before scoring, candidate sequences must pass strict agronomic safety constraints:

1. **No Consecutive Same-Family Crops**:
   - Monoculture or planting the same botanical family consecutively (e.g., *Poaceae* $\to$ *Poaceae* such as Boro Rice $\to$ Aus Rice, or *Fabaceae* $\to$ *Fabaceae*) is strictly disallowed to disrupt insect, nematode, and fungal pest cycles.
2. **Mandatory Legume Requirement**:
   - Every agricultural year (3 consecutive seasons) must contain **at least one nitrogen-fixing legume** (*Fabaceae*: Lentil, Chickpea, or Mung Bean) to replenish organic nitrogen and counter soil depletion.
3. **Water Stress Guardrails**:
   - If NASA SMAP rootzone moisture is severely depleted ($\theta_{\text{root}} < 0.22\ \text{m}^3/\text{m}^3$) or recent POWER rainfall is critically low, water-guzzling crops (e.g., Boro Rice with water demand 5/5) are restricted during the dry Rabi season in favor of water-saving pulses and oilseeds.

---

## 4. Multi-Criteria Scoring Model

Each valid sequence candidate is scored from $0$ to $100$ based on four weighted agronomic components:

$$\text{Score} = 100 \times \sum_{i} \left( w_i \times C_i \right)$$

Where $C_i \in [0, 1]$ represents each component fit:

### 4.1 Water Fit ($w = 0.35$)
Evaluates the balance between crop water demand and available moisture from precipitation, satellite rootzone moisture, and evaporative deficit:

$$\text{Water Availability Index} = \text{clamp}\left(1.5 \cdot \theta_{\text{root}} + \frac{P_{90}}{400} - \frac{ET_0}{10.0},\ 0.1,\ 1.0\right)$$

$$\text{Water Fit} = 1.0 - \left| \frac{\text{Water Demand}}{5.0} - \text{Water Availability Index} \right|$$

- **Incentive**: During dry Rabi periods with low moisture availability, drought-tolerant crops (Chickpea, Lentil, Mustard) receive a matching bonus.

### 4.2 Soil Fit ($w = 0.25$)
Evaluates suitability against soil texture and pH:
- **Texture Match**: Checks if the soil texture (e.g. *clay loam*, *silt loam*, *sandy loam*) aligns with the crop's physiological root system.
- **pH Optimal Range**: Scores $1.0$ if within optimal pH, with linear attenuation if acidic or alkaline.
- **Neutral Baseline**: If soil data is default or unmeasured, the soil component defaults to neutral $0.5$ as specified in PRD Section 7.3.

### 4.3 Nitrogen Benefit ($w = 0.25$)
Quantifies biological nitrogen fixation (BNF) and rotational fertility carryover:
- **Legumes (*Fabaceae*)**: Normalized by biological fixation capacity ($30 - 75\ \text{kg N/ha}$):
  $$\text{N Fit}_{\text{legume}} = 0.4 + \left(\frac{\text{Mean BNF}}{75}\right) \times 0.6$$
- **Cereals/Non-legumes following a Legume**: Receive a $0.70$ fertility bonus reflecting residual soil nitrogen and organic matter.
- **Standard Non-legumes**: Scored at baseline $0.30$.

### 4.4 Heat Risk ($w = 0.15$)
Evaluates thermal vulnerability during flowering and grain-filling:
- Compares NASA POWER recent daily maximum temperature ($T2M\_MAX$) against crop thermal threshold:
  - If $T2M\_MAX \le \text{Threshold} - 3^\circ\text{C}$: Safe ($1.0$).
  - If $\text{Threshold} - 3^\circ\text{C} < T2M\_MAX \le \text{Threshold}$: Moderate caution ($0.70$).
  - If $T2M\_MAX > \text{Threshold}$: Temperature stress penalty applied proportional to excess.

---

## 5. Goal Weight Shifts

Farmers can shift optimization priorities based on their immediate field conditions:

| Component | Balanced (Default) | Conserve Water | Restore Nitrogen |
| :--- | :---: | :---: | :---: |
| **Water Fit** | **0.35** | **0.50** | **0.25** |
| **Soil Fit** | **0.25** | **0.20** | **0.20** |
| **Nitrogen Benefit** | **0.25** | **0.15** | **0.40** |
| **Heat Risk** | **0.15** | **0.15** | **0.15** |

---

## 6. Confidence Level Classification

To prevent overpromising and ensure scientific transparency:

- **HIGH**:
  - NASA POWER data is fresh ($< 24\ \text{hours}$).
  - NASA SMAP L4 soil moisture is fresh ($< 7\ \text{days}$).
  - Farmer has entered lab or field-tested soil pH / texture (`MEASURED`).
- **MEDIUM**:
  - Live NASA satellite climate and SMAP moisture are fresh.
  - Soil baseline is derived from ISRIC SoilGrids global digital soil mapping (`ESTIMATED`).
- **LOW**:
  - Any NASA satellite source is missing, stale, or network-disconnected. Default climatological baselines are utilized.

---

## 7. Honest Ranges vs. Precise Illusions

In compliance with PRD Section 7.3:
- Estimates of **water savings** and **nitrogen gains** are always presented as **honest ranges** (e.g. *"15% – 25% lower irrigation demand"* and *"45 – 70 kg biological N/ha per year"*), never single deterministic numbers that mislead farmers.
- The UI explicitly highlights:
  > **"NASA SMAP 9 km soil moisture provides regional hydrological context, not field truth."**
