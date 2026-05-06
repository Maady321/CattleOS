from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.observability import AlertRule, AlertIncident, AlertStatus, AlertSeverity
from app.schemas.observability import (
    AlertRuleResponse, 
    AlertIncidentResponse, 
    AlertDashboardData
)
from uuid import UUID

router = APIRouter()

@router.get("/incidents", response_model=List[AlertIncidentResponse])
def get_active_incidents(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    return db.query(AlertIncident).filter(
        AlertIncident.status != AlertStatus.RESOLVED
    ).order_by(AlertIncident.starts_at.desc()).all()

@router.post("/incidents/{incident_id}/acknowledge")
def acknowledge_incident(
    incident_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    incident = db.query(AlertIncident).get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident.status = AlertStatus.ACKNOWLEDGED
    incident.acknowledged_by = current_user.id
    db.commit()
    return {"status": "success"}

@router.get("/dashboard", response_model=AlertDashboardData)
def get_observability_dashboard(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    firing = db.query(AlertIncident).filter(AlertIncident.status == AlertStatus.FIRING).all()
    critical_count = sum(1 for i in firing if i.rule.severity in [AlertSeverity.CRITICAL, AlertSeverity.EMERGENCY])
    
    recent_resolved = db.query(AlertIncident).filter(
        AlertIncident.status == AlertStatus.RESOLVED
    ).order_by(AlertIncident.ends_at.desc()).limit(10).all()
    
    return {
        "firing_count": len(firing),
        "critical_count": critical_count,
        "active_incidents": firing,
        "recent_resolutions": recent_resolved
    }

@router.get("/rules", response_model=List[AlertRuleResponse])
def list_rules(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    return db.query(AlertRule).all()
