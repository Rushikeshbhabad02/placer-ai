from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class MentorProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    designation: Optional[str] = None
    expertise: Optional[str] = None
    experience: Optional[str] = None
    company: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MentorProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    designation: Optional[str] = Field(None, max_length=255)
    expertise: Optional[str] = Field(None, max_length=500)
    experience: Optional[str] = Field(None, max_length=100)
    company: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    linkedin_url: Optional[str] = Field(None, max_length=500)

class StudentSafeResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[float] = None

    class Config:
        from_attributes = True

class MentorApprovalResponse(BaseModel):
    id: int
    mentor_id: int
    student_id: int
    status: str
    comments: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    student: Optional[StudentSafeResponse] = None

    class Config:
        from_attributes = True

class MentorApprovalAction(BaseModel):
    comments: Optional[str] = Field(None, max_length=1000)

class MentorDashboardResponse(BaseModel):
    total_assigned_students: int
    pending_reviews: int
    approved_students: int
    rejected_requests: int
