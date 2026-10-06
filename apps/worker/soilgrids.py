import requests
import math
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
        
        def valid_value(value: Any, maximum: float) -> bool:
            return (
                isinstance(value, (int, float))
                and math.isfinite(value)
                and 0 <= value <= maximum
            )

        # SoilGrids reports pH multiplied by 10 and texture fractions in g/kg.
        raw_ph = extracted.get("phh2o")
        ph = round(raw_ph / 10.0, 1) if valid_value(raw_ph, 140) else None
        clay_raw = extracted.get("clay")
        sand_raw = extracted.get("sand")
        silt_raw = extracted.get("silt")
        clay_pct = clay_raw / 10.0 if valid_value(clay_raw, 1000) else None
        sand_pct = sand_raw / 10.0 if valid_value(sand_raw, 1000) else None
        silt_pct = silt_raw / 10.0 if valid_value(silt_raw, 1000) else None
        texture_class = (
            classify_usda_texture(sand_pct, clay_pct, silt_pct)
            if clay_pct is not None and sand_pct is not None and silt_pct is not None
            else None
        )

        if ph is None and texture_class is None:
            return unavailable_soilgrids("SoilGrids returned no valid soil properties for this point.")
        
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
    except Exception as error:
        return unavailable_soilgrids(
            f"SoilGrids query failed ({type(error).__name__}); no default soil values were substituted."
        )


def unavailable_soilgrids(warning: str) -> Dict[str, Any]:
    return {
        "source": "ISRIC_SOILGRIDS_UNAVAILABLE",
        "soilSource": "UNAVAILABLE",
        "soilPh": None,
        "soilTexture": None,
        "clayPercent": None,
        "sandPercent": None,
        "siltPercent": None,
        "warning": warning,
        "disclaimer": "SoilGrids data are unavailable; a field or laboratory soil test is recommended.",
    }
