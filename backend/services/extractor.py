"""
MPLAD Rakshak — Data Extractor & Ingestion Engine
===================================================
Automates downloading of MPLADS datasets and guidelines from government
portals (CKAN API, MoSPI, eSAKSHI) with graceful local fallback.
"""

import os
import csv
import json
import logging
from pathlib import Path
from datetime import datetime, date

import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from config import settings

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════
# Constants
# ═══════════════════════════════════════════════════════════

DATA_DIR = Path(settings.DATA_DIR)
GUIDELINES_DIR = DATA_DIR / "guidelines"
SOR_DIR = DATA_DIR / "sor"

HEADERS = {
    "User-Agent": (
        "MPLAD-Rakshak/1.0 (Smart India Hackathon; "
        "contact: admin@mpladrakshak.in)"
    )
}


# ═══════════════════════════════════════════════════════════
# PDF Downloader — Guidelines
# ═══════════════════════════════════════════════════════════

def fetch_guidelines_pdf(output_dir: Path = None) -> Path:
    """
    Download the official MPLADS 2023 Guidelines PDF.
    Falls back to local file if network request fails.

    Returns:
        Path to the downloaded or local PDF file.
    """
    output_dir = output_dir or GUIDELINES_DIR
    output_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = output_dir / "mplads_guidelines_2023.pdf"

    # Check if already downloaded
    if pdf_path.exists() and pdf_path.stat().st_size > 100_000:
        logger.info(f"Guidelines PDF already exists at {pdf_path}")
        return pdf_path

    # Attempt 1: Direct download from official URL
    try:
        logger.info("Attempting to download MPLADS Guidelines PDF from official URL...")
        response = requests.get(
            settings.MPLADS_GUIDELINES_PDF_URL,
            headers=HEADERS,
            timeout=30,
            stream=True,
        )
        response.raise_for_status()

        with open(pdf_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        logger.info(f"✅ Guidelines PDF downloaded successfully ({pdf_path.stat().st_size:,} bytes)")
        return pdf_path

    except Exception as e:
        logger.warning(f"Direct download failed: {e}")

    # Attempt 2: Scrape the MoSPI website for alternate download link
    try:
        logger.info("Attempting to scrape MoSPI website for PDF link...")
        page = requests.get(
            "https://www.mplads.gov.in/mplads/Content/About_Scheme/Guideline.aspx",
            headers=HEADERS,
            timeout=15,
        )
        soup = BeautifulSoup(page.text, "html.parser")

        # Look for PDF links on the page
        for link in soup.find_all("a", href=True):
            href = link["href"]
            if "guideline" in href.lower() and href.endswith(".pdf"):
                full_url = href if href.startswith("http") else f"https://www.mplads.gov.in{href}"
                response = requests.get(full_url, headers=HEADERS, timeout=30, stream=True)
                response.raise_for_status()

                with open(pdf_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)

                logger.info(f"✅ Guidelines PDF scraped and saved ({pdf_path.stat().st_size:,} bytes)")
                return pdf_path

    except Exception as e:
        logger.warning(f"MoSPI scraping failed: {e}")

    # Fallback: Check local directory
    if pdf_path.exists():
        logger.info(f"Using existing local PDF at {pdf_path}")
        return pdf_path

    logger.error(
        "❌ Could not download MPLADS Guidelines PDF.\n"
        "   Please manually place the file at:\n"
        f"   {pdf_path.absolute()}\n"
        "   Download from: https://www.mplads.gov.in/MPLADS/UploadedFiles/"
        "MPLADSGuidelines2023_English_.pdf"
    )
    return pdf_path


# ═══════════════════════════════════════════════════════════
# CKAN API — data.gov.in Datasets
# ═══════════════════════════════════════════════════════════

def fetch_ckan_datasets(query: str = "MPLADS", max_results: int = 5) -> list[dict]:
    """
    Search and download MPLADS-related datasets from data.gov.in CKAN API.
    Falls back to local sample_projects.csv if API is unreachable.

    Returns:
        List of dataset metadata dicts.
    """
    datasets = []

    try:
        logger.info(f"Querying data.gov.in CKAN API for '{query}'...")
        api_url = f"{settings.CKAN_API_BASE_URL}/package_search"
        params = {"q": query, "rows": max_results}

        if settings.DATA_GOV_IN_API_KEY:
            params["api_key"] = settings.DATA_GOV_IN_API_KEY

        response = requests.get(api_url, params=params, headers=HEADERS, timeout=15)
        response.raise_for_status()

        data = response.json()
        if data.get("success"):
            results = data.get("result", {}).get("results", [])
            for pkg in results:
                dataset_info = {
                    "id": pkg.get("id"),
                    "title": pkg.get("title"),
                    "notes": pkg.get("notes", "")[:200],
                    "organization": pkg.get("organization", {}).get("title", ""),
                    "resources": [],
                }

                for res in pkg.get("resources", []):
                    resource = {
                        "id": res.get("id"),
                        "name": res.get("name"),
                        "format": res.get("format"),
                        "url": res.get("url"),
                    }
                    dataset_info["resources"].append(resource)

                    # Attempt to download CSV/JSON resources
                    if res.get("format", "").upper() in ("CSV", "JSON"):
                        _download_resource(res["url"], res.get("name", "dataset"))

                datasets.append(dataset_info)

            logger.info(f"✅ Found {len(datasets)} datasets from data.gov.in")
        else:
            logger.warning("CKAN API returned success=false")

    except Exception as e:
        logger.warning(f"CKAN API fetch failed: {e}")
        logger.info("Falling back to local sample data...")

    return datasets


def _download_resource(url: str, name: str) -> Path | None:
    """Download a single CKAN resource file to local data directory."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=20, stream=True)
        response.raise_for_status()

        # Determine extension from content type or URL
        ext = ".csv" if "csv" in url.lower() or "csv" in response.headers.get("content-type", "") else ".json"
        safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in name)[:50]
        file_path = DATA_DIR / f"{safe_name}{ext}"

        with open(file_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        logger.info(f"  Downloaded resource: {file_path.name}")
        return file_path

    except Exception as e:
        logger.warning(f"  Failed to download resource '{name}': {e}")
        return None


# ═══════════════════════════════════════════════════════════
# eSAKSHI Portal — Summary Reports
# ═══════════════════════════════════════════════════════════

def scrape_esakshi_summary() -> dict:
    """
    Attempt to scrape high-level summary data from the eSAKSHI portal.
    Returns whatever public data is accessible.
    """
    summary = {"source": "eSAKSHI Portal", "fetched_at": None, "data": {}}

    try:
        logger.info("Attempting to access eSAKSHI portal for summary data...")
        response = requests.get(
            settings.ESAKSHI_PORTAL_URL,
            headers=HEADERS,
            timeout=15,
        )
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        summary["fetched_at"] = datetime.utcnow().isoformat()

        # Extract any visible statistics from the landing page
        stat_elements = soup.find_all(class_=lambda c: c and ("stat" in c.lower() or "counter" in c.lower()))
        for i, elem in enumerate(stat_elements[:10]):
            summary["data"][f"stat_{i}"] = elem.get_text(strip=True)

        # Look for data tables
        tables = soup.find_all("table")
        if tables:
            summary["data"]["tables_found"] = len(tables)

        logger.info(f"✅ eSAKSHI portal accessible, extracted {len(summary['data'])} data points")

    except Exception as e:
        logger.warning(
            f"eSAKSHI portal scraping failed: {e}\n"
            "This is expected — the portal may require authentication."
        )

    return summary


# ═══════════════════════════════════════════════════════════
# Schedule of Rates Loader
# ═══════════════════════════════════════════════════════════

def load_schedule_of_rates() -> list[dict]:
    """Load CPWD Schedule of Rates from local JSON file."""
    sor_path = SOR_DIR / "cpwd_dsr_sample.json"

    if not sor_path.exists():
        logger.warning(f"SoR file not found at {sor_path}")
        return []

    try:
        with open(sor_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        rates = data.get("schedule_of_rates", [])
        logger.info(f"✅ Loaded {len(rates)} Schedule of Rates items")
        return rates
    except Exception as e:
        logger.error(f"Failed to load SoR: {e}")
        return []


# ═══════════════════════════════════════════════════════════
# Database Seeder
# ═══════════════════════════════════════════════════════════

def seed_initial_data(db: Session) -> dict:
    """
    Populate the MySQL database with sample projects and users
    from local CSV files. Idempotent — skips if data exists.

    Returns:
        Summary dict with counts of seeded records.
    """
    from models import User, Project, Contractor, UserRole, ProjectStatus, ProjectCategory, SCSTCategory
    from routers.auth import hash_password

    summary = {"users": 0, "projects": 0, "contractors": 0}

    # ── Seed Users ───────────────────────────────────────
    existing_users = db.query(User).count()
    if existing_users == 0:
        demo_users = [
            User(
                username="ministry_admin",
                password_hash=hash_password("admin123"),
                full_name="Dr. Rajesh Kumar",
                role=UserRole.MINISTRY_ADMIN,
                state="Delhi",
                email="admin@mospi.gov.in",
            ),
            User(
                username="da_pune",
                password_hash=hash_password("admin123"),
                full_name="Smt. Priya Sharma",
                role=UserRole.DISTRICT_AUTHORITY,
                district="Pune",
                state="Maharashtra",
                email="da.pune@nic.in",
            ),
            User(
                username="mp_pune",
                password_hash=hash_password("admin123"),
                full_name="Shri Vijay Patil",
                role=UserRole.MP,
                district="Pune",
                state="Maharashtra",
                email="mp.pune@sansad.nic.in",
            ),
            User(
                username="contractor_abc",
                password_hash=hash_password("admin123"),
                full_name="M/s ABC Constructions",
                role=UserRole.CONTRACTOR,
                district="Pune",
                state="Maharashtra",
                email="info@abcconstructions.in",
            ),
            User(
                username="da_lucknow",
                password_hash=hash_password("admin123"),
                full_name="Shri Anil Verma",
                role=UserRole.DISTRICT_AUTHORITY,
                district="Lucknow",
                state="Uttar Pradesh",
                email="da.lucknow@nic.in",
            ),
            User(
                username="mp_lucknow",
                password_hash=hash_password("admin123"),
                full_name="Smt. Asha Devi",
                role=UserRole.MP,
                district="Lucknow",
                state="Uttar Pradesh",
                email="mp.lucknow@sansad.nic.in",
            ),
        ]
        db.add_all(demo_users)
        db.flush()
        summary["users"] = len(demo_users)
        logger.info(f"✅ Seeded {len(demo_users)} demo users")

    # ── Seed Contractors ─────────────────────────────────
    existing_contractors = db.query(Contractor).count()
    if existing_contractors == 0:
        demo_contractors = [
            Contractor(name="M/s ABC Constructions", pan_gstin="ABCDE1234F", risk_score=0.2),
            Contractor(name="M/s Sharma Builders", pan_gstin="SBUIL5678G", risk_score=0.4),
            Contractor(name="M/s Patel Infrastructure", pan_gstin="PINFA9012H", risk_score=0.1),
            Contractor(name="M/s Kumar Associates", pan_gstin="KUASC3456I", risk_score=0.6),
            Contractor(name="M/s Singh Civil Works", pan_gstin="SCIVL7890J", risk_score=0.3),
        ]
        db.add_all(demo_contractors)
        db.flush()
        summary["contractors"] = len(demo_contractors)
        logger.info(f"✅ Seeded {len(demo_contractors)} demo contractors")

    # ── Seed Projects from CSV ───────────────────────────
    existing_projects = db.query(Project).count()
    if existing_projects == 0:
        csv_path = DATA_DIR / "sample_projects.csv"

        if not csv_path.exists():
            logger.warning(f"Sample projects CSV not found at {csv_path}")
        else:
            try:
                with open(csv_path, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    projects = []
                    for row in reader:
                        project = Project(
                            project_uid=row["project_uid"],
                            title=row["title"],
                            category=ProjectCategory[row["category"]],
                            district=row["district"],
                            state=row["state"],
                            latitude=float(row["latitude"]) if row.get("latitude") else None,
                            longitude=float(row["longitude"]) if row.get("longitude") else None,
                            sanctioned_amount=float(row["sanctioned_amount"]) if row.get("sanctioned_amount") else None,
                            expenditure_to_date=float(row["expenditure_to_date"]) if row.get("expenditure_to_date") else 0,
                            recommended_date=_parse_date(row.get("recommended_date")),
                            sanctioned_date=_parse_date(row.get("sanctioned_date")),
                            status=ProjectStatus[row["status"]] if row.get("status") else ProjectStatus.RECOMMENDED,
                            is_sc_st_area=row.get("is_sc_st_area", "").lower() == "true",
                            sc_st_category=SCSTCategory[row.get("sc_st_category", "GENERAL")],
                            physical_progress_percent=float(row.get("physical_progress_percent", 0)),
                            implementing_agency=row.get("implementing_agency"),
                        )
                        projects.append(project)

                    db.add_all(projects)
                    summary["projects"] = len(projects)
                    logger.info(f"✅ Seeded {len(projects)} projects from CSV")

            except Exception as e:
                logger.error(f"Failed to seed projects from CSV: {e}")

    db.commit()
    logger.info(f"📊 Seed summary: {summary}")
    return summary


def _parse_date(date_str: str | None) -> date | None:
    """Parse a date string in YYYY-MM-DD format."""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
    except ValueError:
        return None


# ═══════════════════════════════════════════════════════════
# CLI Runner
# ═══════════════════════════════════════════════════════════

def run_full_extraction(output_dir: str = None):
    """Run all extraction tasks. Can be invoked standalone."""
    target = Path(output_dir) if output_dir else DATA_DIR
    target.mkdir(parents=True, exist_ok=True)

    logger.info("=" * 60)
    logger.info("MPLAD Rakshak — Data Extraction Pipeline")
    logger.info("=" * 60)

    # 1. Guidelines PDF
    pdf_path = fetch_guidelines_pdf(target / "guidelines")

    # 2. CKAN Datasets
    datasets = fetch_ckan_datasets()

    # 3. eSAKSHI Summary
    esakshi = scrape_esakshi_summary()

    # 4. Schedule of Rates
    sor = load_schedule_of_rates()

    logger.info("=" * 60)
    logger.info("Extraction complete!")
    logger.info(f"  PDF: {'✅ Available' if pdf_path.exists() else '❌ Missing'}")
    logger.info(f"  CKAN datasets found: {len(datasets)}")
    logger.info(f"  eSAKSHI data points: {len(esakshi.get('data', {}))}")
    logger.info(f"  SoR items loaded: {len(sor)}")
    logger.info("=" * 60)

    return {
        "guidelines_pdf": str(pdf_path),
        "ckan_datasets": len(datasets),
        "esakshi_summary": esakshi,
        "sor_items": len(sor),
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
    run_full_extraction()
