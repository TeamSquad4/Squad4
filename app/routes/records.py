import os
import uuid
import hashlib
from app.blockchain.blockchain_service import store_hash
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, auth
from app.schemas import RecordResponse

router = APIRouter(prefix="/records", tags=["records"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=RecordResponse, status_code=201)
async def upload_record(
    file: UploadFile = File(...),
    record_name: str = Form(default=""),
    record_type: str = Form(default="Lab Report"),
    doctor_name: str = Form(default=""),
    hospital: str = Form(default=""),
    record_date: str = Form(default=""),
    description: str = Form(default=""),
    notes: str = Form(default=""),
    current_user: dict = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    patient_id = int(current_user["sub"])

    # Save file with a unique name to avoid collisions
    ext = os.path.splitext(file.filename or "file")[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    contents = await file.read()
    file_hash = hashlib.sha256(contents).hexdigest()
    try:
        tx_hash = store_hash(str(patient_id), file_hash)
    except Exception as e:
        print(f"[blockchain] Failed to store hash: {e}")
        tx_hash = None
    with open(file_path, "wb") as f:
        f.write(contents)

    # Use original filename as record name if none provided
    final_name = record_name.strip() or (file.filename or unique_name)

    record = models.MedicalRecord(
        patient_id=patient_id,
        record_name=final_name,
        record_type=record_type,
        file_path=file_path,
        doctor_name=doctor_name,
        hospital=hospital,
        record_date=record_date,
        description=description,
        notes=notes,
        blockchain_hash=file_hash,
        blockchain_tx=tx_hash
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{patient_id}", response_model=List[RecordResponse])
def get_records(
    patient_id: int,
    current_user: dict = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    caller_id = int(current_user["sub"])
    caller_role = current_user.get("role", "")

    # Patients can only access their own records
    if caller_role == "patient" and caller_id != patient_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Doctors must have an approved access request
    if caller_role == "doctor":
        approved = (
            db.query(models.AccessRequest)
            .filter(
                models.AccessRequest.doctor_id == caller_id,
                models.AccessRequest.patient_id == patient_id,
                models.AccessRequest.status == "approved",
            )
            .first()
        )
        if not approved:
            raise HTTPException(
                status_code=403,
                detail="No approved access to this patient's records",
            )

    records = (
        db.query(models.MedicalRecord)
        .filter(models.MedicalRecord.patient_id == patient_id)
        .all()
    )

    return records
@router.get("/verify/{record_id}")
def verify_record(
    record_id: int,
    current_user: dict = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.id == record_id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    with open(record.file_path, "rb") as f:
        current_hash = hashlib.sha256(f.read()).hexdigest()

    is_valid = current_hash == record.blockchain_hash

    return {
        "record_id": record.id,
        "stored_hash": record.blockchain_hash,
        "current_hash": current_hash,
        "is_valid": is_valid,
        "message": "File is valid ✅" if is_valid else "File has been tampered ❌"
    }