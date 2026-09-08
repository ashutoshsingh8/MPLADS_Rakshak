"""
MPLAD Rakshak — Reports Router
================================
Aggregated statistics and summary endpoints for the Ministry dashboard.
"""

import logging
from collections import defaultdict

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import (
    Project, AnomalyAlert, ContractAward,
    ProjectStatus, AlertStatus, AlertSeverity,
)
from schemas import DashboardSummary

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    district: str = None,
    state: str = None,
    db: Session = Depends(get_db),
):
    """
    Get high-level aggregated statistics for the Ministry Admin dashboard.
    Includes project counts, financial summaries, alert counts, and SC/ST allocation.
    """
    # Base query with filters
    project_query = db.query(Project)
    alert_query = db.query(AnomalyAlert)

    if district:
        project_query = project_query.filter(Project.district.ilike(f"%{district}%"))
        alert_query = alert_query.filter(AnomalyAlert.district.ilike(f"%{district}%"))
    if state:
        project_query = project_query.filter(Project.state.ilike(f"%{state}%"))
        alert_query = alert_query.filter(AnomalyAlert.state.ilike(f"%{state}%"))

    projects = project_query.all()
    total_projects = len(projects)

    # Financial aggregation
    total_sanctioned = sum(p.sanctioned_amount or 0 for p in projects)
    total_expenditure = sum(p.expenditure_to_date or 0 for p in projects)
    utilization = (total_expenditure / total_sanctioned * 100) if total_sanctioned > 0 else 0

    # Status breakdown
    status_counts = defaultdict(int)
    category_counts = defaultdict(int)
    sc_st_amount = 0

    for p in projects:
        status_counts[p.status.value if p.status else "UNKNOWN"] += 1
        category_counts[p.category.value if p.category else "UNKNOWN"] += 1
        if p.is_sc_st_area:
            sc_st_amount += p.sanctioned_amount or 0

    sc_st_percent = (sc_st_amount / total_sanctioned * 100) if total_sanctioned > 0 else 0

    # Completion time analysis
    completed = [
        p for p in projects
        if p.status == ProjectStatus.COMPLETED
        and p.recommended_date
        and p.actual_completion_date
    ]
    avg_completion = None
    if completed:
        total_days = sum(
            (p.actual_completion_date - p.recommended_date).days for p in completed
        )
        avg_completion = total_days / len(completed)

    # Alert summary
    alerts_by_severity = defaultdict(int)
    open_alerts = 0
    critical_alerts = 0

    for alert in alert_query.all():
        alerts_by_severity[alert.severity.value if alert.severity else "UNKNOWN"] += 1
        if alert.status == AlertStatus.OPEN:
            open_alerts += 1
        if alert.severity == AlertSeverity.CRITICAL:
            critical_alerts += 1

    # State-wise summary
    state_map = defaultdict(lambda: {"state": "", "projects": 0, "sanctioned": 0, "expenditure": 0, "alerts": 0})
    for p in projects:
        s = p.state or "Unknown"
        state_map[s]["state"] = s
        state_map[s]["projects"] += 1
        state_map[s]["sanctioned"] += p.sanctioned_amount or 0
        state_map[s]["expenditure"] += p.expenditure_to_date or 0

    for alert in alert_query.all():
        s = alert.state or "Unknown"
        if s in state_map:
            state_map[s]["alerts"] += 1

    return DashboardSummary(
        total_projects=total_projects,
        total_sanctioned_amount=round(total_sanctioned, 2),
        total_expenditure=round(total_expenditure, 2),
        utilization_percent=round(utilization, 2),
        projects_by_status=dict(status_counts),
        projects_by_category=dict(category_counts),
        alerts_by_severity=dict(alerts_by_severity),
        open_alerts_count=open_alerts,
        critical_alerts_count=critical_alerts,
        avg_completion_days=round(avg_completion, 1) if avg_completion else None,
        sc_st_allocation_percent=round(sc_st_percent, 2),
        states_summary=list(state_map.values()),
    )


@router.get("/utilization-by-state")
def utilization_by_state(db: Session = Depends(get_db)):
    """Get fund utilization breakdown by state for heatmap visualization."""
    projects = db.query(Project).all()

    state_data = defaultdict(lambda: {"sanctioned": 0, "expenditure": 0, "projects": 0, "completed": 0})

    for p in projects:
        s = p.state or "Unknown"
        state_data[s]["sanctioned"] += p.sanctioned_amount or 0
        state_data[s]["expenditure"] += p.expenditure_to_date or 0
        state_data[s]["projects"] += 1
        if p.status == ProjectStatus.COMPLETED:
            state_data[s]["completed"] += 1

    result = []
    for state, data in state_data.items():
        utilization = (data["expenditure"] / data["sanctioned"] * 100) if data["sanctioned"] > 0 else 0
        result.append({
            "state": state,
            "total_sanctioned": data["sanctioned"],
            "total_expenditure": data["expenditure"],
            "utilization_percent": round(utilization, 2),
            "total_projects": data["projects"],
            "completed_projects": data["completed"],
            "completion_rate": round(data["completed"] / data["projects"] * 100, 1) if data["projects"] > 0 else 0,
        })

    result.sort(key=lambda x: x["utilization_percent"], reverse=True)
    return result


@router.get("/project-timeline")
def project_timeline(
    months: int = Query(12, ge=1, le=60),
    db: Session = Depends(get_db),
):
    """Get monthly project creation/completion trend data for charts."""
    from datetime import date, timedelta
    from calendar import monthrange

    today = date.today()
    start_date = today.replace(day=1) - timedelta(days=months * 30)

    projects = db.query(Project).filter(
        Project.recommended_date >= start_date
    ).all()

    monthly_data = defaultdict(lambda: {"recommended": 0, "sanctioned": 0, "completed": 0, "amount": 0})

    for p in projects:
        if p.recommended_date:
            key = p.recommended_date.strftime("%Y-%m")
            monthly_data[key]["recommended"] += 1
            monthly_data[key]["amount"] += p.sanctioned_amount or 0
        if p.sanctioned_date:
            key = p.sanctioned_date.strftime("%Y-%m")
            monthly_data[key]["sanctioned"] += 1
        if p.actual_completion_date:
            key = p.actual_completion_date.strftime("%Y-%m")
            monthly_data[key]["completed"] += 1

    result = [{"month": k, **v} for k, v in sorted(monthly_data.items())]
    return result
