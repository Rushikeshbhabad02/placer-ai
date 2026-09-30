import sys
import os
from database import engine
from models import Base

def init_db():
    """
    Safely creates all database tables defined in SQLAlchemy models.
    Does NOT drop, reset, or destroy any existing data.
    Can be executed safely multiple times.
    """
    if not engine:
        print("[DB] Cannot initialize database: Engine not connected (PostgreSQL server unavailable).")
        return False

    try:
        print("[DB] Creating PostgreSQL tables for PLACER-AI...")
        Base.metadata.create_all(bind=engine)
        print("[DB] Database tables initialized successfully!")
        return True
    except Exception as e:
        print(f"[DB] Error initializing database tables: {e}")
        return False

if __name__ == "__main__":
    init_db()
