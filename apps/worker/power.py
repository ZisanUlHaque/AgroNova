import datetime
import requests
from typing import Dict, Any, Optional, List
from et0 import compute_daily_et0_from_power

NASA_POWER_ENDPOINT = "https://power.larc.nasa.gov/api/temporal/daily/point"

def fetch_nasa_power_daily(
    latitude: float,
    longitude: float,
    days_window: int = 90,
    timeout_sec: int = 15
) -> Dict[str, Any]:
    """
    Fetches rolling daily agroclimatology data from NASA POWER API.
    Handles -999 fill values as None.
    Computes summary aggregates and FAO-56 ET0.
    """
    end_date = datetime.date.today() - datetime.timedelta(days=2) # POWER usually has 2-day latency
    start_date = end_date - datetime.timedelta(days=days_window - 1)
    
    start_str = start_date.strftime("%Y%m%d")
    end_str = end_date.strftime("%Y%m%d")
    
    params = {
        "parameters": "T2M,T2M_MAX,T2M_MIN,T2MDEW,PRECTOTCORR,ALLSKY_SFC_SW_DWN,WS2M",
        "community": "AG",
        "latitude": f"{latitude:.4f}",
        "longitude": f"{longitude:.4f}",
        "start": start_str,
        "end": end_str,
        "format": "JSON"
    }
    
    try:
        response = requests.get(NASA_POWER_ENDPOINT, params=params, timeout=timeout_sec)
        response.raise_for_status()
        payload = response.json()
        if not payload.get("properties", {}).get("parameter", {}).get("T2M"):
            raise ValueError("NASA POWER returned no daily observations for this point and period")
        return process_power_payload(payload, start_str, end_str, latitude, longitude)
    except Exception as err:
        # Fallback to authentic Bangladesh delta climatology
        return generate_fallback_power_data(latitude, longitude, start_str, end_str, str(err))

def process_power_payload(
    payload: Dict[str, Any],
    start_date: str,
    end_date: str,
    latitude: float = 22.7010,
    longitude: float = 90.3535
) -> Dict[str, Any]:
    """
    Processes NASA POWER JSON response, sanitizes -999 fill values, and computes aggregates.
    """
    props = payload.get("properties", {}).get("parameter", {})
    t2m_dict = props.get("T2M", {})
    t2m_max_dict = props.get("T2M_MAX", {})
    t2m_min_dict = props.get("T2M_MIN", {})
    t2m_dew_dict = props.get("T2MDEW", {})
    precip_dict = props.get("PRECTOTCORR", {})
    solar_dict = props.get("ALLSKY_SFC_SW_DWN", {})
    ws2m_dict = props.get("WS2M", {})
    
    dates = sorted(list(t2m_dict.keys()))
    
    valid_t2m = []
    valid_t2m_max = []
    valid_precip = []
    valid_solar = []
    et0_values = []
    heat_days = 0
    
    daily_records = []
    et0_records = []
    
    for d in dates:
        t = t2m_dict.get(d)
        t_max = t2m_max_dict.get(d)
        t_min = t2m_min_dict.get(d)
        dew_point = t2m_dew_dict.get(d)
        precip = precip_dict.get(d)
        solar = solar_dict.get(d)
        ws = ws2m_dict.get(d)
        
        # Sanitize NASA fill value -999
        t = None if t is None or t <= -900 else t
        t_max = None if t_max is None or t_max <= -900 else t_max
        t_min = None if t_min is None or t_min <= -900 else t_min
        dew_point = None if dew_point is None or dew_point <= -900 else dew_point
        precip = None if precip is None or precip <= -900 else max(0.0, precip)
        solar = None if solar is None or solar <= -900 else max(0.0, solar)
        ws = None if ws is None or ws <= -900 else ws
        
        day_et0 = None
        if t_max is not None and t_min is not None and dew_point is not None and ws is not None and solar is not None:
            day_et0 = compute_daily_et0_from_power(
                t_max,
                t_min,
                dew_point,
                ws,
                solar,
                latitude,
                datetime.datetime.strptime(d, "%Y%m%d").timetuple().tm_yday,
            )
            et0_values.append(day_et0)
            et0_records.append({"date": d, "et0": day_et0})
            
        if t is not None:
            valid_t2m.append(t)
        if t_max is not None:
            valid_t2m_max.append(t_max)
            if t_max >= 33.0:
                heat_days += 1
        if precip is not None:
            valid_precip.append(precip)
        if solar is not None:
            valid_solar.append(solar)
            
        daily_records.append({
            "date": d,
            "t2m": t,
            "t2m_max": t_max,
            "t2m_min": t_min,
            "t2m_dew": dew_point,
            "precip": precip,
            "solar_rad": solar,
            "ws2m": ws,
            "et0": day_et0
        })
        
    mean_temp = sum(valid_t2m) / len(valid_t2m) if valid_t2m else None
    total_precip = sum(valid_precip) if valid_precip else None
    mean_solar = sum(valid_solar) / len(valid_solar) if valid_solar else None
    recent_max = max(valid_t2m_max) if valid_t2m_max else None
    et0_mean = sum(et0_values) / len(et0_values) if et0_values else None
    if mean_temp is None:
        return generate_fallback_power_data(
            latitude,
            longitude,
            start_date,
            end_date,
            "NASA POWER returned no valid T2M observations",
        )
    
    return {
        "source": "NASA_POWER_LIVE",
        "latitude": latitude,
        "startDate": start_date,
        "endDate": end_date,
        "parameters": [
            "T2M", "T2M_MAX", "T2M_MIN", "T2MDEW", "PRECTOTCORR",
            "ALLSKY_SFC_SW_DWN", "WS2M"
        ],
        "daysCount": len(dates),
        "validTemperatureDays": len(valid_t2m),
        "validPrecipitationDays": len(valid_precip),
        "validSolarDays": len(valid_solar),
        "validEt0Days": len(et0_values),
        "meanTemp": round(mean_temp, 2) if mean_temp is not None else None,
        "totalPrecip": round(total_precip, 2) if total_precip is not None else None,
        "meanSolarRad": round(mean_solar, 2) if mean_solar is not None else None,
        "recentMaxTemp": round(recent_max, 2) if recent_max is not None else None,
        "heatDays": heat_days if valid_t2m_max else None,
        "et0Mean": round(et0_mean, 2) if et0_mean is not None else None,
        "etSource": "FAO56-PM-from-POWER",
        "fetchedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "dailyEt0": et0_records,
        "dailySummary": daily_records[-14:] # last 14 days for sparklines
    }

def generate_fallback_power_data(
    lat: float,
    lon: float,
    start_date: str,
    end_date: str,
    error_msg: str
) -> Dict[str, Any]:
    """
    Fallback data generated when NASA POWER is offline or unreachable.
    Reflects authentic seasonal weather for Southern Bangladesh delta.
    """
    return {
        "source": "NASA_POWER_UNAVAILABLE",
        "warning": f"Live POWER query failed: {error_msg}",
        "latitude": lat,
        "longitude": lon,
        "startDate": start_date,
        "endDate": end_date,
        "daysCount": 0,
        "validTemperatureDays": 0,
        "validPrecipitationDays": 0,
        "validSolarDays": 0,
        "validEt0Days": 0,
        "meanTemp": None,
        "totalPrecip": None,
        "meanSolarRad": None,
        "recentMaxTemp": None,
        "heatDays": None,
        "et0Mean": None,
        "etSource": "FAO56-PM-from-POWER",
        "fetchedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "dailySummary": []
    }
