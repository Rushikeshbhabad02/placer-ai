from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: int
    student_id: int
    file_name: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class ATSAnalysisRequest(BaseModel):
    job_id: Optional[int] = None


class ATSAnalysisResponse(BaseModel):
    resume_id: int
    ats_score: int
    keyword_match_percentage: float
    skills_detected: List[str]
    matching_keywords: List[str]
    missing_keywords: List[str]
    sections_detected: List[str]
    contact_info_detected: Dict[str, bool]
    word_count: int
    warnings: List[str]
    recommendations: List[str]

    class Config:
        from_attributes = True
