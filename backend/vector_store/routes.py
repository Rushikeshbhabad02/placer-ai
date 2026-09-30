from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth.dependencies import get_db, require_role
from models.user import User
from models.job import Job
from models.student_profile import StudentProfile

from vector_store.search import semantic_search_jobs, semantic_match_student_to_job
from vector_store.indexer import reindex_all_jobs
from vector_store.chroma_client import is_vector_store_available

vector_router = APIRouter(prefix="", tags=["Vector Store & Semantic Search"])


@vector_router.get("/student/jobs/semantic-search")
def search_jobs_semantically(
    q: str = Query(..., description="Natural language search query"),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """
    Executes natural language semantic search for active jobs using ChromaDB vector store.
    Access restricted to authenticated student users.
    """
    if not q or not q.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid search query"
        )

    return semantic_search_jobs(q.strip(), db, limit=limit)


@vector_router.get("/student/jobs/{job_id}/semantic-match")
def get_job_semantic_match(
    job_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """
    Calculates direct semantic similarity score between authenticated student's profile and a target job.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    score = semantic_match_student_to_job(profile, job, db)
    return {
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company_name,
        "semantic_score": score,
        "similarity_percentage": round(score * 100.0, 1)
    }


@vector_router.post("/admin/vector/jobs/reindex")
def trigger_admin_job_reindex(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Admin-only endpoint to trigger a complete re-indexing of all active PostgreSQL jobs into ChromaDB.
    """
    if not is_vector_store_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ChromaDB vector store service is currently unavailable"
        )

    summary = reindex_all_jobs(db)
    return {
        "message": "Bulk job vector indexing completed successfully",
        "summary": summary
    }
