from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


class AdminProfileResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdminProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_students: int
    total_recruiters: int
    total_mentors: int
    total_admins: int
    total_jobs: int
    active_users: int
    inactive_users: int
    pending_mentor_approvals: int
    total_applications: int


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserAdminResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StudentAdminResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    is_active: bool
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[float] = None
    graduation_year: Optional[int] = None
    location: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RecruiterAdminResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    is_active: bool
    company: Optional[str] = None
    designation: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MentorAdminResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    is_active: bool
    designation: Optional[str] = None
    expertise: Optional[str] = None
    experience: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
