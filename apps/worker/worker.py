import os
import sys
import json
import argparse
import datetime
from power import fetch_nasa_power_daily
from smap import fetch_smap_soil_moisture
from soilgrids import fetch_isric_soilgrids

def run_ingest(lat: float, lon: float) -> dict:
    """
    Executes complete ingest pipeline:
    1. NASA POWER 90-day daily climate + FAO-56 Penman-Monteith ET0
    2. NASA SMAP L4 SPL4SMGP 9 km surface & rootzone moisture
    3. ISRIC SoilGrids REST baseline
    """
    power_data = fetch_nasa_power_daily(lat, lon, days_window=90)
    smap_data = fetch_smap_soil_moisture(lat, lon)
    soil_data = fetch_isric_soilgrids(lat, lon)
    
    now = datetime.datetime.now(datetime.timezone.utc)
    power_ttl_hours = int(os.environ.get("POWER_TTL_HOURS", "24"))
    smap_ttl_days = int(os.environ.get("SMAP_TTL_DAYS", "7"))
    
    power_expires_at = (now + datetime.timedelta(hours=power_ttl_hours)).isoformat()
    smap_expires_at = (now + datetime.timedelta(days=smap_ttl_days)).isoformat()
    
    return {
        "latitude": lat,
        "longitude": lon,
        "ingestedAt": now.isoformat(),
        "powerData": power_data,
        "powerMeanTemp": power_data.get("meanTemp"),
        "powerTotalPrecip": power_data.get("totalPrecip"),
        "powerSolarRad": power_data.get("meanSolarRad"),
        "powerHeatDays": power_data.get("heatDays"),
        "powerRecentMaxTemp": power_data.get("recentMaxTemp"),
        "powerFetchedAt": power_data.get("fetchedAt"),
        "powerExpiresAt": power_expires_at,
        "smapSurface": smap_data.get("smSurface"),
        "smapRootzone": smap_data.get("smRootzone"),
        "smapGranuleDate": smap_data.get("smapGranuleDate"),
        "smapFetchedAt": smap_data.get("fetchedAt"),
        "smapExpiresAt": smap_expires_at,
        "et0Mean": power_data.get("et0Mean"),
        "etSource": "FAO56-PM-from-POWER",
        "soilTexture": soil_data.get("soilTexture"),
        "soilPh": soil_data.get("soilPh"),
        "soilSource": soil_data.get("soilSource", "ESTIMATED"),
        "soilData": soil_data,
        "isStale": False
    }

def main():
    parser = argparse.ArgumentParser(description="TerraShift NASA Ingest Worker")
    parser.add_argument("--lat", type=float, default=22.7010, help="Farm latitude (default: Barisal 22.7010)")
    parser.add_argument("--lon", type=float, default=90.3535, help="Farm longitude (default: Barisal 90.3535)")
    parser.add_argument("--json", action="store_true", help="Output JSON only")
    args = parser.parse_args()
    
    result = run_ingest(args.lat, args.lon)
    
    if args.json:
        print(json.dumps(result))
    else:
        print("\n================ TerraShift NASA Ingest Summary ================")
        print(f"Location: {args.lat:.4f} N, {args.lon:.4f} E")
        print(f"NASA POWER Mean Temp: {result['powerMeanTemp']} °C (Recent Max: {result['powerRecentMaxTemp']} °C)")
        print(f"NASA POWER Precip (90d): {result['powerTotalPrecip']} mm")
        print(f"FAO-56 Penman-Monteith ET0: {result['et0Mean']} mm/day [{result['etSource']}]")
        print(f"NASA SMAP L4 Surface: {result['smapSurface']} m3/m3 | Rootzone: {result['smapRootzone']} m3/m3 (Granule: {result['smapGranuleDate']})")
        print(f"ISRIC SoilGrids Baseline: Texture: {result['soilTexture']}, pH: {result['soilPh']} ({result['soilSource']})")
        print(f"Disclaimer: {result['powerData'].get('disclaimer', '9 km regional context, not field truth')}")
        print("=================================================================\n")

if __name__ == "__main__":
    main()
