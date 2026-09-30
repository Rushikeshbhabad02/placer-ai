from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AIChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000, description="Question asked by student")

class AISourceItem(BaseModel):
    type: str = Field(..., description="Source type e.g. job, student_profile, ats, skill_gap")
    title: Optional[str] = None
    job_id: Optional[int] = None
    section: Optional[str] = None
    resume_id: Optional[int] = None

class AIChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]] = []
    grounded: bool = True
    ai_available: bool = True

class JobAIAnalysisRequest(BaseModel):
    question: Optional[str] = Field(None, max_length=1000, description="Optional custom question regarding job match")

class JobAIAnalysisResponse(BaseModel):
    job_id: int
    answer: str
    match_score: Optional[int] = None
    missing_skills: List[str] = []
    sources: List[Dict[str, Any]] = []
    grounded: bool = True
    ai_available: bool = True

class AIHealthResponse(BaseModel):
    available: bool
    model: str
    message: str
