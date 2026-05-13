import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine, SessionLocal
from app.routes import user, records, access
from app import models, auth

app = FastAPI(title="HealthBlocks API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Database ──────────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)


def create_test_users():
    """Seed three test accounts on first run (idempotent)."""
    db = SessionLocal()
    try:
        test_users = [
            {"name": "John Doe",       "email": "patient@example.com", "password": "password", "role": "patient"},
            {"name": "Dr. Sarah Chen", "email": "doctor@example.com",  "password": "password", "role": "doctor"},
            {"name": "Admin User",     "email": "admin@example.com",   "password": "password", "role": "admin"},
        ]
        for u in test_users:
            if not db.query(models.User).filter(models.User.email == u["email"]).first():
                db.add(models.User(
                    name=u["name"],
                    email=u["email"],
                    password=auth.hash_password(u["password"]),
                    role=u["role"],
                ))
                print(f"[seed] Created user: {u['email']}")
        db.commit()
    finally:
        db.close()


create_test_users()

# ── Static file serving ───────────────────────────────────────────────────────
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(user.router)
app.include_router(records.router)
app.include_router(access.router)


@app.get("/")
def home():
    return {"message": "HealthBlocks API running"}


@app.get("/health")
def health():
    return {"status": "ok"}