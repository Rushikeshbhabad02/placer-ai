from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_db, require_role
from models.user import User
from models.student_profile import StudentProfile
from models.job import Job

from schemas.rag import (
    AIChatRequest,
    AIChatResponse,
    JobAIAnalysisRequest,
    JobAIAnalysisResponse,
    AIHealthResponse
)
from rag.service import rag_service
from rag.ollama_client import ollama_client

rag_router = APIRouter(tags=["RAG Generative AI Assistant"])

def get_or_create_student_profile(db: Session, user: User) -> StudentProfile:
    """Helper to ensure student profile exists for RAG context building."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@rag_router.get("/ai/health", response_model=AIHealthResponse)
def get_ai_health():
    """
    Public / controlled health check for local Ollama AI service.
    Exposes availability and model name without exposing machine internals.
    """
    status_dict = ollama_client.health_check()
    return AIHealthResponse(
        available=status_dict.get("available", False),
        model=status_dict.get("model", "llama3.2"),
        message=status_dict.get("message", "Local AI service check completed.")
    )

@rag_router.post("/student/ai/chat", response_model=AIChatResponse)
def student_ai_chat(
    req: AIChatRequest,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """
    RAG-powered student career AI chat assistant.
    Retrieves student profile, active resumes/ATS, and semantically relevant jobs
    before generating a grounded answer via local Ollama LLM.
    """
    student_profile = get_or_create_student_profile(db, current_user)
    result = rag_service.answer_student_question(student_profile, req.question, db)
    return AIChatResponse(
        answer=result.get("answer", ""),
        sources=result.get("sources", []),
        grounded=result.get("grounded", True),
        ai_available=result.get("ai_available", True)
    )

@rag_router.post("/student/jobs/{job_id}/ai-analysis", response_model=JobAIAnalysisResponse)
def job_ai_analysis(
    job_id: int,
    req: Optional[JobAIAnalysisRequest] = None,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """
    Job-specific AI match & skill-gap analysis assistant.
    Validates job existence and active status.
    Combines Step 11 match score, Step 12 skill gap, and Step 10 ATS analysis
    to provide grounded natural language explanations.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job or job.status != "active":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active job with ID {job_id} not found"
        )

    student_profile = get_or_create_student_profile(db, current_user)
    custom_q = req.question if req else None

    result = rag_service.analyze_job_with_ai(student_profile, job, custom_q, db)
    return JobAIAnalysisResponse(
        job_id=job.id,
        answer=result.get("answer", ""),
        match_score=result.get("match_score"),
        missing_skills=result.get("missing_skills", []),
        sources=result.get("sources", []),
        grounded=result.get("grounded", True),
        ai_available=result.get("ai_available", True)
    )
