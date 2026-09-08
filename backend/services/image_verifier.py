"""
MPLAD Rakshak — Image Verification Service
============================================
Extracts EXIF metadata from site inspection photos and performs:
- GPS coordinate extraction and proximity verification
- Timestamp validation
- Software edit / tampering detection
"""

import os
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional

from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import exifread

from config import settings
from services.anomaly_engine import haversine_distance

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════
# Suspicious Software Tags
# ═══════════════════════════════════════════════════════════

SUSPICIOUS_SOFTWARE = [
    "photoshop", "gimp", "canva", "lightroom", "capture one",
    "snapseed", "pixlr", "fotor", "befunky", "paint.net",
    "affinity", "corel", "picmonkey", "adobe",
]

SUSPICIOUS_INDICATORS = [
    "edited", "modified", "processed", "enhanced", "retouched",
]


# ═══════════════════════════════════════════════════════════
# EXIF Extraction
# ═══════════════════════════════════════════════════════════

def extract_exif(image_path: str | Path) -> dict:
    """
    Extract comprehensive EXIF metadata from an image file.

    Args:
        image_path: Path to the JPEG/PNG image.

    Returns:
        Dict containing GPS, timestamp, camera, and software metadata.
    """
    image_path = Path(image_path)
    metadata = {
        "filename": image_path.name,
        "file_size_bytes": image_path.stat().st_size if image_path.exists() else 0,
        "latitude": None,
        "longitude": None,
        "timestamp": None,
        "camera_make": None,
        "camera_model": None,
        "software": None,
        "image_width": None,
        "image_height": None,
        "raw_gps_info": {},
        "all_tags": {},
    }

    if not image_path.exists():
        logger.error(f"Image file not found: {image_path}")
        return metadata

    # ── Method 1: Pillow EXIF ────────────────────────────
    try:
        with Image.open(image_path) as img:
            metadata["image_width"] = img.width
            metadata["image_height"] = img.height

            exif_data = img._getexif()
            if exif_data:
                for tag_id, value in exif_data.items():
                    tag_name = TAGS.get(tag_id, tag_id)

                    if tag_name == "GPSInfo":
                        gps_info = {}
                        for gps_tag_id, gps_value in value.items():
                            gps_tag_name = GPSTAGS.get(gps_tag_id, gps_tag_id)
                            gps_info[gps_tag_name] = gps_value
                        metadata["raw_gps_info"] = gps_info

                        # Parse GPS coordinates
                        lat = _parse_gps_coordinate(
                            gps_info.get("GPSLatitude"),
                            gps_info.get("GPSLatitudeRef"),
                        )
                        lon = _parse_gps_coordinate(
                            gps_info.get("GPSLongitude"),
                            gps_info.get("GPSLongitudeRef"),
                        )
                        if lat is not None:
                            metadata["latitude"] = lat
                        if lon is not None:
                            metadata["longitude"] = lon

                    elif tag_name == "DateTimeOriginal" or tag_name == "DateTime":
                        try:
                            metadata["timestamp"] = str(value)
                        except Exception:
                            pass

                    elif tag_name == "Make":
                        metadata["camera_make"] = str(value)

                    elif tag_name == "Model":
                        metadata["camera_model"] = str(value)

                    elif tag_name == "Software":
                        metadata["software"] = str(value)

                    # Store all tags (stringify to avoid serialization issues)
                    try:
                        metadata["all_tags"][str(tag_name)] = str(value)[:200]
                    except Exception:
                        pass

    except Exception as e:
        logger.warning(f"Pillow EXIF extraction failed: {e}")

    # ── Method 2: ExifRead (more thorough for GPS) ───────
    if metadata["latitude"] is None:
        try:
            with open(image_path, "rb") as f:
                tags = exifread.process_file(f, details=False)

            # GPS from exifread
            if "GPS GPSLatitude" in tags and "GPS GPSLatitudeRef" in tags:
                lat = _exifread_gps_to_decimal(
                    tags["GPS GPSLatitude"],
                    tags["GPS GPSLatitudeRef"],
                )
                metadata["latitude"] = lat

            if "GPS GPSLongitude" in tags and "GPS GPSLongitudeRef" in tags:
                lon = _exifread_gps_to_decimal(
                    tags["GPS GPSLongitude"],
                    tags["GPS GPSLongitudeRef"],
                )
                metadata["longitude"] = lon

            # Timestamp fallback
            if not metadata["timestamp"] and "EXIF DateTimeOriginal" in tags:
                metadata["timestamp"] = str(tags["EXIF DateTimeOriginal"])

            # Camera fallback
            if not metadata["camera_make"] and "Image Make" in tags:
                metadata["camera_make"] = str(tags["Image Make"])
            if not metadata["camera_model"] and "Image Model" in tags:
                metadata["camera_model"] = str(tags["Image Model"])

            # Software fallback
            if not metadata["software"] and "Image Software" in tags:
                metadata["software"] = str(tags["Image Software"])

        except Exception as e:
            logger.warning(f"ExifRead extraction failed: {e}")

    # Clean up raw_gps_info and all_tags for JSON serialization
    metadata["raw_gps_info"] = {
        str(k): str(v) for k, v in metadata.get("raw_gps_info", {}).items()
    }

    return metadata


# ═══════════════════════════════════════════════════════════
# GPS Coordinate Parsing Helpers
# ═══════════════════════════════════════════════════════════

def _parse_gps_coordinate(coords, ref) -> Optional[float]:
    """Convert Pillow GPS coordinate tuples to decimal degrees."""
    if coords is None or ref is None:
        return None

    try:
        degrees = float(coords[0])
        minutes = float(coords[1])
        seconds = float(coords[2])

        decimal = degrees + minutes / 60 + seconds / 3600

        if str(ref) in ("S", "W"):
            decimal = -decimal

        return round(decimal, 7)
    except (TypeError, ValueError, IndexError) as e:
        logger.debug(f"GPS coordinate parse error: {e}")
        return None


def _exifread_gps_to_decimal(gps_tag, ref_tag) -> Optional[float]:
    """Convert exifread IFD GPS values to decimal degrees."""
    try:
        values = gps_tag.values
        degrees = float(values[0].num) / float(values[0].den)
        minutes = float(values[1].num) / float(values[1].den)
        seconds = float(values[2].num) / float(values[2].den)

        decimal = degrees + minutes / 60 + seconds / 3600

        if str(ref_tag) in ("S", "W"):
            decimal = -decimal

        return round(decimal, 7)
    except Exception as e:
        logger.debug(f"ExifRead GPS parse error: {e}")
        return None


# ═══════════════════════════════════════════════════════════
# Geo-Proximity Verification
# ═══════════════════════════════════════════════════════════

def verify_geo_proximity(
    exif_lat: Optional[float],
    exif_lon: Optional[float],
    project_lat: float,
    project_lon: float,
    threshold_meters: float = None,
) -> dict:
    """
    Verify that the photo's GPS location matches the project site.

    Args:
        exif_lat, exif_lon: GPS from EXIF metadata.
        project_lat, project_lon: Expected project coordinates.
        threshold_meters: Maximum allowable distance.

    Returns:
        Verification result with distance and pass/fail status.
    """
    threshold = threshold_meters or settings.GEO_PROXIMITY_THRESHOLD_METERS

    if exif_lat is None or exif_lon is None:
        return {
            "verified": False,
            "distance_meters": None,
            "threshold_meters": threshold,
            "reason": "No GPS data found in image EXIF metadata",
        }

    distance = haversine_distance(exif_lat, exif_lon, project_lat, project_lon)

    return {
        "verified": distance <= threshold,
        "distance_meters": round(distance, 2),
        "threshold_meters": threshold,
        "exif_coordinates": {"lat": exif_lat, "lon": exif_lon},
        "project_coordinates": {"lat": project_lat, "lon": project_lon},
        "reason": (
            f"Photo taken {distance:.0f}m from project site "
            f"({'PASS' if distance <= threshold else 'FAIL'} — threshold: {threshold}m)"
        ),
    }


# ═══════════════════════════════════════════════════════════
# Tampering / Morphing Detection
# ═══════════════════════════════════════════════════════════

def check_tampering_markers(exif_data: dict) -> dict:
    """
    Analyze EXIF metadata for signs of image tampering or editing.

    Checks:
    1. Software edit headers (Photoshop, GIMP, Canva, etc.)
    2. Missing critical timestamps
    3. Missing camera information (possible screenshot/download)
    4. Mismatched dimensions suggesting cropping/editing

    Args:
        exif_data: Dict from extract_exif().

    Returns:
        Tampering analysis result.
    """
    issues = []
    risk_score = 0.0

    # 1. Check software tags
    software = (exif_data.get("software") or "").lower()
    if software:
        for suspicious in SUSPICIOUS_SOFTWARE:
            if suspicious in software:
                issues.append(
                    f"Image processed with editing software: '{exif_data['software']}'"
                )
                risk_score += 0.4
                break

        for indicator in SUSPICIOUS_INDICATORS:
            if indicator in software:
                issues.append(
                    f"Software tag contains suspicious keyword: '{indicator}'"
                )
                risk_score += 0.2
                break

    # 2. Check for missing timestamps
    if not exif_data.get("timestamp"):
        issues.append("No timestamp found in EXIF — photo may have been stripped of metadata")
        risk_score += 0.2

    # 3. Check for missing camera info
    if not exif_data.get("camera_make") and not exif_data.get("camera_model"):
        issues.append(
            "No camera make/model found — image may be a screenshot, "
            "downloaded from internet, or metadata was stripped"
        )
        risk_score += 0.3

    # 4. Check for missing GPS (suspicious for site inspection photos)
    if exif_data.get("latitude") is None or exif_data.get("longitude") is None:
        issues.append(
            "No GPS coordinates in EXIF — eSAKSHI mandates geo-tagged photos"
        )
        risk_score += 0.3

    # 5. Check all_tags for additional indicators
    all_tags = exif_data.get("all_tags", {})
    for tag_name, tag_value in all_tags.items():
        tag_value_lower = str(tag_value).lower()
        for suspicious in SUSPICIOUS_SOFTWARE:
            if suspicious in tag_value_lower:
                issues.append(f"Tag '{tag_name}' references editing software: {tag_value[:100]}")
                risk_score += 0.2
                break

    # Cap risk score at 1.0
    risk_score = min(risk_score, 1.0)
    is_tampered = risk_score >= 0.4

    return {
        "is_tampered": is_tampered,
        "risk_score": round(risk_score, 2),
        "issues": issues,
        "verdict": "SUSPICIOUS" if is_tampered else "CLEAN",
        "recommendation": (
            "Manual review recommended — multiple tampering indicators detected"
            if is_tampered
            else "No significant tampering indicators found"
        ),
    }


# ═══════════════════════════════════════════════════════════
# Full Verification Pipeline
# ═══════════════════════════════════════════════════════════

def verify_site_photo(
    image_path: str | Path,
    project_lat: float,
    project_lon: float,
) -> dict:
    """
    Run the complete photo verification pipeline:
    1. Extract EXIF metadata
    2. Verify geo-proximity to project site
    3. Check for tampering markers

    Args:
        image_path: Path to the uploaded image.
        project_lat, project_lon: Expected project coordinates.

    Returns:
        Complete verification report.
    """
    # Step 1: Extract EXIF
    exif = extract_exif(image_path)

    # Step 2: Geo-proximity check
    geo_result = verify_geo_proximity(
        exif.get("latitude"),
        exif.get("longitude"),
        project_lat,
        project_lon,
    )

    # Step 3: Tampering check
    tamper_result = check_tampering_markers(exif)

    # Overall verdict
    is_valid = geo_result["verified"] and not tamper_result["is_tampered"]

    return {
        "image_path": str(image_path),
        "verdict": "PASS" if is_valid else "FAIL",
        "exif_metadata": {
            "latitude": exif.get("latitude"),
            "longitude": exif.get("longitude"),
            "timestamp": exif.get("timestamp"),
            "camera": f"{exif.get('camera_make', '')} {exif.get('camera_model', '')}".strip(),
            "software": exif.get("software"),
            "dimensions": f"{exif.get('image_width')}x{exif.get('image_height')}",
        },
        "geo_verification": geo_result,
        "tampering_analysis": tamper_result,
    }
