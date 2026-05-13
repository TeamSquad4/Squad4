from pydantic import BaseModel, EmailStr
from typing import Optional


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str  # patient / doctor / admin


class LoginSchema(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    token: str
    role: str
    user_id: int


# ── Users / Profile ───────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# ── Records ───────────────────────────────────────────────────────────────────

class RecordResponse(BaseModel):
    id: int
    patient_id: int
    record_name: str
    record_type: str
    file_path: str
    doctor_name: str
    hospital: str
    record_date: str
    description: str
    notes: str
    blockchain_hash: str | None = None
    blockchain_tx : str | None = None

    class Config:
        from_attributes = True


# ── Access ────────────────────────────────────────────────────────────────────

class AccessRequestResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    status: str

    class Config:
        from_attributes = True


class PatientResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True