import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env file
load_dotenv()

DEFAULT_SQLITE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "test_placer_ai.db"))
DEFAULT_SQLITE_URL = f"sqlite:///{DEFAULT_SQLITE_PATH}"

DATABASE_URL = os.getenv("DATABASE_URL")

def create_db_engine(url: str):
    if "sqlite" in url:
        return create_engine(url, connect_args={"check_same_thread": False})
    else:
        return create_engine(url, pool_pre_ping=True, connect_args={"connect_timeout": 3})

engine = None
SessionLocal = None

target_url = DATABASE_URL or "postgresql+psycopg://postgres:postgres@localhost:5432/placer_ai"

try:
    temp_engine = create_db_engine(target_url)
    with temp_engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    engine = temp_engine
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception:
    # Fallback to SQLite if primary DB connection fails
    try:
        engine = create_db_engine(DEFAULT_SQLITE_URL)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    except Exception:
        engine = None
        SessionLocal = None


def check_database_connection() -> dict:
    """
    Safely tests the connection to PostgreSQL database.
    Returns status dict without exposing credentials or stack traces.
    """
    if not engine:
        return {"status": "error", "database": "disconnected"}

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            return {"status": "ok", "database": "connected"}
    except Exception:
        return {"status": "error", "database": "disconnected"}
