"""
MPLAD Rakshak — Fraud & Anomaly Detection Engine
==================================================
Implements statistical and rule-based anomaly detection for MPLADS:
- SC/ST quota compliance (15% SC, 7.5% ST)
- Contractor cartelization detection
- Project delay risk flagging (45-day sanction limit)
- Duplicate work detection via Haversine geospatial analysis
"""

import math
import logging
from datetime import datetime, date, timedelta
from collections import defaultdict
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from config import settings
from models import (
    Project, Contractor, ContractAward, AnomalyAlert,
    ProjectStatus, AlertType, AlertSeverity, AlertStatus,
    SCSTCategory,
)

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════
# Haversine Distance
# ═══════════════════════════════════════════════════════════

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two GPS coordinates.

    Args:
        lat1, lon1: Coordinates of point 1 (degrees).
        lat2, lon2: Coordinates of point 2 (degrees).

    Returns:
        Distance in meters.
    """
    R = 6_371_000  # Earth's radius in meters

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


# ═══════════════════════════════════════════════════════════
# SC/ST Quota Compliance
# ═══════════════════════════════════════════════════════════

def check_sc_st_quota(db: Session, district: str = None, state: str = None) -> list[dict]:
    """
    Detect if districts are failing the mandatory SC/ST expenditure quotas.
    - At least 15% for SC areas
    - At least 7.5% for ST areas

    Returns:
        List of quota failure alerts.
    """
    alerts = []

    # Build filter
    query = db.query(Project)
    if district:
        query = query.filter(Project.district == district)
    if state:
        query = query.filter(Project.state == state)

    projects = query.all()
    if not projects:
        return alerts

    # Group by district
    district_map = defaultdict(lambda: {"total": 0, "sc": 0, "st": 0})
    for p in projects:
        amt = p.sanctioned_amount or 0
        district_map[p.district]["total"] += amt
        if p.sc_st_category == SCSTCategory.SC:
            district_map[p.district]["sc"] += amt
        elif p.sc_st_category == SCSTCategory.ST:
            district_map[p.district]["st"] += amt

    for dist, amounts in district_map.items():
        total = amounts["total"]
        if total == 0:
            continue

        sc_percent = (amounts["sc"] / total) * 100
        st_percent = (amounts["st"] / total) * 100

        if sc_percent < settings.SC_QUOTA_PERCENT:
            alerts.append({
                "alert_type": AlertType.QUOTA_FAILURE,
                "severity": AlertSeverity.HIGH,
                "title": f"SC Quota Shortfall in {dist}",
                "district": dist,
                "details": {
                    "sc_allocation_percent": round(sc_percent, 2),
                    "required_percent": settings.SC_QUOTA_PERCENT,
                    "shortfall_amount": round(
                        total * (settings.SC_QUOTA_PERCENT / 100) - amounts["sc"], 2
                    ),
                },
                "explanation": (
                    f"District {dist} has allocated only {sc_percent:.1f}% of funds "
                    f"to SC areas against the mandatory {settings.SC_QUOTA_PERCENT}%. "
                    f"Total sanctioned: ₹{total:,.0f}, SC allocation: ₹{amounts['sc']:,.0f}"
                ),
            })

        if st_percent < settings.ST_QUOTA_PERCENT:
            alerts.append({
                "alert_type": AlertType.QUOTA_FAILURE,
                "severity": AlertSeverity.MEDIUM,
                "title": f"ST Quota Shortfall in {dist}",
                "district": dist,
                "details": {
                    "st_allocation_percent": round(st_percent, 2),
                    "required_percent": settings.ST_QUOTA_PERCENT,
                    "shortfall_amount": round(
                        total * (settings.ST_QUOTA_PERCENT / 100) - amounts["st"], 2
                    ),
                },
                "explanation": (
                    f"District {dist} has allocated only {st_percent:.1f}% of funds "
                    f"to ST areas against the mandatory {settings.ST_QUOTA_PERCENT}%. "
                    f"Total sanctioned: ₹{total:,.0f}, ST allocation: ₹{amounts['st']:,.0f}"
                ),
            })

    if alerts:
        logger.warning(f"🚨 Found {len(alerts)} SC/ST quota failures")
    return alerts


# ═══════════════════════════════════════════════════════════
# Contractor Cartelization Detection
# ═══════════════════════════════════════════════════════════

def detect_cartelization(db: Session, district: str = None) -> list[dict]:
    """
    Detect potential contractor cartelization:
    1. Single contractor winning >30% of contracts in a district
    2. Contracts split under tender thresholds within 5km radius

    Returns:
        List of cartelization alerts.
    """
    alerts = []

    # Query contract awards with contractor info
    query = db.query(
        ContractAward.contractor_id,
        Contractor.name,
        func.count(ContractAward.id).label("contract_count"),
        func.sum(ContractAward.awarded_amount).label("total_amount"),
    ).join(Contractor).join(Project)

    if district:
        query = query.filter(Project.district == district)

    query = query.group_by(ContractAward.contractor_id, Contractor.name)
    contractor_stats = query.all()

    if not contractor_stats:
        return alerts

    # Total contracts in district
    total_contracts = sum(cs.contract_count for cs in contractor_stats)
    total_amount = sum(cs.total_amount or 0 for cs in contractor_stats)

    for cs in contractor_stats:
        contract_share = (cs.contract_count / total_contracts * 100) if total_contracts > 0 else 0

        if contract_share > settings.CARTELIZATION_THRESHOLD_PERCENT:
            alerts.append({
                "alert_type": AlertType.CARTELIZATION,
                "severity": AlertSeverity.CRITICAL,
                "title": f"Potential Cartelization: {cs.name}",
                "details": {
                    "contractor_name": cs.name,
                    "contractor_id": cs.contractor_id,
                    "contracts_won": cs.contract_count,
                    "total_contracts": total_contracts,
                    "share_percent": round(contract_share, 2),
                    "total_amount": float(cs.total_amount or 0),
                },
                "explanation": (
                    f"Contractor '{cs.name}' has won {cs.contract_count} out of "
                    f"{total_contracts} contracts ({contract_share:.1f}%), exceeding "
                    f"the {settings.CARTELIZATION_THRESHOLD_PERCENT}% threshold. "
                    f"Total awarded: ₹{cs.total_amount:,.0f}"
                ),
            })

    # Check for contract splitting within 5km radius
    tender_threshold = 500_000  # ₹5 Lakh common tender threshold
    awards = db.query(ContractAward).join(Project).all()

    contractor_projects = defaultdict(list)
    for award in awards:
        if award.project and award.project.latitude and award.project.longitude:
            contractor_projects[award.contractor_id].append({
                "project_id": award.project_id,
                "lat": award.project.latitude,
                "lon": award.project.longitude,
                "amount": award.awarded_amount,
                "title": award.project.title,
            })

    for contractor_id, projects in contractor_projects.items():
        for i, p1 in enumerate(projects):
            for p2 in projects[i + 1:]:
                dist = haversine_distance(p1["lat"], p1["lon"], p2["lat"], p2["lon"])
                if (
                    dist < 5000  # Within 5km
                    and p1["amount"] < tender_threshold
                    and p2["amount"] < tender_threshold
                ):
                    contractor = db.query(Contractor).get(contractor_id)
                    alerts.append({
                        "alert_type": AlertType.CARTELIZATION,
                        "severity": AlertSeverity.HIGH,
                        "title": f"Suspected Contract Splitting: {contractor.name if contractor else 'Unknown'}",
                        "details": {
                            "project_1": p1["title"],
                            "project_2": p2["title"],
                            "distance_meters": round(dist, 1),
                            "amount_1": p1["amount"],
                            "amount_2": p2["amount"],
                            "tender_threshold": tender_threshold,
                        },
                        "explanation": (
                            f"Two contracts within {dist:.0f}m both under ₹{tender_threshold:,.0f} "
                            f"tender threshold. This may indicate deliberate contract splitting "
                            f"to avoid competitive tendering requirements."
                        ),
                    })

    if alerts:
        logger.warning(f"🚨 Found {len(alerts)} cartelization risks")
    return alerts


# ═══════════════════════════════════════════════════════════
# Delay Risk Detection
# ═══════════════════════════════════════════════════════════

def flag_delayed_projects(db: Session) -> list[dict]:
    """
    Detect projects with:
    1. Sanction delay > 45 days from recommendation
    2. Physical progress lagging financial spend by >25%

    Returns:
        List of delay risk alerts.
    """
    alerts = []
    today = date.today()

    projects = db.query(Project).filter(
        Project.status.in_([
            ProjectStatus.RECOMMENDED,
            ProjectStatus.SANCTIONED,
            ProjectStatus.IN_PROGRESS,
        ])
    ).all()

    for project in projects:
        # Check 45-day sanction deadline breach
        if project.recommended_date:
            if project.sanctioned_date:
                days_to_sanction = (project.sanctioned_date - project.recommended_date).days
            else:
                days_to_sanction = (today - project.recommended_date).days

            if days_to_sanction > settings.SANCTION_DEADLINE_DAYS:
                severity = AlertSeverity.CRITICAL if days_to_sanction > 90 else AlertSeverity.HIGH
                alerts.append({
                    "alert_type": AlertType.DELAY_RISK,
                    "severity": severity,
                    "title": f"Sanction Deadline Breached: {project.project_uid}",
                    "project_id": project.id,
                    "district": project.district,
                    "state": project.state,
                    "details": {
                        "project_uid": project.project_uid,
                        "recommended_date": str(project.recommended_date),
                        "sanctioned_date": str(project.sanctioned_date) if project.sanctioned_date else None,
                        "days_elapsed": days_to_sanction,
                        "deadline_days": settings.SANCTION_DEADLINE_DAYS,
                        "overdue_days": days_to_sanction - settings.SANCTION_DEADLINE_DAYS,
                    },
                    "explanation": (
                        f"Project {project.project_uid} ('{project.title}') has taken "
                        f"{days_to_sanction} days for sanction, exceeding the mandatory "
                        f"{settings.SANCTION_DEADLINE_DAYS}-day limit by "
                        f"{days_to_sanction - settings.SANCTION_DEADLINE_DAYS} days. "
                        f"MPLADS Guidelines 2023 mandate DAs to sanction or reject "
                        f"works within 45 days of recommendation."
                    ),
                })

        # Check progress-expenditure mismatch
        if project.sanctioned_amount and project.sanctioned_amount > 0:
            financial_progress = (project.expenditure_to_date / project.sanctioned_amount) * 100
            physical_progress = project.physical_progress_percent or 0

            gap = financial_progress - physical_progress

            if gap > 25:
                alerts.append({
                    "alert_type": AlertType.DELAY_RISK,
                    "severity": AlertSeverity.HIGH if gap > 40 else AlertSeverity.MEDIUM,
                    "title": f"Progress-Expenditure Mismatch: {project.project_uid}",
                    "project_id": project.id,
                    "district": project.district,
                    "state": project.state,
                    "details": {
                        "project_uid": project.project_uid,
                        "financial_progress_percent": round(financial_progress, 1),
                        "physical_progress_percent": round(physical_progress, 1),
                        "gap_percent": round(gap, 1),
                        "expenditure": project.expenditure_to_date,
                        "sanctioned": project.sanctioned_amount,
                    },
                    "explanation": (
                        f"Project {project.project_uid} shows {financial_progress:.1f}% "
                        f"financial progress but only {physical_progress:.1f}% physical "
                        f"progress — a gap of {gap:.1f}%. This could indicate fund "
                        f"diversion or inflated billing."
                    ),
                })

    if alerts:
        logger.warning(f"🚨 Found {len(alerts)} delay/progress risks")
    return alerts


# ═══════════════════════════════════════════════════════════
# Duplicate Work Detection (Geospatial)
# ═══════════════════════════════════════════════════════════

def detect_duplicate_works(
    db: Session,
    radius_meters: float = None,
) -> list[dict]:
    """
    Detect potential duplicate projects within a given radius
    using Haversine distance calculation.

    Returns:
        List of duplicate work alerts.
    """
    radius = radius_meters or settings.DUPLICATE_RADIUS_METERS
    alerts = []

    projects = db.query(Project).filter(
        Project.latitude.isnot(None),
        Project.longitude.isnot(None),
    ).all()

    # O(n²) comparison — acceptable for prototype scale
    checked_pairs = set()
    for i, p1 in enumerate(projects):
        for j, p2 in enumerate(projects):
            if i >= j:
                continue

            pair_key = (min(p1.id, p2.id), max(p1.id, p2.id))
            if pair_key in checked_pairs:
                continue
            checked_pairs.add(pair_key)

            # Same category check
            if p1.category != p2.category:
                continue

            distance = haversine_distance(
                p1.latitude, p1.longitude,
                p2.latitude, p2.longitude,
            )

            if distance <= radius:
                alerts.append({
                    "alert_type": AlertType.DUPLICATE_ASSET,
                    "severity": AlertSeverity.HIGH,
                    "title": f"Potential Duplicate Work Detected",
                    "details": {
                        "project_1": {
                            "uid": p1.project_uid,
                            "title": p1.title,
                            "category": p1.category.value if p1.category else None,
                            "lat": p1.latitude,
                            "lon": p1.longitude,
                            "amount": p1.sanctioned_amount,
                        },
                        "project_2": {
                            "uid": p2.project_uid,
                            "title": p2.title,
                            "category": p2.category.value if p2.category else None,
                            "lat": p2.latitude,
                            "lon": p2.longitude,
                            "amount": p2.sanctioned_amount,
                        },
                        "distance_meters": round(distance, 2),
                        "radius_threshold": radius,
                    },
                    "explanation": (
                        f"Two {p1.category.value if p1.category else 'N/A'} projects found "
                        f"within {distance:.1f}m of each other:\n"
                        f"  1. {p1.project_uid}: '{p1.title}' (₹{p1.sanctioned_amount:,.0f})\n"
                        f"  2. {p2.project_uid}: '{p2.title}' (₹{p2.sanctioned_amount:,.0f})\n"
                        f"This may indicate duplicate asset creation."
                    ),
                })

    if alerts:
        logger.warning(f"🚨 Found {len(alerts)} potential duplicate works")
    return alerts


# ═══════════════════════════════════════════════════════════
# Run All Checks
# ═══════════════════════════════════════════════════════════

def run_all_anomaly_checks(db: Session, district: str = None, state: str = None) -> list[dict]:
    """
    Execute all anomaly detection checks and persist alerts to the database.

    Returns:
        Combined list of all detected anomaly alerts.
    """
    logger.info("=" * 60)
    logger.info("Running full anomaly detection sweep...")
    logger.info("=" * 60)

    all_alerts = []

    # 1. SC/ST Quota
    all_alerts.extend(check_sc_st_quota(db, district, state))

    # 2. Contractor Cartelization
    all_alerts.extend(detect_cartelization(db, district))

    # 3. Delay Risks
    all_alerts.extend(flag_delayed_projects(db))

    # 4. Duplicate Works
    all_alerts.extend(detect_duplicate_works(db))

    # Persist new alerts to database
    persisted = 0
    for alert_data in all_alerts:
        existing = db.query(AnomalyAlert).filter(
            AnomalyAlert.title == alert_data["title"],
            AnomalyAlert.status != AlertStatus.RESOLVED,
        ).first()

        if not existing:
            alert = AnomalyAlert(
                project_id=alert_data.get("project_id"),
                alert_type=alert_data["alert_type"],
                severity=alert_data["severity"],
                title=alert_data["title"],
                details=alert_data.get("details"),
                explanation=alert_data.get("explanation"),
                district=alert_data.get("district"),
                state=alert_data.get("state"),
            )
            db.add(alert)
            persisted += 1

    db.commit()

    logger.info(f"📊 Anomaly sweep complete: {len(all_alerts)} detected, {persisted} new alerts persisted")
    return all_alerts
