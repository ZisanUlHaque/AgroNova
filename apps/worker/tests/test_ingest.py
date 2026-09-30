import pytest
from et0 import compute_daily_et0, calculate_saturation_vapor_pressure, calculate_psychrometric_constant
from power import process_power_payload
from smap import fetch_smap_soil_moisture

def test_fao56_penman_monteith_standard_example():
    """
    Test against standard FAO-56 worked benchmark conditions:
    For Tmax=28.5, Tmin=18.0, RH=68%, u2=2.1 m/s, Rs=22.0 MJ/m2/day at sea level,
    standard FAO-56 ET0 yields approximately 4.5 to 5.2 mm/day.
    """
    t_max = 28.5
    t_min = 18.0
    rh = 68.0
    u2 = 2.1
    solar_rad = 22.0
    
    et0 = compute_daily_et0(t_max, t_min, rh, u2, solar_rad, elevation_m=10.0)
    assert 4.0 <= et0 <= 5.5, f"Expected ET0 between 4.0 and 5.5 mm/day, got {et0}"

def test_power_fill_value_negative_999_handling():
    """
    NASA POWER uses -999 as fill value when data is missing.
    Verify that process_power_payload handles -999 without corrupting calculations.
    """
    mock_payload = {
        "properties": {
            "parameter": {
                "T2M": {"20260901": 25.0, "20260902": -999.0, "20260903": 27.0},
                "T2M_MAX": {"20260901": 30.0, "20260902": -999.0, "20260903": 34.0},
                "T2M_MIN": {"20260901": 20.0, "20260902": -999.0, "20260903": 22.0},
                "PRECTOTCORR": {"20260901": 15.0, "20260902": -999.0, "20260903": 0.0},
                "ALLSKY_SFC_SW_DWN": {"20260901": 18.5, "20260902": -999.0, "20260903": 19.2},
                "RH2M": {"20260901": 75.0, "20260902": -999.0, "20260903": 70.0},
                "WS2M": {"20260901": 1.8, "20260902": -999.0, "20260903": 2.0}
            }
        }
    }
    
    result = process_power_payload(mock_payload, "20260901", "20260903")
    
    # Valid temperatures were 25.0 and 27.0 -> mean should be 26.0
    assert result["meanTemp"] == 26.0
    # Valid precip was 15.0 and 0.0 -> sum should be 15.0
    assert result["totalPrecip"] == 15.0
    # Heat days: 34.0 >= 33.0 -> 1 heat day
    assert result["heatDays"] == 1
    assert result["recentMaxTemp"] == 34.0
    assert result["et0Mean"] > 0

def test_smap_sample_granule_fallback():
    """
    Verify SMAP L4 extraction returns valid regional soil moisture
    and properly includes 9 km disclaimer as required by PRD.
    """
    res = fetch_smap_soil_moisture(22.7010, 90.3535)
    assert res["product"] == "SPL4SMGP"
    assert res["resolution"] == "9 km"
    assert 0.1 <= res["smSurface"] <= 0.6
    assert 0.1 <= res["smRootzone"] <= 0.6
    assert "9 km regional" in res["disclaimer"]
    assert res["smapGranuleDate"] is not None
