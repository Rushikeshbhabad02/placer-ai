from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class RecruiterProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    company_name: Optional[str] = None
    designation: Optional[str] = None
    company_website: Optional[str] = None
    company_industry: Optional[str] = None
    company_size: Optional[str] = None
    company_description: Optional[str] = None
    location: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RecruiterProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    company_name: Optional[str] = Field(None, max_length=255)
    designation: Optional[str] = Field(None, max_length=255)
    company_website: Optional[str] = Field(None, max_length=500)
    company_industry: Optional[str] = Field(None, max_length=255)
    company_size: Optional[str] = Field(None, max_length=100)
    company_description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)

class JobCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    company_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    job_type: Optional[str] = Field(default="Full-time", max_length=100)
    experience_required: Optional[str] = Field(None, max_length=100)
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    skills_required: Optional[str] = Field(None, max_length=500)
    application_deadline: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(default="active", max_length=50)

class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    company_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    job_type: Optional[str] = Field(None, max_length=100)
    experience_required: Optional[str] = Field(None, max_length=100)
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    skills_required: Optional[str] = Field(None, max_length=500)
    application_deadline: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=50)

class JobResponse(BaseModel):
    id: int
    recruiter_id: Optional[int] = None
    title: str
    company_name: str
    description: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = "Full-time"
    experience_required: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    skills_required: Optional[str] = None
    application_deadline: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RecruiterDashboardResponse(BaseModel):
    total_jobs: int
    active_jobs: int
    closed_jobs: int
