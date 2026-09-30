import os
import sys
from dotenv import load_dotenv
from database import SessionLocal
from models.user import User
from auth.security import hash_password

load_dotenv()

def create_admin(full_name: str = "System Admin", email: str = "admin@placer.ai", password: str = "AdminPassword123!"):
    """
    Safely creates an initial admin account if not existing.
    Never prints password and never overwrites existing admin.
    """
    if not SessionLocal:
        print("[DB] Cannot create admin: Database engine not connected.")
        return False

    db = SessionLocal()
    try:
        normalized_email = email.strip().lower()
        existing = db.query(User).filter(User.email == normalized_email).first()
        if existing:
            print(f"[Admin] Account '{normalized_email}' already exists.")
            return True

        hashed_pw = hash_password(password)
        admin_user = User(
            full_name=full_name,
            email=normalized_email,
            password_hash=hashed_pw,
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print(f"[Admin] Admin account '{normalized_email}' created successfully.")
        return True
    except Exception as e:
        db.rollback()
        print(f"[Admin] Error creating admin account: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
