import os
import json
import argparse
import datetime
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from dotenv import load_dotenv
from power import fetch_nasa_power_daily
from smap import fetch_smap_soil_moisture
from soilgrids import fetch_isric_soilgrids

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

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
    power_fetched_at = power_data.get("fetchedAt")
    smap_fetched_at = smap_data.get("fetchedAt")
    power_ttl_hours = int(os.environ.get("POWER_TTL_HOURS", "24"))
    smap_ttl_days = int(os.environ.get("SMAP_TTL_DAYS", "7"))

    power_fetched_time = (
        datetime.datetime.fromisoformat(power_fetched_at.replace("Z", "+00:00"))
        if power_fetched_at else now
    )
    smap_fetched_time = (
        datetime.datetime.fromisoformat(smap_fetched_at.replace("Z", "+00:00"))
        if smap_fetched_at else now
    )
    
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
        "powerFetchedAt": power_fetched_at,
        "powerExpiresAt": (power_fetched_time + datetime.timedelta(hours=power_ttl_hours)).isoformat(),
        "smapData": smap_data,
        "smapSurface": smap_data.get("smSurface"),
        "smapRootzone": smap_data.get("smRootzone"),
        "smapGranuleDate": smap_data.get("smapGranuleDate"),
        "smapFetchedAt": smap_fetched_at,
        "smapExpiresAt": (smap_fetched_time + datetime.timedelta(days=smap_ttl_days)).isoformat(),
        "et0Mean": power_data.get("et0Mean"),
        "etSource": "FAO56-PM-from-POWER",
        "soilTexture": soil_data.get("soilTexture"),
        "soilPh": soil_data.get("soilPh"),
        "soilSource": soil_data.get("soilSource", "ESTIMATED"),
        "soilData": soil_data,
        "isStale": (
            power_data.get("source") != "NASA_POWER_LIVE"
            or smap_data.get("source") != "NASA_EARTHDATA_LIVE"
        )
    }

class IngestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/health":
            self.send_error(404)
            return
        self._send_json(200, {"status": "ok", "service": "TerraShift NASA ingest worker"})

    def do_POST(self):
        if self.path != "/v1/ingest":
            self.send_error(404)
            return
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0 or content_length > 4096:
                self._send_json(413, {"error": "Request body must be between 1 and 4096 bytes"})
                return
            payload = json.loads(self.rfile.read(content_length))
            latitude = float(payload["latitude"])
            longitude = float(payload["longitude"])
            if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
                self._send_json(400, {"error": "Coordinates are out of range"})
                return
            self._send_json(200, run_ingest(latitude, longitude))
        except (KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
            self._send_json(400, {"error": f"Invalid ingestion request: {error}"})
        except Exception as error:
            print(f"NASA ingestion request failed: {type(error).__name__}: {error}")
            self._send_json(500, {"error": "NASA ingestion failed unexpectedly"})

    def _send_json(self, status: int, body: dict):
        encoded = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def log_message(self, format, *args):
        print(f"NASA worker: {format % args}")


def main():
    parser = argparse.ArgumentParser(description="TerraShift NASA Ingest Worker")
    parser.add_argument("--lat", type=float, default=22.7010, help="Farm latitude (default: Barisal 22.7010)")
    parser.add_argument("--lon", type=float, default=90.3535, help="Farm longitude (default: Barisal 90.3535)")
    parser.add_argument("--json", action="store_true", help="Output JSON only")
    parser.add_argument("--serve", action="store_true", help="Run the internal HTTP ingestion service")
    args = parser.parse_args()

    if args.serve:
        port = int(os.environ.get("NASA_WORKER_PORT", "8010"))
        server = ThreadingHTTPServer(("0.0.0.0", port), IngestHandler)
        print(f"NASA ingestion worker listening on port {port}")
        server.serve_forever()
        return
    
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
        print(f"NASA POWER source: {result['powerData'].get('source')}")
        print(f"NASA SMAP source: {result['smapData'].get('source')}")
        print("=================================================================\n")

if __name__ == "__main__":
    main()
