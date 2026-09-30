from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl

class StudentProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StudentProfileUpdate(BaseModel):
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = Field(None, ge=1950, le=2100)
    cgpa: Optional[float] = Field(None, ge=0.0, le=10.0)
    location: Optional[str] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class EducationCreate(BaseModel):
    institution: str = Field(..., min_length=1, max_length=255)
    degree: Optional[str] = Field(None, max_length=255)
    field_of_study: Optional[str] = Field(None, max_length=255)
    start_year: Optional[int] = Field(None, ge=1950, le=2100)
    end_year: Optional[int] = Field(None, ge=1950, le=2100)
    percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    cgpa: Optional[float] = Field(None, ge=0.0, le=10.0)

class EducationUpdate(BaseModel):
    institution: Optional[str] = Field(None, min_length=1, max_length=255)
    degree: Optional[str] = Field(None, max_length=255)
    field_of_study: Optional[str] = Field(None, max_length=255)
    start_year: Optional[int] = Field(None, ge=1950, le=2100)
    end_year: Optional[int] = Field(None, ge=1950, le=2100)
    percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    cgpa: Optional[float] = Field(None, ge=0.0, le=10.0)

class EducationResponse(BaseModel):
    id: int
    student_id: int
    institution: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    percentage: Optional[float] = None
    cgpa: Optional[float] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SkillCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: Optional[str] = Field(None, max_length=100)

class SkillResponse(BaseModel):
    id: int
    name: str
    category: Optional[str] = None

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    technologies: Optional[str] = Field(None, max_length=500)
    github_url: Optional[str] = Field(None, max_length=500)
    live_url: Optional[str] = Field(None, max_length=500)
    start_date: Optional[str] = Field(None, max_length=50)
    end_date: Optional[str] = Field(None, max_length=50)

class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    technologies: Optional[str] = Field(None, max_length=500)
    github_url: Optional[str] = Field(None, max_length=500)
    live_url: Optional[str] = Field(None, max_length=500)
    start_date: Optional[str] = Field(None, max_length=50)
    end_date: Optional[str] = Field(None, max_length=50)

class ProjectResponse(BaseModel):
    id: int
    student_id: int
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ResumeCreate(BaseModel):
    file_name: str = Field(..., min_length=1, max_length=255)
    file_path: Optional[str] = Field(None, max_length=500)
    file_type: Optional[str] = Field(None, max_length=100)
    file_size: Optional[int] = None
    is_active: Optional[bool] = True

class ResumeResponse(BaseModel):
    id: int
    student_id: int
    file_name: str
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_at: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True

class StudentDashboardResponse(BaseModel):
    profile_completion: int
    education_count: int
    skills_count: int
    projects_count: int
    resumes_count: int
