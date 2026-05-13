from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, auth
from app.schemas import UserCreate, LoginSchema, TokenResponse, UserResponse

router = APIRouter(prefix="/users", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == data.email).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        name=data.name,
        email=data.email,
        password=auth.hash_password(data.password),
        role=data.role,
        phone=data.phone,
        dob=data.dob,
        gender=data.gender,
        blood_group=data.blood_group,
        address=data.address,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=TokenResponse)
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not auth.verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = auth.create_token({"sub": str(user.id), "role": user.role})

    return {
        "token": token,
        "role": user.role,
        "user_id": user.id,
    }


@router.get("/profile", response_model=UserResponse)
@router.get("/me", response_model=UserResponse)
def get_profile(
    current_user: dict = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == int(current_user["sub"])).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user