from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


class JobPublicResponse(BaseModel):
    id: int
    recruiter_id: Optional[int] = None
    title: str
    company_name: str
    description: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience_required: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    skills_required: Optional[str] = None
    application_deadline: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class StudentSafeCandidate(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[float] = None

    class Config:
        from_attributes = True


class ApplicationResponse(BaseModel):
    id: int
    student_id: int
    job_id: int
    resume_id: Optional[int] = None
    status: str
    applied_at: datetime
    updated_at: datetime
    job: Optional[JobPublicResponse] = None
    student: Optional[StudentSafeCandidate] = None

    class Config:
        from_attributes = True


class ApplicationStatusUpdate(BaseModel):
    status: str


class InterviewCreate(BaseModel):
    interview_date: Optional[str] = None
    interview_time: Optional[str] = None
    interview_type: Optional[str] = "online"
    meeting_link: Optional[str] = None
    notes: Optional[str] = None


class InterviewUpdate(BaseModel):
    interview_date: Optional[str] = None
    interview_time: Optional[str] = None
    interview_type: Optional[str] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class InterviewResponse(BaseModel):
    id: int
    application_id: int
    scheduled_by: Optional[int] = None
    interview_date: Optional[str] = None
    interview_time: Optional[str] = None
    interview_type: str
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    student_name: Optional[str] = None

    class Config:
        from_attributes = True


class AssessmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    duration_minutes: Optional[int] = 30
    total_marks: Optional[int] = 100


class AssessmentResponse(BaseModel):
    id: int
    created_by: Optional[int] = None
    title: str
    description: Optional[str] = None
    duration_minutes: int
    total_marks: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AssessmentSubmit(BaseModel):
    score: float
    percentage: float
    correct_answers: int
    wrong_answers: int
    time_taken_seconds: int


class AssessmentResultResponse(BaseModel):
    id: int
    assessment_id: int
    student_id: int
    score: float
    percentage: float
    correct_answers: int
    wrong_answers: int
    time_taken_seconds: int
    submitted_at: datetime
    assessment_title: Optional[str] = None
    student_name: Optional[str] = None

    class Config:
        from_attributes = True
