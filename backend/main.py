from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from database import engine, check_database_connection
from init_db import init_db
from auth import auth_router
from student import student_router
from recruiter import recruiter_router
from mentor import mentor_router
from admin import admin_router
from placement import student_workflow_router, recruiter_workflow_router
from resume import resume_router
from recommendation import recommendation_router
from skill_gap import skill_gap_router
from vector_store import vector_router, init_vector_store
from rag import rag_router

app = FastAPI(title="PLACER-AI Backend")

import os

cors_origins_env = os.getenv("CORS_ORIGINS", "*")
if cors_origins_env.strip() == "*":
    origins = ["*"]
else:
    origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include Routers (vector_router before parameterized job_id routes)
app.include_router(auth_router)
app.include_router(vector_router)
app.include_router(rag_router)
app.include_router(student_router)
app.include_router(recruiter_router)
app.include_router(mentor_router)
app.include_router(admin_router)
app.include_router(student_workflow_router)
app.include_router(recruiter_workflow_router)
app.include_router(resume_router)
app.include_router(recommendation_router)
app.include_router(skill_gap_router)



@app.on_event("startup")
def startup_event():
    """Safely initialize database tables and vector store on startup."""
    if engine:
        init_db()
    try:
        init_vector_store()
    except Exception:
        pass

@app.get("/health")
def health_check():
    """Checks backend server health."""
    return {"status": "ok"}

@app.get("/health/db")
def db_health_check(response: Response):
    """
    Checks PostgreSQL database connectivity.
    Returns 200 OK if connected, 503 Service Unavailable if disconnected.
    Exposes no credentials or stack traces.
    """
    result = check_database_connection()
    if result.get("database") != "connected":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return result

@app.get("/health/db/schema")
def db_schema_health(response: Response):
    """
    Safely checks database schema status and table count.
    Exposes no sensitive credentials or raw stack traces.
    """
    if not engine:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "error", "database": "disconnected", "table_count": 0, "tables": []}

    try:
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        return {
            "status": "ok",
            "database": "connected",
            "table_count": len(tables),
            "tables": tables
        }
    except Exception:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "error", "database": "error", "table_count": 0, "tables": []}
