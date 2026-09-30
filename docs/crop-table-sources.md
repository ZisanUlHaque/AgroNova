# TerraShift Starter Crop Agronomic Database & Citations

**NASA Space Apps 2026 | Field Shift: Adapting Farms with NASA Data | Team AgroNova**

---

## 1. Scientific Basis & Methodology

All physiological thresholds, water demand ratings, biological nitrogen fixation (BNF) values, and heat tolerance limits in `packages/engine/crops.json` are compiled from peer-reviewed agricultural literature, technical manuals from the **Bangladesh Agricultural Research Institute (BARI)**, the **Bangladesh Rice Research Institute (BRRI)**, the **Bangladesh Jute Research Institute (BJRI)**, the **Bangladesh Wheat and Maize Research Institute (BWMRI)**, the **Food and Agriculture Organization (FAO)**, and the **International Rice Research Institute (IRRI)**.

---

## 2. Crop Metadata and Citations

### 2.1 Boro Rice (*Oryza sativa*)
- **Family**: *Poaceae* (Gramineae)
- **Season**: Rabi (Transplanted Dec–Jan, Harvested Apr–May)
- **Recommended Varieties**: BRRI dhan28, BRRI dhan29, BRRI dhan89
- **Water Demand (5/5 - Very High)**: Requires 1,000–1,400 mm of irrigation throughout the dry season.
  - *Source*: BRRI Irrigation and Water Management Division (2022), *"Water Management for Boro Rice Cultivation"*.
- **Heat Tolerance (35°C)**: High temperatures (>35°C) during anthesis/flowering cause spikelet sterility and yield loss.
  - *Source*: IRRI Technical Bulletin No. 14, *"High Temperature Stress in Rice at Flowering"*.
- **Soil Preference**: Clay, Clay Loam, Silty Clay (pH 5.5 – 7.5). High water retention capacity essential.
- **Nitrogen Dynamic**: High extractor; depletes 80–120 kg N/ha without rotation.
- **Rotation Rule**: Must be rotated with non-Poaceae crops (e.g. pulses or oilseeds) to break brown planthopper (*Nilaparvata lugens*) cycles.

---

### 2.2 T. Aman Rice (*Oryza sativa*)
- **Family**: *Poaceae*
- **Season**: Kharif-2 (Transplanted Jul–Aug, Harvested Nov–Dec)
- **Recommended Varieties**: BRRI dhan49, BRRI dhan87, Bina dhan-7
- **Water Demand (4/5 - High)**: 800–1,100 mm, largely met by monsoon rains.
  - *Source*: BRRI Cropping Systems Division (2023), *"Rainfed Lowland Rice Environments of the Bengal Delta"*.
- **Heat Tolerance (36°C)**: Broad monsoon vegetative heat tolerance; sensitive to drought during reproductive stage.
- **Soil Preference**: Clay Loam, Silt Loam, Alluvial Delta Soils (pH 5.0 – 7.5).
- **Nitrogen Dynamic**: High extractor (60–90 kg N/ha).
- **Rotation Rule**: Backbone delta crop; followed by dry Rabi legume or oilseed to restore soil nitrogen.

---

### 2.3 Aus Rice (*Oryza sativa*)
- **Family**: *Poaceae*
- **Season**: Kharif-1 (Sown Mar–Apr, Harvested Jun–Jul)
- **Recommended Varieties**: BRRI dhan48, BRRI dhan82
- **Water Demand (3/5 - Moderate)**: 500–700 mm; relies on pre-monsoon showers and supplementary irrigation.
  - *Source*: BRRI Annual Report (2021).
- **Heat Tolerance (36°C)**: Adapted to high pre-monsoon temperatures.
- **Soil Preference**: Loam, Sandy Loam, Clay Loam (pH 5.5 – 7.2).
- **Rotation Rule**: Cannot precede or follow another *Poaceae* cereal without a legume break.

---

### 2.4 Wheat (*Triticum aestivum*)
- **Family**: *Poaceae*
- **Season**: Rabi (Sown mid-Nov, Harvested Mar)
- **Recommended Varieties**: BARI Gom-30, BARI Gom-33 (Wheat blast resistant)
- **Water Demand (2/5 - Low)**: 250–350 mm (2–3 light irrigations), consuming 60% less water than Boro rice.
  - *Source*: BWMRI Annual Report (2022), *"Comparative Water Productivity of Wheat vs Boro Rice in Northern and Delta Bangladesh"*.
- **Heat Tolerance (30°C)**: Highly vulnerable to terminal heat (>30°C in late February/March during grain filling).
  - *Source*: CIMMYT-Bangladesh Agronomy Series (2020).
- **Soil Preference**: Well-drained Loam, Sandy Loam (pH 6.0 – 7.5). Intolerant of waterlogging.
- **Rotation Rule**: Never follow Boro rice consecutively. Excellent rotation partner after T. Aman and before Mung Bean.

---

### 2.5 Mustard (*Brassica napus / Brassica campestris*)
- **Family**: *Brassicaceae*
- **Season**: Rabi (Short 75–85 day window, Nov–Jan)
- **Recommended Varieties**: BARI Sarisha-14, BARI Sarisha-17, Binasarisha-9
- **Water Demand (2/5 - Low)**: 180–220 mm (1–2 light irrigations).
  - *Source*: BARI Oilseed Research Center (2021), *"Mustard Production Technologies in Bangladesh"*.
- **Heat Tolerance (32°C)**: Requires cool winter nights; excessive early heat reduces branching.
- **Soil Preference**: Sandy Loam, Loam (pH 5.8 – 7.5).
- **Rotation Rule**: Biofumigation benefits; root glucosinolates suppress soil-borne fungal pathogens (*Rhizoctonia*, *Fusarium*). Followed by Boro or Aus rice.

---

### 2.6 Lentil (*Lens culinaris*)
- **Family**: *Fabaceae*
- **Season**: Rabi (Sown Nov, Harvested Feb–Mar)
- **Recommended Varieties**: BARI Masur-8, BARI Masur-9
- **Water Demand (2/5 - Low)**: 150–200 mm; typically grown on residual soil moisture after T. Aman.
  - *Source*: BARI Pulses Research Center (2020), *"Pulse Production Guide for Smallholders"*.
- **Heat Tolerance (32°C)**: Sensitive to terminal drought and heat stress.
- **Biological Nitrogen Fixation (35 – 65 kg N/ha)**:
  - *Source*: People, M.B., et al., *"Quantification of biological nitrogen fixation by legumes in Asian farming systems"*, Plant and Soil (FAO cited).
- **Soil Preference**: Loam, Clay Loam, Calcareous Alluvium (pH 6.0 – 7.8).
- **Rotation Rule**: Enriches rootzone soil with organic nitrogen for the next cereal crop.

---

### 2.7 Chickpea (*Cicer arietinum*)
- **Family**: *Fabaceae*
- **Season**: Rabi (Sown Nov, Harvested Mar)
- **Recommended Varieties**: BARI Chola-9, BARI Chola-10
- **Water Demand (1/5 - Very Low)**: 120–180 mm; deep taproot utilizes receding groundwater table in Barind and delta soils.
  - *Source*: ICRISAT & BARI Pulses Center (2021), *"Drought Tolerant Pulses for South Asian Cropping Systems"*.
- **Heat Tolerance (33°C)**: Higher thermal tolerance than lentil.
- **Biological Nitrogen Fixation (40 – 75 kg N/ha)**:
  - *Source*: BARI Research Report on Rhizobial Inoculation in Delta Soils (2021).
- **Soil Preference**: Well-drained Clay Loam, Loam (pH 6.2 – 8.0).
- **Rotation Rule**: Mandatory legume for dryland rotations; prevents cereal root-rot diseases.

---

### 2.8 Mung Bean (*Vigna radiata*)
- **Family**: *Fabaceae*
- **Season**: Kharif-1 / Early Kharif-2 (Short 60-day summer crop, Mar–May)
- **Recommended Varieties**: BARI Mung-6, Binamung-8
- **Water Demand (2/5 - Low)**: 180–250 mm; tolerates high heat.
  - *Source*: BARI Pulses Division (2022), *"Summer Mungbean: The Golden Relay Crop of Southern Delta"*.
- **Heat Tolerance (38°C)**: High heat tolerance; thrives in hot pre-monsoon conditions.
- **Biological Nitrogen Fixation (30 – 60 kg N/ha)**:
  - Leaves green stover incorporated into soil as green manure before T. Aman transplanting.
- **Soil Preference**: Sandy Loam, Loam, Silty Loam (pH 6.0 – 7.5).
- **Rotation Rule**: Ideal catch-crop between Rabi harvest and Kharif-2 monsoon rice.

---

### 2.9 Jute (*Corchorus olitorius / Corchorus capsularis*)
- **Family**: *Malvaceae*
- **Season**: Kharif-1 (Sown Apr, Harvested Jul–Aug)
- **Recommended Varieties**: BJRI Deshi Pat-8, O-9897
- **Water Demand (3/5 - Moderate)**: 450–600 mm; retting requires surface water bodies.
  - *Source*: BJRI Agronomy Division (2022), *"Jute Cultivation and Soil Health Restoration"*.
- **Heat Tolerance (38°C)**: Excellent vegetative heat tolerance.
- **Soil Preference**: Alluvial Loam, Clay Loam (pH 5.5 – 7.2).
- **Organic Biomass Addition**: Sheds 3–4 t/ha of green leaf litter during 120-day growth, restoring humus and soil structure.
- **Rotation Rule**: Excellent rotation ahead of T. Aman. Disallowed following other Malvaceae.

---

### 2.10 Maize (*Zea mays*)
- **Family**: *Poaceae*
- **Season**: Rabi & Kharif-1
- **Recommended Varieties**: BARI Hybrid Maize-9, NK40
- **Water Demand (3/5 - Moderate)**: 400–550 mm (substantially lower than Boro rice).
  - *Source*: BARI Plant Breeding Division (2023).
- **Heat Tolerance (36°C)**: Sensitive to heat stress (>38°C) during silking and tasseling.
- **Soil Preference**: Deep Loam, Sandy Loam (pH 5.8 – 7.2). Sensitive to waterlogging.
- **Rotation Rule**: High biomass producer; requires legume follow-up.

---

### 2.11 Potato (*Solanum tuberosum*)
- **Family**: *Solanaceae*
- **Season**: Rabi (Sown Nov, Harvested Jan–Feb)
- **Recommended Varieties**: BARI Alu-7 (Diamant), BARI Alu-8 (Cardinal)
- **Water Demand (3/5 - Moderate)**: 300–400 mm (shallow root system requires regular light irrigation).
  - *Source*: BARI Tuber Crops Research Center (2022).
- **Heat Tolerance (30°C)**: Tuberization severely inhibited above 25–28°C; foliage damaged above 30°C.
- **Soil Preference**: Loose Sandy Loam, Loam (pH 5.2 – 6.8).
- **Rotation Rule**: Minimum 1-year break to avoid bacterial wilt (*Ralstonia solanacearum*) and late blight (*Phytophthora infestans*).
