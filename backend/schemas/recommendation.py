from typing import List, Optional
from pydantic import BaseModel, Field

class EligibilityDetail(BaseModel):
    status: str  # "eligible", "ineligible", "insufficient_data"
    education_match: Optional[bool] = None
    experience_match: Optional[bool] = None

class ScoreBreakdown(BaseModel):
    skill_match: float
    eligibility: float
    education: float
    resume_alignment: float
    profile_completeness: float

class JobMatchResponse(BaseModel):
    job_id: int
    student_id: int
    match_score: int
    match_level: str  # "strong", "good", "moderate", "low"
    semantic_score: Optional[float] = None
    matched_skills: List[str]
    missing_skills: List[str]
    skill_match_percentage: float
    eligibility: EligibilityDetail
    score_breakdown: ScoreBreakdown
    reasons: List[str]
    improvement_suggestions: List[str]

class JobRecommendationItem(BaseModel):
    job_id: int
    title: str
    company: str
    location: str
    employment_type: Optional[str] = None
    salary_range: Optional[str] = None
    match_score: int
    match_level: str
    semantic_score: Optional[float] = None
    matched_skills: List[str]
    missing_skills: List[str]
    reasons: List[str]

class StudentRecommendationsResponse(BaseModel):
    recommendations: List[JobRecommendationItem]
    total: int
