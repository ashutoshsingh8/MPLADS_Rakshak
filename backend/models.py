"""
MPLAD Rakshak — SQLAlchemy Models
==================================
Defines the relational schema for MPLADS project management,
contractor tracking, site inspections, and anomaly alerts.
"""

import enum
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, Date,
    Enum, JSON, ForeignKey
)
from sqlalchemy.orm import relationship
from database import Base


# ═══════════════════════════════════════════════════════════
# Enumerations
# ═══════════════════════════════════════════════════════════

class UserRole(str, enum.Enum):
    MINISTRY_ADMIN = "MINISTRY_ADMIN"
    DISTRICT_AUTHORITY = "DISTRICT_AUTHORITY"
    MP = "MP"
    CONTRACTOR = "CONTRACTOR"


class ProjectStatus(str, enum.Enum):
    RECOMMENDED = "RECOMMENDED"
    SANCTIONED = "SANCTIONED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FLAGGED_REVIEW = "FLAGGED_REVIEW"


class ProjectCategory(str, enum.Enum):
    DRINKING_WATER = "DRINKING_WATER"
    ROADS = "ROADS"
    SANITATION = "SANITATION"
    EDUCATION = "EDUCATION"
    HEALTH = "HEALTH"
    ELECTRICITY = "ELECTRICITY"
    COMMUNITY_CENTER = "COMMUNITY_CENTER"
    SPORTS = "SPORTS"
    IRRIGATION = "IRRIGATION"
    OTHER = "OTHER"


class SCSTCategory(str, enum.Enum):
    SC = "SC"
    ST = "ST"
    GENERAL = "GENERAL"


class AlertType(str, enum.Enum):
    RULE_VIOLATION = "RULE_VIOLATION"
    BUDGET_INFLATION = "BUDGET_INFLATION"
    DELAY_RISK = "DELAY_RISK"
    CARTELIZATION = "CARTELIZATION"
    DUPLICATE_ASSET = "DUPLICATE_ASSET"
    GEO_MISMATCH = "GEO_MISMATCH"
    PHOTO_TAMPERED = "PHOTO_TAMPERED"
    QUOTA_FAILURE = "QUOTA_FAILURE"


class AlertSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertStatus(str, enum.Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"


# ═══════════════════════════════════════════════════════════
# Models
# ═══════════════════════════════════════════════════════════

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    email = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    recommended_projects = relationship("Project", back_populates="recommending_mp")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_uid = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(ProjectCategory), nullable=False)

    # Location
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # MP Reference
    recommended_by_mp_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    recommending_mp = relationship("User", back_populates="recommended_projects")

    # Financials
    sanctioned_amount = Column(Float, nullable=True)
    revised_amount = Column(Float, nullable=True)
    expenditure_to_date = Column(Float, default=0.0)

    # Timeline
    recommended_date = Column(Date, nullable=True)
    sanctioned_date = Column(Date, nullable=True)
    stipulated_completion_date = Column(Date, nullable=True)
    actual_completion_date = Column(Date, nullable=True)

    # Status
    status = Column(Enum(ProjectStatus), default=ProjectStatus.RECOMMENDED)

    # SC/ST Classification
    is_sc_st_area = Column(Boolean, default=False)
    sc_st_category = Column(Enum(SCSTCategory), default=SCSTCategory.GENERAL)

    # Metadata
    physical_progress_percent = Column(Float, default=0.0)
    implementing_agency = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    contract_awards = relationship("ContractAward", back_populates="project")
    inspection_photos = relationship("SiteInspectionPhoto", back_populates="project")
    anomaly_alerts = relationship("AnomalyAlert", back_populates="project")


class Contractor(Base):
    __tablename__ = "contractors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(300), nullable=False)
    pan_gstin = Column(String(50), unique=True, nullable=True, index=True)
    registered_address = Column(Text, nullable=True)
    contact_phone = Column(String(20), nullable=True)
    contact_email = Column(String(200), nullable=True)
    risk_score = Column(Float, default=0.0)
    total_contracts = Column(Integer, default=0)
    is_blacklisted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    contract_awards = relationship("ContractAward", back_populates="contractor")


class ContractAward(Base):
    __tablename__ = "contract_awards"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), nullable=False)
    awarded_amount = Column(Float, nullable=False)
    award_date = Column(Date, nullable=True)
    completion_date = Column(Date, nullable=True)
    status = Column(String(50), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="contract_awards")
    contractor = relationship("Contractor", back_populates="contract_awards")


class SiteInspectionPhoto(Base):
    __tablename__ = "site_inspection_photos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    # File info
    image_url = Column(String(500), nullable=False)
    original_filename = Column(String(300), nullable=True)

    # EXIF extracted data
    exif_latitude = Column(Float, nullable=True)
    exif_longitude = Column(Float, nullable=True)
    exif_timestamp = Column(DateTime, nullable=True)
    exif_camera_make = Column(String(100), nullable=True)
    exif_camera_model = Column(String(100), nullable=True)
    exif_software = Column(String(200), nullable=True)

    # Verification results
    geo_distance_meters = Column(Float, nullable=True)
    is_metadata_tampered = Column(Boolean, default=False)
    tampering_reason = Column(Text, nullable=True)

    uploaded_at = Column(DateTime, default=datetime.utcnow)
    uploaded_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    project = relationship("Project", back_populates="inspection_photos")


class AnomalyAlert(Base):
    __tablename__ = "anomaly_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    alert_type = Column(Enum(AlertType), nullable=False)
    severity = Column(Enum(AlertSeverity), nullable=False)
    title = Column(String(300), nullable=False)
    details = Column(JSON, nullable=True)
    explanation = Column(Text, nullable=True)

    # AI-generated reference
    matched_guideline_clause = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)

    # Status tracking
    status = Column(Enum(AlertStatus), default=AlertStatus.OPEN)
    resolved_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)

    # Metadata
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="anomaly_alerts")
