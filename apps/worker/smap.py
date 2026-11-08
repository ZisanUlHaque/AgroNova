import datetime
import os
import re
import tempfile
from pathlib import Path
from typing import Any, Dict, Optional


def unavailable_smap(warning: str) -> Dict[str, Any]:
    return {
        "source": "NASA_EARTHDATA_UNAVAILABLE",
        "product": "SPL4SMGP",
        "resolution": "9 km",
        "smSurface": None,
        "smRootzone": None,
        "smapGranuleDate": None,
        "fetchedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "warning": warning,
        "disclaimer": "SMAP L4 9 km data are regional hydrological context, not field truth.",
    }


def extract_nearest_smap_cell(
    granule_path: str,
    latitude: float,
    longitude: float,
    granule_metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    import h5py
    import numpy as np

    with h5py.File(granule_path, "r") as granule:
        required_paths = (
            "cell_lat",
            "cell_lon",
            "Geophysical_Data/sm_surface",
            "Geophysical_Data/sm_rootzone",
        )
        if any(path not in granule for path in required_paths):
            raise ValueError("SMAP granule is missing required geolocation or moisture datasets")

        cell_lat = np.asarray(granule["cell_lat"][:], dtype=np.float64)
        cell_lon = np.asarray(granule["cell_lon"][:], dtype=np.float64)
        surface = np.asarray(granule["Geophysical_Data/sm_surface"][:], dtype=np.float64)
        rootzone = np.asarray(granule["Geophysical_Data/sm_rootzone"][:], dtype=np.float64)
        if not (cell_lat.shape == cell_lon.shape == surface.shape == rootzone.shape):
            raise ValueError("SMAP geolocation and soil-moisture grids have mismatched dimensions")

        valid = (
            np.isfinite(cell_lat)
            & np.isfinite(cell_lon)
            & np.isfinite(surface)
            & np.isfinite(rootzone)
            & (surface >= 0.0)
            & (surface <= 1.0)
            & (rootzone >= 0.0)
            & (rootzone <= 1.0)
        )
        if not np.any(valid):
            raise ValueError("SMAP granule contains no valid surface/rootzone moisture cells")

        lon_delta = (cell_lon - longitude + 180.0) % 360.0 - 180.0
        lat_delta = cell_lat - latitude
        distance_squared = (
            lat_delta * lat_delta
            + (lon_delta * np.cos(np.radians(latitude))) ** 2
        )
        distance_squared[~valid] = np.inf
        row, column = np.unravel_index(np.argmin(distance_squared), distance_squared.shape)
        distance_km = 111.195 * np.sqrt(distance_squared[row, column])

    metadata = granule_metadata or {}
    granule_id = metadata.get("native-id") or metadata.get("title") or Path(granule_path).name
    date_match = re.search(r"(\d{8})T\d{6}", granule_id)
    granule_date = (
        datetime.datetime.strptime(date_match.group(1), "%Y%m%d").date().isoformat()
        if date_match
        else (metadata.get("time_start") or "")[:10] or None
    )
    return {
        "source": "NASA_EARTHDATA_LIVE",
        "product": "SPL4SMGP",
        "version": metadata.get("version"),
        "resolution": "9 km",
        "granuleId": granule_id,
        "smapGranuleDate": granule_date,
        "smSurface": round(float(surface[row, column]), 4),
        "smRootzone": round(float(rootzone[row, column]), 4),
        "cellLatitude": round(float(cell_lat[row, column]), 5),
        "cellLongitude": round(float(cell_lon[row, column]), 5),
        "nearestCellDistanceKm": round(float(distance_km), 2),
        "sourceVariables": [
            "/Geophysical_Data/sm_surface",
            "/Geophysical_Data/sm_rootzone",
        ],
        "fetchedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "isDemoFallback": False,
        "disclaimer": "SMAP L4 9 km data are regional hydrological context, not field truth.",
    }


def fetch_smap_soil_moisture(
    latitude: float,
    longitude: float,
    username: Optional[str] = None,
    password: Optional[str] = None,
    timeout_sec: int = 15,
) -> Dict[str, Any]:
    user = username or os.environ.get("EARTHDATA_USERNAME")
    pwd = password or os.environ.get("EARTHDATA_PASSWORD")
    if not user or not pwd:
        return unavailable_smap(
            "NASA Earthdata credentials were not provided; live SMAP observations were not fetched and are not fabricated."
        )

    import requests

    search_endpoint = "https://cmr.earthdata.nasa.gov/search/granules.json"
    end_date = datetime.date.today() - datetime.timedelta(days=3)
    start_date = end_date - datetime.timedelta(days=7)
    params = {
        "short_name": "SPL4SMGP",
        "temporal": f"{start_date.isoformat()}T00:00:00Z,{end_date.isoformat()}T23:59:59Z",
        "point": f"{longitude:.4f},{latitude:.4f}",
        "page_size": 1,
        "sort_key": "-start_date",
    }
    headers = {"Client-Id": "terrashift-nasa-spaceapps-2026"}

    try:
        search_res = requests.get(
            search_endpoint,
            params=params,
            headers=headers,
            timeout=timeout_sec,
        )
        search_res.raise_for_status()
        entries = search_res.json().get("feed", {}).get("entry", [])
        if not entries:
            return unavailable_smap(
                "No recent SMAP L4 granule was found covering these coordinates; no fallback moisture was substituted."
            )

        granule = entries[0]
        download_url = None
        for link in granule.get("links", []):
            href = link.get("href", "")
            if href.endswith(".h5") and "data#" in link.get("rel", ""):
                download_url = href
                break
        if not download_url:
            for link in granule.get("links", []):
                href = link.get("href", "")
                if href.endswith(".h5"):
                    download_url = href
                    break

        if not download_url:
            return unavailable_smap(
                "A SMAP L4 granule was indexed but had no downloadable HDF5 asset; no fallback moisture was substituted."
            )

        with tempfile.NamedTemporaryFile(suffix=".h5", delete=False) as temp_file:
            temp_path = temp_file.name

        try:
            with requests.Session() as session:
                session.auth = (user, pwd)
                download_res = session.get(
                    download_url,
                    headers=headers,
                    stream=True,
                    timeout=max(timeout_sec, 30),
                )
                download_res.raise_for_status()
                with open(temp_path, "wb") as file_handle:
                    for chunk in download_res.iter_content(chunk_size=1024 * 1024):
                        if chunk:
                            file_handle.write(chunk)

            return extract_nearest_smap_cell(
                temp_path,
                latitude,
                longitude,
                granule_metadata=granule,
            )
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    except Exception as error:
        return unavailable_smap(
            f"SMAP L4 ingestion failed ({type(error).__name__}); live rootzone observations remain unavailable and are not fabricated."
        )
