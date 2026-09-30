import re
from typing import Tuple, Dict, Any, Optional
from models.job import Job
from models.student_profile import StudentProfile
from recommendation.profile_aggregator import aggregate_student_skill_profile


def build_job_document(job: Job) -> Tuple[str, Dict[str, Any]]:
    """
    Constructs a normalized, searchable text document and metadata dict for a Job model.
    Exposes zero credentials or internal secrets.
    """
    parts = []
    
    if job.title:
        parts.append(f"Title: {job.title}")
    if job.company_name:
        parts.append(f"Company: {job.company_name}")
    if job.description:
        parts.append(f"Description: {job.description}")
    if job.skills_required:
        parts.append(f"Required Skills: {job.skills_required}")
    if job.experience_required:
        parts.append(f"Experience: {job.experience_required}")
    if job.location:
        parts.append(f"Location: {job.location}")
    if job.job_type:
        parts.append(f"Employment Type: {job.job_type}")

    document_text = "\n".join(parts)
    document_text = re.sub(r'\s+', ' ', document_text).strip()

    metadata = {
        "job_id": job.id,
        "title": str(job.title or ""),
        "company": str(job.company_name or ""),
        "location": str(job.location or "Remote"),
        "job_type": str(job.job_type or "Full-time"),
        "status": str(job.status or "active")
    }

    return document_text, metadata


def build_student_document(student: StudentProfile, db: Optional[Any] = None) -> str:
    """
    Constructs a normalized searchable document representation for a StudentProfile.
    Combines academic details, aggregated skill profile, project text, and active resume text.
    """
    parts = []

    # 1. Academic & Bio
    academic_info = [s for s in [student.degree, student.branch, student.college] if s]
    if academic_info:
        parts.append(f"Education: {' '.join(academic_info)}")
    if student.bio:
        parts.append(f"Bio: {student.bio}")

    # 2. Aggregated Skills
    skills = aggregate_student_skill_profile(student, db)
    if skills:
        parts.append(f"Skills: {', '.join(skills)}")

    # 3. Projects
    if student.projects:
        proj_texts = []
        for p in student.projects:
            tech = getattr(p, "technologies", None) or getattr(p, "technologies_used", None) or ""
            proj_texts.append(f"{p.title or ''} {p.description or ''} {tech}")
        parts.append(f"Projects: {' '.join(proj_texts)}")

    # 4. Resume Text
    if student.resumes:
        for r in student.resumes:
            if getattr(r, "is_active", False) and getattr(r, "file_path", None):
                try:
                    from resume.extractor import extract_text_from_file
                    r_text = extract_text_from_file(r.file_path, getattr(r, "file_type", ""))
                    if r_text:
                        parts.append(f"Resume: {r_text[:1000]}")
                        break
                except Exception:
                    pass

    doc_text = "\n".join(parts)
    return re.sub(r'\s+', ' ', doc_text).strip()
