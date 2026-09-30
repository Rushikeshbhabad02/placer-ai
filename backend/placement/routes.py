from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import SessionLocal
from models.user import User
from models.student_profile import StudentProfile
from models.job import Job
from models.application import Application
from models.interview import Interview
from models.assessment import Assessment
from models.assessment_result import AssessmentResult
from models.notification import Notification
from auth.dependencies import get_db, require_role
from schemas.workflow import (
    JobPublicResponse,
    StudentSafeCandidate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    InterviewCreate,
    InterviewUpdate,
    InterviewResponse,
    AssessmentCreate,
    AssessmentResponse,
    AssessmentSubmit,
    AssessmentResultResponse,
)

student_workflow_router = APIRouter(prefix="/student", tags=["Student Placement Workflow"])
recruiter_workflow_router = APIRouter(prefix="/recruiter", tags=["Recruiter Placement Workflow"])


def get_or_create_student_profile(db: Session, user: User) -> StudentProfile:
    """Retrieves or safely creates a StudentProfile for the authenticated student user."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def format_application_response(app: Application) -> ApplicationResponse:
    """Formats Application DB object into ApplicationResponse schema with safe student data."""
    job_resp = None
    if app.job:
        job_resp = JobPublicResponse.model_validate(app.job)

    student_safe = None
    if app.student:
        user = app.student.user
        student_safe = StudentSafeCandidate(
            id=app.student.id,
            user_id=app.student.user_id,
            full_name=user.full_name if user else "Student",
            email=user.email if user else "",
            phone=user.phone if user else None,
            college=app.student.college,
            degree=app.student.degree,
            branch=app.student.branch,
            cgpa=app.student.cgpa
        )

    return ApplicationResponse(
        id=app.id,
        student_id=app.student_id,
        job_id=app.job_id,
        resume_id=app.resume_id,
        status=app.status,
        applied_at=app.applied_at,
        updated_at=app.updated_at,
        job=job_resp,
        student=student_safe
    )


def format_interview_response(inv: Interview) -> InterviewResponse:
    """Formats Interview DB object into InterviewResponse schema."""
    job_title = None
    company_name = None
    student_name = None

    if inv.application:
        if inv.application.job:
            job_title = inv.application.job.title
            company_name = inv.application.job.company_name
        if inv.application.student and inv.application.student.user:
            student_name = inv.application.student.user.full_name

    return InterviewResponse(
        id=inv.id,
        application_id=inv.application_id,
        scheduled_by=inv.scheduled_by,
        interview_date=inv.interview_date,
        interview_time=inv.interview_time,
        interview_type=inv.interview_type,
        meeting_link=inv.meeting_link,
        notes=inv.notes,
        status=inv.status,
        created_at=inv.created_at,
        updated_at=inv.updated_at,
        job_title=job_title,
        company_name=company_name,
        student_name=student_name
    )


# ==========================================
# STUDENT WORKFLOW ENDPOINTS
# ==========================================

@student_workflow_router.get("/jobs", response_model=List[JobPublicResponse])
def get_student_jobs(
    search: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    skills: Optional[str] = Query(None),
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns active jobs for student discovery."""
    query = db.query(Job)

    if search and isinstance(search, str):
        pattern = f"%{search.strip()}%"
        query = query.filter(or_(Job.title.ilike(pattern), Job.company_name.ilike(pattern)))
    if location and isinstance(location, str):
        query = query.filter(Job.location.ilike(f"%{location.strip()}%"))
    if job_type and isinstance(job_type, str):
        query = query.filter(Job.job_type.ilike(f"%{job_type.strip()}%"))
    if skills and isinstance(skills, str):
        query = query.filter(Job.skills_required.ilike(f"%{skills.strip()}%"))

    jobs = query.order_by(Job.id.desc()).all()
    return [JobPublicResponse.model_validate(j) for j in jobs]


@student_workflow_router.get("/jobs/{job_id}", response_model=JobPublicResponse)
def get_student_job_by_id(
    job_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns details for a specific job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return JobPublicResponse.model_validate(job)


@student_workflow_router.post("/jobs/{job_id}/apply", response_model=ApplicationResponse)
def apply_for_job(
    job_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Submits a student application for a specific job."""
    student_profile = get_or_create_student_profile(db, current_user)

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    existing_app = db.query(Application).filter(
        Application.student_id == student_profile.id,
        Application.job_id == job_id
    ).first()

    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied for this job"
        )

    app = Application(
        student_id=student_profile.id,
        job_id=job_id,
        status="applied"
    )
    db.add(app)

    # Student Notification
    notif = Notification(
        user_id=current_user.id,
        title="Application Submitted",
        message=f"You successfully applied for {job.title} at {job.company_name}.",
        notification_type="application"
    )
    db.add(notif)

    db.commit()
    db.refresh(app)
    return format_application_response(app)


@student_workflow_router.get("/applications", response_model=List[ApplicationResponse])
def get_my_applications(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns all applications submitted by the authenticated student."""
    student_profile = get_or_create_student_profile(db, current_user)
    apps = db.query(Application).filter(Application.student_id == student_profile.id).order_by(Application.id.desc()).all()
    return [format_application_response(a) for a in apps]


@student_workflow_router.get("/applications/{application_id}", response_model=ApplicationResponse)
def get_my_application_by_id(
    application_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns details for a specific application owned by the student."""
    student_profile = get_or_create_student_profile(db, current_user)
    app = db.query(Application).filter(Application.id == application_id).first()

    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if app.student_id != student_profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this application")

    return format_application_response(app)


@student_workflow_router.delete("/applications/{application_id}")
def withdraw_application(
    application_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Withdraws an application owned by the authenticated student."""
    student_profile = get_or_create_student_profile(db, current_user)
    app = db.query(Application).filter(Application.id == application_id).first()

    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if app.student_id != student_profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this application")

    app.status = "withdrawn"
    db.commit()
    return {"message": "Application withdrawn successfully"}


@student_workflow_router.get("/interviews", response_model=List[InterviewResponse])
def get_my_interviews(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns interviews scheduled for the authenticated student's applications."""
    student_profile = get_or_create_student_profile(db, current_user)
    interviews = db.query(Interview).join(Application).filter(Application.student_id == student_profile.id).all()
    return [format_interview_response(inv) for inv in interviews]


@student_workflow_router.get("/interviews/{interview_id}", response_model=InterviewResponse)
def get_my_interview_by_id(
    interview_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns details for a specific interview owned by the student."""
    student_profile = get_or_create_student_profile(db, current_user)
    inv = db.query(Interview).filter(Interview.id == interview_id).first()

    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    if not inv.application or inv.application.student_id != student_profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this interview")

    return format_interview_response(inv)


@student_workflow_router.get("/assessments", response_model=List[AssessmentResponse])
def get_student_assessments(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns available active assessments for students."""
    assessments = db.query(Assessment).filter(Assessment.status == "active").all()
    return [AssessmentResponse.model_validate(a) for a in assessments]


@student_workflow_router.get("/assessments/{assessment_id}", response_model=AssessmentResponse)
def get_student_assessment_by_id(
    assessment_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns details for a specific assessment."""
    asm = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not asm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")
    return AssessmentResponse.model_validate(asm)


@student_workflow_router.post("/assessments/{assessment_id}/submit", response_model=AssessmentResultResponse)
def submit_student_assessment(
    assessment_id: int,
    submit_in: AssessmentSubmit,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Submits student assessment answers and records the result."""
    student_profile = get_or_create_student_profile(db, current_user)
    asm = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not asm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    res = AssessmentResult(
        assessment_id=assessment_id,
        student_id=student_profile.id,
        score=submit_in.score,
        percentage=submit_in.percentage,
        correct_answers=submit_in.correct_answers,
        wrong_answers=submit_in.wrong_answers,
        time_taken_seconds=submit_in.time_taken_seconds
    )
    db.add(res)
    db.commit()
    db.refresh(res)

    return AssessmentResultResponse(
        id=res.id,
        assessment_id=res.assessment_id,
        student_id=res.student_id,
        score=res.score,
        percentage=res.percentage,
        correct_answers=res.correct_answers,
        wrong_answers=res.wrong_answers,
        time_taken_seconds=res.time_taken_seconds,
        submitted_at=res.submitted_at,
        assessment_title=asm.title,
        student_name=current_user.full_name
    )


@student_workflow_router.get("/assessment-results", response_model=List[AssessmentResultResponse])
def get_my_assessment_results(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    """Returns assessment results submitted by the authenticated student."""
    student_profile = get_or_create_student_profile(db, current_user)
    results = db.query(AssessmentResult).filter(AssessmentResult.student_id == student_profile.id).all()

    output = []
    for r in results:
        title = r.assessment.title if r.assessment else None
        output.append(AssessmentResultResponse(
            id=r.id,
            assessment_id=r.assessment_id,
            student_id=r.student_id,
            score=r.score,
            percentage=r.percentage,
            correct_answers=r.correct_answers,
            wrong_answers=r.wrong_answers,
            time_taken_seconds=r.time_taken_seconds,
            submitted_at=r.submitted_at,
            assessment_title=title,
            student_name=current_user.full_name
        ))
    return output


# ==========================================
# RECRUITER WORKFLOW ENDPOINTS
# ==========================================

@recruiter_workflow_router.get("/applications", response_model=List[ApplicationResponse])
def get_recruiter_applications(
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Returns applications for jobs posted by the authenticated recruiter."""
    apps = db.query(Application).join(Job).filter(Job.recruiter_id == current_user.id).order_by(Application.id.desc()).all()
    return [format_application_response(a) for a in apps]


@recruiter_workflow_router.get("/applications/{application_id}", response_model=ApplicationResponse)
def get_recruiter_application_by_id(
    application_id: int,
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Returns specific candidate application if the recruiter posted the associated job."""
    app = db.query(Application).filter(Application.id == application_id).first()

    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if not app.job or app.job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to candidate application")

    return format_application_response(app)


@recruiter_workflow_router.put("/applications/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    status_in: ApplicationStatusUpdate,
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Updates candidate application status and logs a notification for the student."""
    app = db.query(Application).filter(Application.id == application_id).first()

    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if not app.job or app.job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to candidate application")

    app.status = status_in.status.lower()

    # Log student notification
    if app.student and app.student.user_id:
        notif = Notification(
            user_id=app.student.user_id,
            title="Application Status Updated",
            message=f"Your status for {app.job.title} at {app.job.company_name} is now '{app.status}'.",
            notification_type="application"
        )
        db.add(notif)

    db.commit()
    db.refresh(app)
    return format_application_response(app)


@recruiter_workflow_router.post("/applications/{application_id}/interview", response_model=InterviewResponse)
def schedule_candidate_interview(
    application_id: int,
    interview_in: InterviewCreate,
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Schedules an interview for a candidate application."""
    app = db.query(Application).filter(Application.id == application_id).first()

    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if not app.job or app.job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to candidate application")

    inv = Interview(
        application_id=application_id,
        scheduled_by=current_user.id,
        interview_date=interview_in.interview_date,
        interview_time=interview_in.interview_time,
        interview_type=interview_in.interview_type or "online",
        meeting_link=interview_in.meeting_link,
        notes=interview_in.notes,
        status="scheduled"
    )
    db.add(inv)

    # Update application status
    app.status = "interview"

    # Notification
    if app.student and app.student.user_id:
        notif = Notification(
            user_id=app.student.user_id,
            title="Interview Scheduled",
            message=f"An interview for {app.job.title} at {app.job.company_name} has been scheduled.",
            notification_type="interview"
        )
        db.add(notif)

    db.commit()
    db.refresh(inv)
    return format_interview_response(inv)


@recruiter_workflow_router.get("/interviews", response_model=List[InterviewResponse])
def get_recruiter_interviews(
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Returns interviews for jobs posted by the authenticated recruiter."""
    interviews = db.query(Interview).join(Application).join(Job).filter(Job.recruiter_id == current_user.id).all()
    return [format_interview_response(inv) for inv in interviews]


@recruiter_workflow_router.put("/interviews/{interview_id}", response_model=InterviewResponse)
def update_recruiter_interview(
    interview_id: int,
    interview_in: InterviewUpdate,
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Updates interview details or status."""
    inv = db.query(Interview).filter(Interview.id == interview_id).first()

    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    if not inv.application or not inv.application.job or inv.application.job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to interview")

    update_data = interview_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(inv, field, value)

    db.commit()
    db.refresh(inv)
    return format_interview_response(inv)


@recruiter_workflow_router.delete("/interviews/{interview_id}")
def cancel_recruiter_interview(
    interview_id: int,
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Cancels or deletes an interview record."""
    inv = db.query(Interview).filter(Interview.id == interview_id).first()

    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    if not inv.application or not inv.application.job or inv.application.job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to interview")

    db.delete(inv)
    db.commit()
    return {"message": "Interview cancelled successfully"}


@recruiter_workflow_router.post("/assessments", response_model=AssessmentResponse)
def create_recruiter_assessment(
    assessment_in: AssessmentCreate,
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Creates a new assessment for recruitment candidates."""
    asm = Assessment(
        created_by=current_user.id,
        title=assessment_in.title,
        description=assessment_in.description,
        duration_minutes=assessment_in.duration_minutes or 30,
        total_marks=assessment_in.total_marks or 100,
        status="active"
    )
    db.add(asm)
    db.commit()
    db.refresh(asm)
    return AssessmentResponse.model_validate(asm)


@recruiter_workflow_router.get("/assessments", response_model=List[AssessmentResponse])
def get_recruiter_assessments(
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Returns assessments created by the authenticated recruiter."""
    assessments = db.query(Assessment).filter(Assessment.created_by == current_user.id).all()
    return [AssessmentResponse.model_validate(a) for a in assessments]


@recruiter_workflow_router.get("/assessments/{assessment_id}/results", response_model=List[AssessmentResultResponse])
def get_recruiter_assessment_results(
    assessment_id: int,
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    """Returns candidate results for an assessment created by the recruiter."""
    asm = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not asm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")
    if asm.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to assessment results")

    results = db.query(AssessmentResult).filter(AssessmentResult.assessment_id == assessment_id).all()
    output = []
    for r in results:
        student_name = r.student.user.full_name if (r.student and r.student.user) else "Candidate"
        output.append(AssessmentResultResponse(
            id=r.id,
            assessment_id=r.assessment_id,
            student_id=r.student_id,
            score=r.score,
            percentage=r.percentage,
            correct_answers=r.correct_answers,
            wrong_answers=r.wrong_answers,
            time_taken_seconds=r.time_taken_seconds,
            submitted_at=r.submitted_at,
            assessment_title=asm.title,
            student_name=student_name
        ))
    return output
