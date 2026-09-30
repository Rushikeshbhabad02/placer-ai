from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from models.mentor_profile import MentorProfile
from models.mentor_approval import MentorApproval
from models.student_profile import StudentProfile
from models.notification import Notification
from auth.dependencies import get_db, require_role
from schemas.mentor import (
    MentorProfileResponse,
    MentorProfileUpdate,
    StudentSafeResponse,
    MentorApprovalResponse,
    MentorApprovalAction,
    MentorDashboardResponse,
)

router = APIRouter(prefix="/mentor", tags=["Mentor Module"])


def get_or_create_mentor_profile(db: Session, user: User) -> MentorProfile:
    """Retrieves or safely creates a MentorProfile for the authenticated mentor user."""
    profile = db.query(MentorProfile).filter(MentorProfile.user_id == user.id).first()
    if not profile:
        profile = MentorProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def format_approval_response(approval: MentorApproval) -> MentorApprovalResponse:
    """Formats MentorApproval object with safe student profile payload."""
    student_safe = None
    if approval.student:
        student_user = approval.student.user
        student_safe = StudentSafeResponse(
            id=approval.student.id,
            user_id=approval.student.user_id,
            full_name=student_user.full_name if student_user else "Student",
            email=student_user.email if student_user else "",
            college=approval.student.college,
            degree=approval.student.degree,
            branch=approval.student.branch,
            cgpa=approval.student.cgpa
        )

    return MentorApprovalResponse(
        id=approval.id,
        mentor_id=approval.mentor_id,
        student_id=approval.student_id,
        status=approval.status,
        comments=approval.comments,
        created_at=approval.created_at,
        updated_at=approval.updated_at,
        student=student_safe
    )


# ==========================================
# 1. MENTOR PROFILE ENDPOINTS
# ==========================================

@router.get("/profile", response_model=MentorProfileResponse)
def get_mentor_profile(
    current_user: User = Depends(require_role(["mentor"])),
    db: Session = Depends(get_db)
):
    """Returns the authenticated mentor's profile."""
    profile = get_or_create_mentor_profile(db, current_user)
    return MentorProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        designation=profile.designation,
        expertise=profile.expertise,
        experience=profile.experience,
        company=profile.company,
        bio=profile.bio,
        location=profile.location,
        linkedin_url=profile.linkedin_url,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )


@router.put("/profile", response_model=MentorProfileResponse)
def update_mentor_profile(
    profile_in: MentorProfileUpdate,
    current_user: User = Depends(require_role(["mentor"])),
    db: Session = Depends(get_db)
):
    """Updates the authenticated mentor's profile fields."""
    profile = get_or_create_mentor_profile(db, current_user)

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

    return MentorProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        designation=profile.designation,
        expertise=profile.expertise,
        experience=profile.experience,
        company=profile.company,
        bio=profile.bio,
        location=profile.location,
        linkedin_url=profile.linkedin_url,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )


# ==========================================
# 2. MENTOR DASHBOARD ENDPOINT
# ==========================================

@router.get("/dashboard", response_model=MentorDashboardResponse)
def get_mentor_dashboard_stats(
    current_user: User = Depends(require_role(["mentor"])),
    db: Session = Depends(get_db)
):
    """Returns database-derived statistics for the authenticated mentor."""
    approvals = db.query(MentorApproval).filter(MentorApproval.mentor_id == current_user.id).all()

    total_assigned = len(approvals)
    pending_count = sum(1 for a in approvals if (a.status or "").lower() == "pending")
    approved_count = sum(1 for a in approvals if (a.status or "").lower() in ["approved", "shortlisted"])
    rejected_count = sum(1 for a in approvals if (a.status or "").lower() == "rejected")

    return MentorDashboardResponse(
        total_assigned_students=total_assigned,
        pending_reviews=pending_count,
        approved_students=approved_count,
        rejected_requests=rejected_count
    )


# ==========================================
# 3. STUDENT APPROVAL / REQUEST ENDPOINTS
# ==========================================

@router.get("/approvals", response_model=List[MentorApprovalResponse])
def get_mentor_approvals(
    current_user: User = Depends(require_role(["mentor"])),
    db: Session = Depends(get_db)
):
    """Returns all approval requests assigned to the authenticated mentor."""
    approvals = db.query(MentorApproval).filter(MentorApproval.mentor_id == current_user.id).all()
    return [format_approval_response(a) for a in approvals]


@router.get("/approvals/{approval_id}", response_model=MentorApprovalResponse)
def get_mentor_approval_by_id(
    approval_id: int,
    current_user: User = Depends(require_role(["mentor"])),
    db: Session = Depends(get_db)
):
    """Returns a specific approval request if assigned to the authenticated mentor."""
    approval = db.query(MentorApproval).filter(MentorApproval.id == approval_id).first()

    if not approval:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval request not found")

    if approval.mentor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this approval request")

    return format_approval_response(approval)


@router.post("/approvals/{approval_id}/approve", response_model=MentorApprovalResponse)
def approve_student_request(
    approval_id: int,
    action: Optional[MentorApprovalAction] = None,
    current_user: User = Depends(require_role(["mentor"])),
    db: Session = Depends(get_db)
):
    """Approves a student application/mentorship request."""
    approval = db.query(MentorApproval).filter(MentorApproval.id == approval_id).first()

    if not approval:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval request not found")

    if approval.mentor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this approval request")

    approval.status = "approved"
    if action and action.comments:
        approval.comments = action.comments

    # Create notification for student if student profile exists
    if approval.student and approval.student.user_id:
        notif = Notification(
            user_id=approval.student.user_id,
            title="Mentorship Approved",
            message=f"Mentor {current_user.full_name} approved your request.",
            notification_type="approval"
        )
        db.add(notif)

    db.commit()
    db.refresh(approval)
    return format_approval_response(approval)


@router.post("/approvals/{approval_id}/reject", response_model=MentorApprovalResponse)
def reject_student_request(
    approval_id: int,
    action: Optional[MentorApprovalAction] = None,
    current_user: User = Depends(require_role(["mentor"])),
    db: Session = Depends(get_db)
):
    """Rejects a student application/mentorship request."""
    approval = db.query(MentorApproval).filter(MentorApproval.id == approval_id).first()

    if not approval:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval request not found")

    if approval.mentor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this approval request")

    approval.status = "rejected"
    if action and action.comments:
        approval.comments = action.comments

    # Create notification for student if student profile exists
    if approval.student and approval.student.user_id:
        notif = Notification(
            user_id=approval.student.user_id,
            title="Mentorship Request Decision",
            message=f"Mentor {current_user.full_name} updated your request status to rejected.",
            notification_type="approval"
        )
        db.add(notif)

    db.commit()
    db.refresh(approval)
    return format_approval_response(approval)
