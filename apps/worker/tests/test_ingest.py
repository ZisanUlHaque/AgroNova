import pytest
from et0 import compute_daily_et0, calculate_saturation_vapor_pressure, calculate_psychrometric_constant
from power import generate_fallback_power_data, process_power_payload
from smap import extract_nearest_smap_cell, fetch_smap_soil_moisture
from soilgrids import fetch_isric_soilgrids

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
                "T2MDEW": {"20260901": 18.0, "20260902": -999.0, "20260903": 19.0},
                "PRECTOTCORR": {"20260901": 15.0, "20260902": -999.0, "20260903": 0.0},
                "ALLSKY_SFC_SW_DWN": {"20260901": 18.5, "20260902": -999.0, "20260903": 19.2},
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
    res = fetch_smap_soil_moisture(22.7010, 90.3535, username="", password="")
    assert res["product"] == "SPL4SMGP"
    assert res["resolution"] == "9 km"
    assert res["source"] == "NASA_EARTHDATA_UNAVAILABLE"
    assert res["smSurface"] is None
    assert res["smRootzone"] is None
    assert "not fabricated" in res["warning"]


def test_power_failure_does_not_return_fabricated_weather_values():
    result = generate_fallback_power_data(
        22.701,
        90.3535,
        "20260901",
        "20260930",
        "network unavailable",
    )

    assert result["source"] == "NASA_POWER_UNAVAILABLE"
    assert result["meanTemp"] is None
    assert result["totalPrecip"] is None
    assert result["et0Mean"] is None


def test_smap_extracts_nearest_real_grid_cell(tmp_path):
    h5py = pytest.importorskip("h5py")
    import numpy as np

    path = tmp_path / "SMAP_L4_SM_gph_20261003T030000_Vv8032_001.h5"
    with h5py.File(path, "w") as granule:
        granule.create_dataset("cell_lat", data=np.array([[22.6, 22.7], [22.8, 22.9]]))
        granule.create_dataset("cell_lon", data=np.array([[90.2, 90.35], [90.4, 90.5]]))
        geophysical = granule.create_group("Geophysical_Data")
        geophysical.create_dataset("sm_surface", data=np.array([[0.2, 0.31], [0.4, -9999.0]]))
        geophysical.create_dataset("sm_rootzone", data=np.array([[0.25, 0.36], [0.45, -9999.0]]))

    result = extract_nearest_smap_cell(str(path), 22.701, 90.3535)

    assert result["source"] == "NASA_EARTHDATA_LIVE"
    assert result["smSurface"] == 0.31
    assert result["smRootzone"] == 0.36
    assert result["smapGranuleDate"] == "2026-10-03"
    assert result["nearestCellDistanceKm"] < 1


def test_soilgrids_failure_does_not_return_estimated_measurements(monkeypatch):
    def fail_request(*args, **kwargs):
        raise TimeoutError("SoilGrids is unavailable")

    monkeypatch.setattr("soilgrids.requests.get", fail_request)
    result = fetch_isric_soilgrids(22.701, 90.3535)

    assert result["source"] == "ISRIC_SOILGRIDS_UNAVAILABLE"
    assert result["soilSource"] == "UNAVAILABLE"
    assert result["soilPh"] is None
    assert result["soilTexture"] is None
    assert "no default soil values" in result["warning"]
