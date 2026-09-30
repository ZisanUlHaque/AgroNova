import requests
from typing import Dict, Any

SOILGRIDS_REST_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"

def classify_usda_texture(sand: float, clay: float, silt: float) -> str:
    """
    Estimates USDA soil texture classification based on clay, silt, and sand percentages.
    """
    if clay >= 40:
        if sand <= 45 and silt <= 40:
            return "clay"
        elif silt >= 40:
            return "silty_clay"
        else:
            return "sandy_clay"
    elif clay >= 27:
        if sand <= 20:
            return "silty_clay_loam"
        elif sand <= 45:
            return "clay_loam"
        else:
            return "sandy_clay_loam"
    elif silt >= 50:
        return "silt_loam"
    elif sand >= 70:
        return "sandy_loam"
    else:
        return "loam"

def fetch_isric_soilgrids(latitude: float, longitude: float, timeout_sec: int = 10) -> Dict[str, Any]:
    """
    Fetches soil pH and texture fractions (clay, sand, silt) from ISRIC SoilGrids REST API.
    Marks soilSource = "ESTIMATED".
    """
    params = {
        "lat": f"{latitude:.4f}",
        "lon": f"{longitude:.4f}",
        "property": ["phh2o", "clay", "sand", "silt"],
        "depth": ["0-5cm", "5-15cm"],
        "value": "mean"
    }
    
    try:
        res = requests.get(SOILGRIDS_REST_URL, params=params, timeout=timeout_sec)
        res.raise_for_status()
        data = res.json()
        
        layers = data.get("properties", {}).get("layers", [])
        extracted = {}
        for layer in layers:
            name = layer.get("name")
            depths = layer.get("depths", [])
            if depths:
                mean_val = depths[0].get("values", {}).get("mean")
                extracted[name] = mean_val
                
        # SoilGrids returns pH * 10 (e.g. 65 = 6.5)
        raw_ph = extracted.get("phh2o")
        ph = round(raw_ph / 10.0, 1) if raw_ph else 6.6
        
        # Textures returned in g/kg (divide by 10 for %)
        clay_pct = (extracted.get("clay", 320) or 320) / 10.0
        sand_pct = (extracted.get("sand", 280) or 280) / 10.0
        silt_pct = (extracted.get("silt", 400) or 400) / 10.0
        
        texture_class = classify_usda_texture(sand_pct, clay_pct, silt_pct)
        
        return {
            "source": "ISRIC_SOILGRIDS_REST",
            "soilSource": "ESTIMATED",
            "soilPh": ph,
            "soilTexture": texture_class,
            "clayPercent": clay_pct,
            "sandPercent": sand_pct,
            "siltPercent": silt_pct,
            "disclaimer": "SoilGrids baseline estimated from global digital soil mapping"
        }
    except Exception as e:
        # Fallback to authentic Bangladesh delta alluvium profile (clay loam, pH 6.8)
        return {
            "source": "DELTA_ALLUVIUM_BASELINE_FALLBACK",
            "soilSource": "ESTIMATED",
            "soilPh": 6.8,
            "soilTexture": "clay_loam",
            "clayPercent": 34.0,
            "sandPercent": 26.0,
            "siltPercent": 40.0,
            "disclaimer": "Default Bangladesh delta alluvial soil baseline"
        }
