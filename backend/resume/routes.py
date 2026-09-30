import os
import re
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from models.student_profile import StudentProfile
from models.resume import Resume
from models.job import Job
from auth.dependencies import get_db, require_role
from schemas.resume import ResumeResponse, ATSAnalysisRequest, ATSAnalysisResponse
from .extractor import extract_text_from_file
from .ats_analyzer import analyze_resume_text

router = APIRouter(prefix="/student/resumes", tags=["Student Resumes & ATS Module"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/x-pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/docx",
    "application/octet-stream"
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def get_or_create_student_profile(db: Session, user: User) -> StudentProfile:
    """Retrieves or safely creates a StudentProfile for the authenticated student user."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """
    Uploads a student resume file (PDF or DOCX), validates size/type,
    stores file securely on server, and creates a Resume metadata record in PostgreSQL.
    """
    student_profile = get_or_create_student_profile(db, current_user)

    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{ext}'. Only PDF (.pdf) and Word (.docx) files are allowed."
        )

    content_type = (file.content_type or "").lower()
    if content_type and content_type not in ALLOWED_MIME_TYPES and ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="MIME type validation failed. Uploaded file is not a valid PDF or DOCX document."
        )

    # Read and check file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({len(contents) / (1024*1024):.1f} MB) exceeds maximum allowed limit of 10 MB."
        )

    # Generate secure storage filename preventing path traversal
    clean_original = re.sub(r"[^a-zA-Z0-9_\.-]", "_", file.filename)
    safe_filename = f"{uuid.uuid4().hex}_{clean_original}"
    storage_path = os.path.join(UPLOAD_DIR, safe_filename)

    # Save to disk
    with open(storage_path, "wb") as f:
        f.write(contents)

    # Set existing student resumes to inactive
    db.query(Resume).filter(Resume.student_id == student_profile.id).update({"is_active": False})

    # Create new Resume record
    resume = Resume(
        student_id=student_profile.id,
        file_name=file.filename,
        file_path=storage_path,
        file_type=file.content_type or f"application/{ext.replace('.', '')}",
        file_size=len(contents),
        is_active=True
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeResponse.model_validate(resume)


@router.get("", response_model=List[ResumeResponse])
def get_student_resumes(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns all resumes owned by the authenticated student."""
    student_profile = get_or_create_student_profile(db, current_user)
    resumes = db.query(Resume).filter(Resume.student_id == student_profile.id).order_by(Resume.id.desc()).all()
    return [ResumeResponse.model_validate(r) for r in resumes]


@router.delete("/{resume_id}")
def delete_student_resume(
    resume_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Deletes a specific resume owned by the student."""
    student_profile = get_or_create_student_profile(db, current_user)
    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    if resume.student_id != student_profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this resume")

    # Safely remove file from storage if present
    if resume.file_path and os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception as e:
            print(f"[FileDeleteNotice] Could not delete disk file {resume.file_path}: {e}")

    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}


@router.post("/{resume_id}/analyze", response_model=ATSAnalysisResponse)
def analyze_resume(
    resume_id: int,
    job_id: Optional[int] = Query(None, description="Optional job ID for target keyword matching"),
    req_body: Optional[ATSAnalysisRequest] = None,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """
    Runs deterministic ATS analysis on extracted resume text, comparing against job requirements if provided.
    """
    student_profile = get_or_create_student_profile(db, current_user)
    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    if resume.student_id != student_profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this resume")

    # Extract text
    extracted_text = ""
    if resume.file_path and os.path.exists(resume.file_path):
        extracted_text = extract_text_from_file(resume.file_path, resume.file_type or "")

    # Job target comparison
    target_job_id = job_id or (req_body.job_id if req_body else None)
    job_skills = None
    job_desc = None

    if target_job_id:
        job = db.query(Job).filter(Job.id == target_job_id).first()
        if job:
            job_skills = job.skills_required
            job_desc = job.description

    analysis_data = analyze_resume_text(extracted_text, job_skills=job_skills, job_description=job_desc)

    return ATSAnalysisResponse(
        resume_id=resume.id,
        ats_score=analysis_data["ats_score"],
        keyword_match_percentage=analysis_data["keyword_match_percentage"],
        skills_detected=analysis_data["skills_detected"],
        matching_keywords=analysis_data["matching_keywords"],
        missing_keywords=analysis_data["missing_keywords"],
        sections_detected=analysis_data["sections_detected"],
        contact_info_detected=analysis_data["contact_info_detected"],
        word_count=analysis_data["word_count"],
        warnings=analysis_data["warnings"],
        recommendations=analysis_data["recommendations"]
    )


@router.get("/{resume_id}/analysis", response_model=ATSAnalysisResponse)
def get_resume_analysis(
    resume_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns ATS analysis for a student's resume."""
    return analyze_resume(resume_id=resume_id, job_id=None, req_body=None, current_user=current_user, db=db)
