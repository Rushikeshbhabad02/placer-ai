from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth.dependencies import get_db, require_role
from models.user import User
from models.student_profile import StudentProfile
from models.job import Job

from recommendation.engine import recommendation_engine
from schemas.recommendation import (
    StudentRecommendationsResponse,
    JobMatchResponse,
    JobRecommendationItem
)

recommendation_router = APIRouter(tags=["Recommendation Engine"])

def get_or_create_student_profile(db: Session, user: User) -> StudentProfile:
    """Helper to ensure student profile exists for recommendation matching."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@recommendation_router.get("/student/recommendations", response_model=StudentRecommendationsResponse)
def get_student_recommendations(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """
    Get top AI-style job recommendations for the authenticated student.
    Returns deterministic recommendations ranked by match score.
    """
    student_profile = get_or_create_student_profile(db, current_user)
    return recommendation_engine.get_recommendations(student_profile, db, limit=limit)

@recommendation_router.get("/student/jobs/{job_id}/match", response_model=JobMatchResponse)
def get_job_match(
    job_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """
    Get detailed match score, skill breakdown, eligibility, and explanations
    for a specific job against the authenticated student's profile.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    
    student_profile = get_or_create_student_profile(db, current_user)
    return recommendation_engine.compute_job_match(student_profile, job, db)

@recommendation_router.get("/recruiter/jobs/{job_id}/candidate-matches")
def get_recruiter_candidate_matches(
    job_id: int,
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """
    Recruiter endpoint to view top matching candidate profiles for a specific job.
    Enforces recruiter ownership: recruiter can only view matches for their own jobs.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    
    if job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only view candidate matches for your own jobs."
        )

    students = db.query(StudentProfile).all()
    candidate_matches = []

    for std in students:
        if not std.user or std.user.role != "student":
            continue

        match_res = recommendation_engine.compute_job_match(std, job, db)
        
        cand_name = getattr(std.user, "full_name", None) or getattr(std.user, "name", None) or "Student Candidate"
        # Only include safe candidate summary fields
        candidate_matches.append({
            "student_id": std.id,
            "candidate_name": cand_name,
            "college": std.college or "N/A",
            "degree": std.degree or "N/A",
            "branch": std.branch or "N/A",
            "cgpa": std.cgpa,
            "match_score": match_res.match_score,
            "match_level": match_res.match_level,
            "matched_skills": match_res.matched_skills,
            "missing_skills": match_res.missing_skills,
            "reasons": match_res.reasons[:3]
        })

    candidate_matches.sort(key=lambda x: x["match_score"], reverse=True)
    return {
        "job_id": job.id,
        "job_title": job.title,
        "candidates": candidate_matches[:limit],
        "total": len(candidate_matches)
    }
