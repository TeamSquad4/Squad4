from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, auth
from app.schemas import AccessRequestResponse, PatientResponse

router = APIRouter(prefix="/access", tags=["access"])


@router.post("/request-access", response_model=AccessRequestResponse, status_code=201)
def request_access(
    patient_id: int,
    current_user: dict = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Doctor requests access to a patient's records."""
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can request access")

    doctor_id = int(current_user["sub"])

    # Verify patient exists
    patient = db.query(models.User).filter(models.User.id == patient_id, models.User.role == "patient").first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Prevent duplicate pending requests
    existing = (
        db.query(models.AccessRequest)
        .filter(
            models.AccessRequest.doctor_id == doctor_id,
            models.AccessRequest.patient_id == patient_id,
            models.AccessRequest.status == "pending",
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Access request already pending")

    access_req = models.AccessRequest(
        patient_id=patient_id,
        doctor_id=doctor_id,
        status="pending",
    )
    db.add(access_req)
    db.commit()
    db.refresh(access_req)
    return access_req


@router.post("/approve/{request_id}", response_model=AccessRequestResponse)
def approve_access(
    request_id: int,
    current_user: dict = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Patient approves a doctor's access request."""
    patient_id = int(current_user["sub"])
    req = db.query(models.AccessRequest).filter(models.AccessRequest.id == request_id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.patient_id != patient_id:
        raise HTTPException(status_code=403, detail="Not your request to approve")

    req.status = "approved"
    db.commit()
    db.refresh(req)
    return req


@router.post("/reject/{request_id}", response_model=AccessRequestResponse)
def reject_access(
    request_id: int,
    current_user: dict = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Patient rejects a doctor's access request."""
    patient_id = int(current_user["sub"])
    req = db.query(models.AccessRequest).filter(models.AccessRequest.id == request_id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.patient_id != patient_id:
        raise HTTPException(status_code=403, detail="Not your request to reject")

    req.status = "rejected"
    db.commit()
    db.refresh(req)
    return req


@router.get("/my-requests", response_model=List[AccessRequestResponse])
def get_my_requests(
    current_user: dict = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Patient: list all access requests made to them."""
    patient_id = int(current_user["sub"])
    return (
        db.query(models.AccessRequest)
        .filter(models.AccessRequest.patient_id == patient_id)
        .all()
    )


@router.get("/my-patients", response_model=List[PatientResponse])
def get_my_patients(
    current_user: dict = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Doctor: list all patients who have approved access."""
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can view their patients")

    doctor_id = int(current_user["sub"])

    approved = (
        db.query(models.AccessRequest)
        .filter(
            models.AccessRequest.doctor_id == doctor_id,
            models.AccessRequest.status == "approved",
        )
        .all()
    )

    patient_ids = [r.patient_id for r in approved]
    if not patient_ids:
        return []

    patients = db.query(models.User).filter(models.User.id.in_(patient_ids)).all()
    return patients