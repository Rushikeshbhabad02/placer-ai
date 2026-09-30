from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth.dependencies import get_db, require_role
from models.user import User
from models.student_profile import StudentProfile
from models.job import Job

from skill_gap.analyzer import skill_gap_analyzer
from skill_gap.role_profiles import get_supported_target_roles
from schemas.skill_gap import JobSkillGapResponse, RoleSkillGapResponse

skill_gap_router = APIRouter(prefix="", tags=["Skill Gap Analysis"])

def get_or_create_student_profile(db: Session, user: User) -> StudentProfile:
    """Helper to retrieve or safely instantiate StudentProfile for authenticated student."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@skill_gap_router.get("/student/skill-gap", response_model=RoleSkillGapResponse)
def get_target_role_skill_gap(
    target_role: str = Query("Python Full Stack Developer", description="Target role / career domain"),
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """
    Get career-level skill gap analysis and learning roadmap for a target role/domain.
    Derives student profile from JWT authentication token.
    """
    student_profile = get_or_create_student_profile(db, current_user)
    try:
        return skill_gap_analyzer.analyze_role_skill_gap(student_profile, target_role, db)
    except ValueError as err:
        supported = ", ".join(get_supported_target_roles())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported target_role '{target_role}'. Supported target roles are: {supported}"
        )

@skill_gap_router.get("/student/jobs/{job_id}/skill-gap", response_model=JobSkillGapResponse)
def get_job_specific_skill_gap(
    job_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """
    Get job-specific skill gap analysis and targeted learning roadmap for a specific job.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )

    student_profile = get_or_create_student_profile(db, current_user)
    return skill_gap_analyzer.analyze_job_skill_gap(student_profile, job, db)
