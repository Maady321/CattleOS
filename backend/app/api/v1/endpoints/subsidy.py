from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.subsidy import SubsidyScheme, SubsidyApplication, SubsidyStatus
from app.schemas.subsidy import (
    SubsidySchemeResponse, 
    EligibilityResponse, 
    SubsidyApplicationResponse
)
from app.services.subsidy import SubsidyService
from uuid import UUID

router = APIRouter()

@router.get("/schemes", response_model=List[SubsidySchemeResponse])
def list_available_schemes(db: Session = Depends(deps.get_db)) -> Any:
    return db.query(SubsidyScheme).filter(SubsidyScheme.is_active == True).all()

@router.get("/schemes/{scheme_id}/check-eligibility", response_model=EligibilityResponse)
def check_scheme_eligibility(
    scheme_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = SubsidyService(db)
    return service.check_eligibility(current_user.farm_id, scheme_id)

@router.post("/apply/{scheme_id}", response_model=SubsidyApplicationResponse)
def start_application(
    scheme_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = SubsidyService(db)
    form_data = service.auto_fill_application(current_user.farm_id, scheme_id)
    
    app = SubsidyApplication(
        farm_id=current_user.farm_id,
        scheme_id=scheme_id,
        applicant_details=form_data,
        status=SubsidyStatus.DRAFT
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app

@router.get("/my-applications", response_model=List[SubsidyApplicationResponse])
def list_my_applications(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    return db.query(SubsidyApplication).filter(
        SubsidyApplication.farm_id == current_user.farm_id
    ).all()

@router.post("/applications/{application_id}/submit")
def submit_to_government(
    application_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """
    Finalizes the application and submits it to the virtual government portal.
    """
    service = SubsidyService(db)
    app = service.submit_application(application_id)
    return {"status": "SUBMITTED", "reference_number": app.reference_number}

@router.get("/applications/{application_id}/export-bundle")
def export_government_bundle(
    application_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """
    Generates a ZIP bundle of all required documents and auto-filled forms.
    """
    # Logic to bundle files and return a download URL
    return {"bundle_url": f"https://cdn.cattleos.com/bundles/{application_id}.zip"}
