import datetime
import os
import re
import tempfile
from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np


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
) -> Dict[str, Any]:
    user = username if username is not None else os.environ.get("EARTHDATA_USERNAME")
    password_value = password if password is not None else os.environ.get("EARTHDATA_PASSWORD")
    if not user or not password_value:
        return unavailable_smap(
            "NASA Earthdata credentials are not configured; SMAP values were not fabricated."
        )

    try:
        import earthaccess

        auth = earthaccess.login(strategy="environment")
        if not auth.authenticated:
            return unavailable_smap("NASA Earthdata authentication was not accepted.")

        today = datetime.date.today()
        granules = earthaccess.search_data(
            short_name="SPL4SMGP",
            point=(longitude, latitude),
            temporal=(
                (today - datetime.timedelta(days=14)).isoformat(),
                today.isoformat(),
            ),
            count=1,
            sort_key="-start_date",
        )
        if not granules:
            return unavailable_smap("No recent SPL4SMGP granules were found for this location.")

        metadata = granules[0].get("meta", {})
        with tempfile.TemporaryDirectory(prefix="terrashift-smap-") as download_dir:
            downloaded = earthaccess.download(
                granules[:1],
                local_path=download_dir,
                show_progress=False,
            )
            if not downloaded:
                return unavailable_smap("Earthdata found a granule but did not return a downloaded file.")
            return extract_nearest_smap_cell(
                str(downloaded[0]),
                latitude,
                longitude,
                metadata,
            )
    except Exception as error:
        return unavailable_smap(
            f"Live SMAP retrieval failed ({type(error).__name__}); no demo values were substituted."
        )
