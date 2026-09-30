from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from models.recruiter_profile import RecruiterProfile
from models.job import Job
from auth.dependencies import get_db, require_role
from schemas.recruiter import (
    RecruiterProfileResponse,
    RecruiterProfileUpdate,
    JobCreate,
    JobUpdate,
    JobResponse,
    RecruiterDashboardResponse,
)

router = APIRouter(prefix="/recruiter", tags=["Recruiter Module"])


def get_or_create_recruiter_profile(db: Session, user: User) -> RecruiterProfile:
    """Retrieves or safely creates a RecruiterProfile for the authenticated recruiter user."""
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == user.id).first()
    if not profile:
        profile = RecruiterProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# ==========================================
# 1. RECRUITER PROFILE ENDPOINTS
# ==========================================

@router.get("/profile", response_model=RecruiterProfileResponse)
def get_recruiter_profile(
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Returns the authenticated recruiter's profile and company details."""
    profile = get_or_create_recruiter_profile(db, current_user)
    return RecruiterProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        company_name=profile.company_name,
        designation=profile.designation,
        company_website=profile.company_website,
        company_industry=profile.company_industry,
        company_size=profile.company_size,
        company_description=profile.company_description,
        location=profile.location,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )


@router.put("/profile", response_model=RecruiterProfileResponse)
def update_recruiter_profile(
    profile_in: RecruiterProfileUpdate,
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Updates the authenticated recruiter's profile and organization details."""
    profile = get_or_create_recruiter_profile(db, current_user)

    update_data = profile_in.model_dump(exclude_unset=True)

    # User level updates
    if "full_name" in update_data and update_data["full_name"]:
        current_user.full_name = update_data.pop("full_name")
    if "phone" in update_data:
        current_user.phone = update_data.pop("phone")

    # Profile level updates
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(current_user)
    db.refresh(profile)

    return RecruiterProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        company_name=profile.company_name,
        designation=profile.designation,
        company_website=profile.company_website,
        company_industry=profile.company_industry,
        company_size=profile.company_size,
        company_description=profile.company_description,
        location=profile.location,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )


# ==========================================
# 2. RECRUITER JOB MANAGEMENT ENDPOINTS
# ==========================================

@router.get("/jobs", response_model=List[JobResponse])
def get_recruiter_jobs(
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Returns all jobs posted by the authenticated recruiter."""
    jobs = db.query(Job).filter(Job.recruiter_id == current_user.id).all()
    return jobs


@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_recruiter_job(
    job_in: JobCreate,
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Creates a new job posting associated with the authenticated recruiter."""
    profile = get_or_create_recruiter_profile(db, current_user)

    company_name = job_in.company_name or profile.company_name or "Acme Corp"

    job = Job(
        recruiter_id=current_user.id,
        title=job_in.title,
        company_name=company_name,
        description=job_in.description,
        location=job_in.location,
        job_type=job_in.job_type or "Full-time",
        experience_required=job_in.experience_required,
        salary_min=job_in.salary_min,
        salary_max=job_in.salary_max,
        skills_required=job_in.skills_required,
        application_deadline=job_in.application_deadline,
        status=job_in.status or "active"
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Synchronize with ChromaDB vector store
    try:
        from vector_store.indexer import index_job
        index_job(job)
    except Exception:
        pass

    return job


@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_recruiter_job_by_id(
    job_id: int,
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Returns a specific job posting if owned by the authenticated recruiter."""
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting not found")

    if job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this job posting")

    return job


@router.put("/jobs/{job_id}", response_model=JobResponse)
def update_recruiter_job(
    job_id: int,
    job_in: JobUpdate,
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Updates a job posting owned by the authenticated recruiter."""
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting not found")

    if job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this job posting")

    update_data = job_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)

    # Synchronize with ChromaDB vector store
    try:
        from vector_store.indexer import index_job, remove_job_index
        if job.status == "active":
            index_job(job)
        else:
            remove_job_index(job.id)
    except Exception:
        pass

    return job


@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recruiter_job(
    job_id: int,
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Deletes a job posting owned by the authenticated recruiter."""
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting not found")

    if job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this job posting")

    db.delete(job)
    db.commit()

    # Synchronize removal with ChromaDB vector store
    try:
        from vector_store.indexer import remove_job_index
        remove_job_index(job_id)
    except Exception:
        pass

    return None


# ==========================================
# 3. RECRUITER DASHBOARD ENDPOINT
# ==========================================

@router.get("/dashboard", response_model=RecruiterDashboardResponse)
def get_recruiter_dashboard_stats(
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Returns database-derived statistics for the authenticated recruiter."""
    jobs = db.query(Job).filter(Job.recruiter_id == current_user.id).all()

    total_jobs = len(jobs)
    active_jobs = sum(1 for j in jobs if (j.status or "").lower() in ["active", "open"])
    closed_jobs = sum(1 for j in jobs if (j.status or "").lower() in ["closed", "expired", "inactive"])

    return RecruiterDashboardResponse(
        total_jobs=total_jobs,
        active_jobs=active_jobs,
        closed_jobs=closed_jobs
    )
