from typing import List, Optional
from pydantic import BaseModel

class SkillGapItem(BaseModel):
    skill: str
    priority: str  # "high", "medium", "low"
    reason: str
    current_status: str  # "missing", "matched"
    learning_topic: str

class RoadmapItem(BaseModel):
    order: int
    skill: str
    priority: str
    topic: str
    reason: str

class JobSkillGapResponse(BaseModel):
    job_id: int
    job_title: str
    status: str = "ok"  # "ok" or "insufficient_data"
    current_skills: List[str]
    target_skills: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    skill_coverage_percentage: float
    matched_skill_count: int
    missing_skill_count: int
    total_target_skill_count: int
    gaps: List[SkillGapItem]
    learning_roadmap: List[RoadmapItem]

class RoleSkillGapResponse(BaseModel):
    target_role: str
    status: str = "ok"
    current_skills: List[str]
    target_skills: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    coverage_percentage: float
    matched_skill_count: int
    missing_skill_count: int
    total_target_skill_count: int
    gaps: List[SkillGapItem]
    learning_roadmap: List[RoadmapItem]
