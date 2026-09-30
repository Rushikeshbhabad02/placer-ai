from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import SessionLocal
from models.user import User
from models.student_profile import StudentProfile
from models.education import Education
from models.skill import Skill
from models.project import Project
from models.resume import Resume
from auth.dependencies import get_db, require_role
from schemas.student import (
    StudentProfileResponse,
    StudentProfileUpdate,
    EducationCreate,
    EducationUpdate,
    EducationResponse,
    SkillCreate,
    SkillResponse,
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ResumeCreate,
    ResumeResponse,
    StudentDashboardResponse,
)

router = APIRouter(prefix="/student", tags=["Student Module"])


def get_or_create_student_profile(db: Session, user: User) -> StudentProfile:
    """Retrieves or safely creates a StudentProfile for the authenticated student user."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# ==========================================
# 1. PROFILE ENDPOINTS
# ==========================================

@router.get("/profile", response_model=StudentProfileResponse)
def get_student_profile(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns the authenticated student's profile."""
    profile = get_or_create_student_profile(db, current_user)
    return StudentProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        college=profile.college,
        degree=profile.degree,
        branch=profile.branch,
        graduation_year=profile.graduation_year,
        cgpa=profile.cgpa,
        location=profile.location,
        bio=profile.bio,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
        portfolio_url=profile.portfolio_url,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )


@router.put("/profile", response_model=StudentProfileResponse)
def update_student_profile(
    profile_in: StudentProfileUpdate,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Updates only the authenticated student's profile fields."""
    profile = get_or_create_student_profile(db, current_user)

    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return StudentProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        college=profile.college,
        degree=profile.degree,
        branch=profile.branch,
        graduation_year=profile.graduation_year,
        cgpa=profile.cgpa,
        location=profile.location,
        bio=profile.bio,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
        portfolio_url=profile.portfolio_url,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )


# ==========================================
# 2. EDUCATION ENDPOINTS
# ==========================================

@router.get("/education", response_model=List[EducationResponse])
def get_student_education(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns all education records belonging to the authenticated student."""
    profile = get_or_create_student_profile(db, current_user)
    return profile.education_records


@router.post("/education", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
def create_student_education(
    edu_in: EducationCreate,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Creates a new education record for the authenticated student."""
    profile = get_or_create_student_profile(db, current_user)
    education = Education(
        student_id=profile.id,
        institution=edu_in.institution,
        degree=edu_in.degree,
        field_of_study=edu_in.field_of_study,
        start_year=edu_in.start_year,
        end_year=edu_in.end_year,
        percentage=edu_in.percentage,
        cgpa=edu_in.cgpa
    )
    db.add(education)
    db.commit()
    db.refresh(education)
    return education


@router.put("/education/{education_id}", response_model=EducationResponse)
def update_student_education(
    education_id: int,
    edu_in: EducationUpdate,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Updates an education record owned by the authenticated student."""
    profile = get_or_create_student_profile(db, current_user)
    education = db.query(Education).filter(Education.id == education_id).first()

    if not education:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education record not found")

    if education.student_id != profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this education record")

    update_data = edu_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(education, field, value)

    db.commit()
    db.refresh(education)
    return education


@router.delete("/education/{education_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student_education(
    education_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Deletes an education record owned by the authenticated student."""
    profile = get_or_create_student_profile(db, current_user)
    education = db.query(Education).filter(Education.id == education_id).first()

    if not education:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education record not found")

    if education.student_id != profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this education record")

    db.delete(education)
    db.commit()
    return None


# ==========================================
# 3. SKILLS ENDPOINTS
# ==========================================

@router.get("/skills", response_model=List[SkillResponse])
def get_student_skills(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns skills associated with the authenticated student."""
    profile = get_or_create_student_profile(db, current_user)
    return profile.skills


@router.post("/skills", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def add_student_skill(
    skill_in: SkillCreate,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Adds a skill to the authenticated student, reusing global Skill entries when possible."""
    profile = get_or_create_student_profile(db, current_user)

    normalized_name = skill_in.name.strip()
    skill = db.query(Skill).filter(func.lower(Skill.name) == normalized_name.lower()).first()

    if not skill:
        skill = Skill(name=normalized_name, category=skill_in.category)
        db.add(skill)
        db.commit()
        db.refresh(skill)

    if skill not in profile.skills:
        profile.skills.append(skill)
        db.commit()

    return skill


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_student_skill(
    skill_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Removes a skill association from the authenticated student without deleting global skill data."""
    profile = get_or_create_student_profile(db, current_user)

    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")

    if skill not in profile.skills:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill is not associated with this student")

    profile.skills.remove(skill)
    db.commit()
    return None


# ==========================================
# 4. PROJECTS ENDPOINTS
# ==========================================

@router.get("/projects", response_model=List[ProjectResponse])
def get_student_projects(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns projects created by the authenticated student."""
    profile = get_or_create_student_profile(db, current_user)
    return profile.projects


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_student_project(
    project_in: ProjectCreate,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Creates a new project for the authenticated student."""
    profile = get_or_create_student_profile(db, current_user)
    project = Project(
        student_id=profile.id,
        title=project_in.title,
        description=project_in.description,
        technologies=project_in.technologies,
        github_url=project_in.github_url,
        live_url=project_in.live_url,
        start_date=project_in.start_date,
        end_date=project_in.end_date
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_student_project(
    project_id: int,
    project_in: ProjectUpdate,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Updates a project owned by the authenticated student."""
    profile = get_or_create_student_profile(db, current_user)
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project.student_id != profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this project")

    update_data = project_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student_project(
    project_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Deletes a project owned by the authenticated student."""
    profile = get_or_create_student_profile(db, current_user)
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project.student_id != profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this project")

    db.delete(project)
    db.commit()
    return None


# ==========================================
# 5. RESUME METADATA ENDPOINTS
# ==========================================

@router.get("/resumes", response_model=List[ResumeResponse])
def get_student_resumes(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns resume metadata belonging to the authenticated student."""
    profile = get_or_create_student_profile(db, current_user)
    return profile.resumes


@router.post("/resumes", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
def create_student_resume(
    resume_in: ResumeCreate,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Registers resume metadata for the authenticated student."""
    profile = get_or_create_student_profile(db, current_user)
    resume = Resume(
        student_id=profile.id,
        file_name=resume_in.file_name,
        file_path=resume_in.file_path,
        file_type=resume_in.file_type,
        file_size=resume_in.file_size,
        is_active=resume_in.is_active if resume_in.is_active is not None else True
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.delete("/resumes/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student_resume(
    resume_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Deletes resume metadata owned by the authenticated student."""
    profile = get_or_create_student_profile(db, current_user)
    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume metadata not found")

    if resume.student_id != profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this resume record")

    db.delete(resume)
    db.commit()
    return None


# ==========================================
# 6. DASHBOARD DATA ENDPOINT
# ==========================================

@router.get("/dashboard", response_model=StudentDashboardResponse)
def get_student_dashboard_stats(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns database-derived statistics for the authenticated student."""
    profile = get_or_create_student_profile(db, current_user)

    edu_count = len(profile.education_records)
    skills_count = len(profile.skills)
    projects_count = len(profile.projects)
    resumes_count = len(profile.resumes)

    # Calculate profile completion percentage
    score = 0
    # Basic Profile info check (30 points total)
    if profile.college or profile.degree or profile.branch:
        score += 10
    if profile.cgpa or profile.location:
        score += 10
    if profile.bio:
        score += 10

    # Education (20 points)
    if edu_count > 0:
        score += 20

    # Skills (20 points)
    if skills_count > 0:
        score += 20

    # Projects (20 points)
    if projects_count > 0:
        score += 20

    # Resumes (10 points)
    if resumes_count > 0:
        score += 10

    return StudentDashboardResponse(
        profile_completion=min(score, 100),
        education_count=edu_count,
        skills_count=skills_count,
        projects_count=projects_count,
        resumes_count=resumes_count
    )
