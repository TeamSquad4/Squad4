import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.database import SessionLocal, Base, engine
from app import models, auth

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Create test users
test_users = [
    {"name": "John Doe", "email": "patient@example.com", "password": "password", "role": "patient"},
    {"name": "Dr. Sarah Chen", "email": "doctor@example.com", "password": "password", "role": "doctor"},
    {"name": "Admin User", "email": "admin@example.com", "password": "password", "role": "admin"},
]

for user_data in test_users:
    existing = db.query(models.User).filter(models.User.email == user_data["email"]).first()
    if not existing:
        new_user = models.User(
            name=user_data["name"],
            email=user_data["email"],
            password=auth.hash_password(user_data["password"]),
            role=user_data["role"]
        )
        db.add(new_user)
        print(f"Created user: {user_data['email']}")
    else:
        print(f"User already exists: {user_data['email']}")

db.commit()
db.close()

print("Test users created successfully!")