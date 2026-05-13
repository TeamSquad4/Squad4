from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # patient / doctor / admin
    created_at = Column(DateTime, server_default=func.now())


class MedicalRecord(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    record_name = Column(String, nullable=False)
    record_type = Column(String, default="Lab Report")   # Lab Report / Prescription / Scan / Discharge Summary
    file_path = Column(String, nullable=False)
    doctor_name = Column(String, default="")
    hospital = Column(String, default="")
    record_date = Column(String, default="")             # ISO date string YYYY-MM-DD
    description = Column(String, default="")
    notes = Column(String, default="")
    uploaded_at = Column(DateTime, server_default=func.now())
    blockchain_hash = Column(String, nullable=True)
    blockchain_tx = Column(String, nullable=True)


class AccessRequest(Base):
    __tablename__ = "access_requests"

    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")           # pending / approved / rejected
    requested_at = Column(DateTime, server_default=func.now())