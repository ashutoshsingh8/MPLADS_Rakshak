"""
MPLAD Rakshak — Audit Router
==============================
Endpoints for anomaly alerts management and anomaly detection triggers.
"""

import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import AnomalyAlert, AlertStatus, AlertSeverity, AlertType
from schemas import AnomalyAlertResponse, AnomalyActionRequest, AnomalyListResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/audit", tags=["Audit & Anomalies"])


@router.get("/anomalies", response_model=AnomalyListResponse)
def list_anomalies(
    status: str = None,
    severity: str = None,
    alert_type: str = None,
    district: str = None,
    state: str = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    List all anomaly alerts with filtering.
    Returns alerts sorted by severity (CRITICAL first) and recency.
    """
    query = db.query(AnomalyAlert)

    if status:
        try:
            query = query.filter(AnomalyAlert.status == AlertStatus[status])
        except KeyError:
            pass

    if severity:
        try:
            query = query.filter(AnomalyAlert.severity == AlertSeverity[severity])
        except KeyError:
            pass

    if alert_type:
        try:
            query = query.filter(AnomalyAlert.alert_type == AlertType[alert_type])
        except KeyError:
            pass

    if district:
        query = query.filter(AnomalyAlert.district.ilike(f"%{district}%"))

    if state:
        query = query.filter(AnomalyAlert.state.ilike(f"%{state}%"))

    total = query.count()

    # Count by status
    open_count = query.filter(AnomalyAlert.status == AlertStatus.OPEN).count()
    critical_count = query.filter(AnomalyAlert.severity == AlertSeverity.CRITICAL).count()

    # Sort: CRITICAL first, then by recency
    severity_order = {
        AlertSeverity.CRITICAL: 0,
        AlertSeverity.HIGH: 1,
        AlertSeverity.MEDIUM: 2,
        AlertSeverity.LOW: 3,
    }

    alerts = (
        query
        .order_by(AnomalyAlert.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # Sort in Python by severity (since MySQL enum ordering may differ)
    alerts.sort(key=lambda a: (severity_order.get(a.severity, 9), -(a.created_at or datetime.min).timestamp()))

    # Serialize
    alert_responses = []
    for alert in alerts:
        alert_responses.append(AnomalyAlertResponse(
            id=alert.id,
            project_id=alert.project_id,
            alert_type=alert.alert_type.value if alert.alert_type else None,
            severity=alert.severity.value if alert.severity else None,
            title=alert.title,
            details=alert.details,
            explanation=alert.explanation,
            matched_guideline_clause=alert.matched_guideline_clause,
            confidence_score=alert.confidence_score,
            status=alert.status.value if alert.status else None,
            district=alert.district,
            state=alert.state,
            created_at=alert.created_at,
        ))

    return AnomalyListResponse(
        alerts=alert_responses,
        total=total,
        open_count=open_count,
        critical_count=critical_count,
    )


@router.post("/anomalies/{alert_id}/action", response_model=AnomalyAlertResponse)
def update_anomaly_status(
    alert_id: int,
    action: AnomalyActionRequest,
    db: Session = Depends(get_db),
):
    """
    Update an anomaly alert's status (OPEN → INVESTIGATING → RESOLVED).
    """
    alert = db.query(AnomalyAlert).filter(AnomalyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Anomaly alert not found")

    alert.status = AlertStatus[action.new_status.value]
    alert.resolution_notes = action.resolution_notes
    alert.updated_at = datetime.utcnow()

    if action.new_status == AlertStatus.RESOLVED:
        alert.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(alert)

    return AnomalyAlertResponse(
        id=alert.id,
        project_id=alert.project_id,
        alert_type=alert.alert_type.value,
        severity=alert.severity.value,
        title=alert.title,
        details=alert.details,
        explanation=alert.explanation,
        matched_guideline_clause=alert.matched_guideline_clause,
        confidence_score=alert.confidence_score,
        status=alert.status.value,
        district=alert.district,
        state=alert.state,
        created_at=alert.created_at,
    )


@router.post("/run-sweep")
def run_anomaly_sweep(
    district: str = None,
    state: str = None,
    db: Session = Depends(get_db),
):
    """
    Trigger a full anomaly detection sweep across all projects.
    Runs SC/ST quota checks, cartelization detection, delay flagging,
    and duplicate work detection.
    """
    from services.anomaly_engine import run_all_anomaly_checks

    alerts = run_all_anomaly_checks(db, district, state)

    return {
        "message": "Anomaly sweep completed",
        "total_alerts_detected": len(alerts),
        "by_type": _count_by_field(alerts, "alert_type"),
        "by_severity": _count_by_field(alerts, "severity"),
    }


def _count_by_field(alerts: list[dict], field: str) -> dict:
    """Count alerts by a given field."""
    counts = {}
    for alert in alerts:
        val = alert.get(field)
        key = val.value if hasattr(val, "value") else str(val)
        counts[key] = counts.get(key, 0) + 1
    return counts


@router.get("/stats")
def get_anomaly_stats(db: Session = Depends(get_db)):
    """Get aggregate anomaly statistics for dashboard widgets."""
    total = db.query(AnomalyAlert).count()
    open_count = db.query(AnomalyAlert).filter(AnomalyAlert.status == AlertStatus.OPEN).count()
    investigating = db.query(AnomalyAlert).filter(AnomalyAlert.status == AlertStatus.INVESTIGATING).count()
    resolved = db.query(AnomalyAlert).filter(AnomalyAlert.status == AlertStatus.RESOLVED).count()

    by_severity = {}
    for sev in AlertSeverity:
        count = db.query(AnomalyAlert).filter(AnomalyAlert.severity == sev).count()
        by_severity[sev.value] = count

    by_type = {}
    for at in AlertType:
        count = db.query(AnomalyAlert).filter(AnomalyAlert.alert_type == at).count()
        if count > 0:
            by_type[at.value] = count

    return {
        "total": total,
        "open": open_count,
        "investigating": investigating,
        "resolved": resolved,
        "by_severity": by_severity,
        "by_type": by_type,
    }
