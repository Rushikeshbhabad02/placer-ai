from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import SessionLocal
from models.user import User
from models.student_profile import StudentProfile
from models.recruiter_profile import RecruiterProfile
from models.mentor_profile import MentorProfile
from models.job import Job
from models.mentor_approval import MentorApproval
from models.application import Application
from auth.dependencies import get_db, require_role
from schemas.admin import (
    AdminProfileResponse,
    AdminProfileUpdate,
    AdminDashboardResponse,
    UserStatusUpdate,
    UserAdminResponse,
    StudentAdminResponse,
    RecruiterAdminResponse,
    MentorAdminResponse,
)

router = APIRouter(prefix="/admin", tags=["Admin Module"])


# ==========================================
# 1. ADMIN PROFILE ENDPOINTS
# ==========================================

@router.get("/profile", response_model=AdminProfileResponse)
def get_admin_profile(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Returns the authenticated admin's profile."""
    return AdminProfileResponse.model_validate(current_user)


@router.put("/profile", response_model=AdminProfileResponse)
def update_admin_profile(
    profile_in: AdminProfileUpdate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Updates the authenticated admin's safe profile fields."""
    update_data = profile_in.model_dump(exclude_unset=True)
    
    if "full_name" in update_data and update_data["full_name"]:
        current_user.full_name = update_data["full_name"]
    if "phone" in update_data:
        current_user.phone = update_data["phone"]

    db.commit()
    db.refresh(current_user)
    return AdminProfileResponse.model_validate(current_user)


# ==========================================
# 2. ADMIN DASHBOARD ENDPOINT
# ==========================================

@router.get("/dashboard", response_model=AdminDashboardResponse)
def get_admin_dashboard_stats(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Returns real database statistics across the platform for the admin dashboard."""
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == "student").count()
    total_recruiters = db.query(User).filter(User.role == "recruiter").count()
    total_mentors = db.query(User).filter(User.role == "mentor").count()
    total_admins = db.query(User).filter(User.role == "admin").count()
    
    total_jobs = db.query(Job).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    inactive_users = db.query(User).filter(User.is_active == False).count()
    pending_mentor_approvals = db.query(MentorApproval).filter(MentorApproval.status == "pending").count()
    total_applications = db.query(Application).count()

    return AdminDashboardResponse(
        total_users=total_users,
        total_students=total_students,
        total_recruiters=total_recruiters,
        total_mentors=total_mentors,
        total_admins=total_admins,
        total_jobs=total_jobs,
        active_users=active_users,
        inactive_users=inactive_users,
        pending_mentor_approvals=pending_mentor_approvals,
        total_applications=total_applications,
    )


# ==========================================
# 3. USER MANAGEMENT ENDPOINTS
# ==========================================

@router.get("/users", response_model=List[UserAdminResponse])
def get_all_users(
    role: Optional[str] = Query(None, description="Filter by user role (student, recruiter, mentor, admin)"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Returns a filtered list of system users."""
    query = db.query(User)

    if role and isinstance(role, str):
        query = query.filter(User.role == role.lower())
    if is_active is not None and isinstance(is_active, bool):
        query = query.filter(User.is_active == is_active)
    if search and isinstance(search, str):
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(search_pattern),
                User.email.ilike(search_pattern)
            )
        )

    users = query.order_by(User.id.asc()).all()
    return [UserAdminResponse.model_validate(u) for u in users]


@router.get("/users/{user_id}", response_model=UserAdminResponse)
def get_user_by_id(
    user_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Returns details for a specific user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserAdminResponse.model_validate(user)


@router.put("/users/{user_id}/status", response_model=UserAdminResponse)
def update_user_status(
    user_id: int,
    status_in: UserStatusUpdate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Activates or deactivates a user account while preserving all associated data."""
    if user_id == current_user.id and not status_in.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot deactivate their own account"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = status_in.is_active
    db.commit()
    db.refresh(user)
    return UserAdminResponse.model_validate(user)


# ==========================================
# 4. STUDENT MANAGEMENT ENDPOINTS
# ==========================================

@router.get("/students", response_model=List[StudentAdminResponse])
def get_all_students(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Returns all student users with their associated StudentProfile details."""
    students = db.query(User).filter(User.role == "student").order_by(User.id.asc()).all()
    result = []
    for u in students:
        sp = u.student_profile
        result.append(StudentAdminResponse(
            id=u.id,
            user_id=u.id,
            full_name=u.full_name,
            email=u.email,
            phone=u.phone,
            is_active=u.is_active,
            college=sp.college if sp else None,
            degree=sp.degree if sp else None,
            branch=sp.branch if sp else None,
            cgpa=sp.cgpa if sp else None,
            graduation_year=sp.graduation_year if sp else None,
            location=sp.location if sp else None,
            created_at=u.created_at
        ))
    return result


@router.get("/students/{student_id}", response_model=StudentAdminResponse)
def get_student_by_id(
    student_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Returns details for a specific student."""
    user = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    
    sp = user.student_profile
    return StudentAdminResponse(
        id=user.id,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        is_active=user.is_active,
        college=sp.college if sp else None,
        degree=sp.degree if sp else None,
        branch=sp.branch if sp else None,
        cgpa=sp.cgpa if sp else None,
        graduation_year=sp.graduation_year if sp else None,
        location=sp.location if sp else None,
        created_at=user.created_at
    )


# ==========================================
# 5. RECRUITER MANAGEMENT ENDPOINTS
# ==========================================

@router.get("/recruiters", response_model=List[RecruiterAdminResponse])
def get_all_recruiters(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Returns all recruiter users with their associated RecruiterProfile details."""
    recruiters = db.query(User).filter(User.role == "recruiter").order_by(User.id.asc()).all()
    result = []
    for u in recruiters:
        rp = u.recruiter_profile
        result.append(RecruiterAdminResponse(
            id=u.id,
            user_id=u.id,
            full_name=u.full_name,
            email=u.email,
            phone=u.phone,
            is_active=u.is_active,
            company=rp.company_name if rp else None,
            designation=rp.designation if rp else None,
            location=rp.location if rp else None,
            website=rp.company_website if rp else None,
            created_at=u.created_at
        ))
    return result


@router.get("/recruiters/{recruiter_id}", response_model=RecruiterAdminResponse)
def get_recruiter_by_id(
    recruiter_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Returns details for a specific recruiter."""
    user = db.query(User).filter(User.id == recruiter_id, User.role == "recruiter").first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruiter not found")

    rp = user.recruiter_profile
    return RecruiterAdminResponse(
        id=user.id,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        is_active=user.is_active,
        company=rp.company_name if rp else None,
        designation=rp.designation if rp else None,
        location=rp.location if rp else None,
        website=rp.company_website if rp else None,
        created_at=user.created_at
    )


# ==========================================
# 6. MENTOR MANAGEMENT ENDPOINTS
# ==========================================

@router.get("/mentors", response_model=List[MentorAdminResponse])
def get_all_mentors(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Returns all mentor users with their associated MentorProfile details."""
    mentors = db.query(User).filter(User.role == "mentor").order_by(User.id.asc()).all()
    result = []
    for u in mentors:
        mp = u.mentor_profile
        result.append(MentorAdminResponse(
            id=u.id,
            user_id=u.id,
            full_name=u.full_name,
            email=u.email,
            phone=u.phone,
            is_active=u.is_active,
            designation=mp.designation if mp else None,
            expertise=mp.expertise if mp else None,
            experience=mp.experience if mp else None,
            company=mp.company if mp else None,
            location=mp.location if mp else None,
            linkedin_url=mp.linkedin_url if mp else None,
            created_at=u.created_at
        ))
    return result


@router.get("/mentors/{mentor_id}", response_model=MentorAdminResponse)
def get_mentor_by_id(
    mentor_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Returns details for a specific mentor."""
    user = db.query(User).filter(User.id == mentor_id, User.role == "mentor").first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")

    mp = user.mentor_profile
    return MentorAdminResponse(
        id=user.id,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        is_active=user.is_active,
        designation=mp.designation if mp else None,
        expertise=mp.expertise if mp else None,
        experience=mp.experience if mp else None,
        company=mp.company if mp else None,
        location=mp.location if mp else None,
        linkedin_url=mp.linkedin_url if mp else None,
        created_at=user.created_at
    )
