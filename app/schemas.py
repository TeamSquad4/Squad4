from pydantic import BaseModel, EmailStr
from typing import Literal


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["patient", "doctor", "admin"]
    phone: str | None = None
    dob: str | None = None
    gender: str | None = None
    blood_group: str | None = None
    address: str | None = None

class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    token: str
    role: str
    user_id: int


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: str | None = None
    dob: str | None = None
    gender: str | None = None
    blood_group: str | None = None
    address: str | None = None

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True


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
    blockchain_tx: str | None = None

    class Config:
        from_attributes = True


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