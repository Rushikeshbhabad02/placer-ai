from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session

from models.student_profile import StudentProfile
from models.job import Job

from recommendation.profile_aggregator import aggregate_student_skill_profile
from recommendation.skill_normalizer import normalize_skill_list
from recommendation.engine import recommendation_engine

from skill_gap.role_profiles import TARGET_ROLE_PROFILES, get_supported_target_roles
from skill_gap.learning_map import get_learning_info
from schemas.skill_gap import (
    SkillGapItem,
    RoadmapItem,
    JobSkillGapResponse,
    RoleSkillGapResponse
)

class SkillGapAnalyzer:
    """
    Deterministic Skill Gap Analyzer reusing STEP 11 profile aggregation
    and skill normalization engines.
    """

    def analyze_job_skill_gap(self, student: StudentProfile, job: Job, db: Session) -> JobSkillGapResponse:
        """Calculate skill gap analysis for a specific student against a target job."""
        current_skills = aggregate_student_skill_profile(student, db)
        target_skills = recommendation_engine.extract_job_skills(job)

        current_set = set(current_skills)
        target_set = set(target_skills)

        matched_skills = sorted(list(target_set.intersection(current_set)))
        missing_skills = sorted(list(target_set - current_set))

        total_count = len(target_skills)
        matched_count = len(matched_skills)
        missing_count = len(missing_skills)

        if total_count > 0:
            coverage_pct = round((matched_count / total_count) * 100.0, 1)
            status_val = "ok"
        else:
            coverage_pct = 100.0
            status_val = "insufficient_data"

        # Explicitly required job skills string
        raw_req = (job.skills_required or "").lower()

        # Build gaps and roadmap
        gaps: List[SkillGapItem] = []
        roadmap_items_raw = []

        for skill in missing_skills:
            info = get_learning_info(skill)
            
            # Determine priority based on job text context
            if raw_req and skill.lower() in raw_req:
                priority = "high"
            elif job.description and skill.lower() in job.description.lower():
                priority = "medium"
            else:
                priority = info.get("priority", "medium")

            gap_item = SkillGapItem(
                skill=skill,
                priority=priority,
                reason=f"Explicit requirement for position '{job.title}'",
                current_status="missing",
                learning_topic=info["topic"]
            )
            gaps.append(gap_item)

            roadmap_items_raw.append({
                "skill": skill,
                "priority": priority,
                "topic": info["topic"],
                "reason": f"Required for {job.company_name or 'target company'} — {job.title}"
            })

        # Priority ordering: high -> medium -> low, then alphabetical
        priority_rank = {"high": 1, "medium": 2, "low": 3}
        roadmap_items_raw.sort(key=lambda x: (priority_rank.get(x["priority"], 2), x["skill"]))

        learning_roadmap: List[RoadmapItem] = []
        for idx, item in enumerate(roadmap_items_raw, start=1):
            learning_roadmap.append(RoadmapItem(
                order=idx,
                skill=item["skill"],
                priority=item["priority"],
                topic=item["topic"],
                reason=item["reason"]
            ))

        return JobSkillGapResponse(
            job_id=job.id,
            job_title=job.title,
            status=status_val,
            current_skills=current_skills,
            target_skills=target_skills,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            skill_coverage_percentage=coverage_pct,
            matched_skill_count=matched_count,
            missing_skill_count=missing_count,
            total_target_skill_count=total_count,
            gaps=gaps,
            learning_roadmap=learning_roadmap
        )

    def analyze_role_skill_gap(self, student: StudentProfile, target_role: str, db: Session) -> RoleSkillGapResponse:
        """Calculate skill gap analysis for a student against a target career role."""
        if target_role not in TARGET_ROLE_PROFILES:
            supported = ", ".join(get_supported_target_roles())
            raise ValueError(f"Target role '{target_role}' is not supported. Supported roles: {supported}")

        current_skills = aggregate_student_skill_profile(student, db)
        target_skills = normalize_skill_list(TARGET_ROLE_PROFILES[target_role])

        current_set = set(current_skills)
        target_set = set(target_skills)

        matched_skills = sorted(list(target_set.intersection(current_set)))
        missing_skills = sorted(list(target_set - current_set))

        total_count = len(target_skills)
        matched_count = len(matched_skills)
        missing_count = len(missing_skills)

        if total_count > 0:
            coverage_pct = round((matched_count / total_count) * 100.0, 1)
            status_val = "ok"
        else:
            coverage_pct = 100.0
            status_val = "insufficient_data"

        gaps: List[SkillGapItem] = []
        roadmap_items_raw = []

        for skill in missing_skills:
            info = get_learning_info(skill)
            priority = info.get("priority", "medium")

            gap_item = SkillGapItem(
                skill=skill,
                priority=priority,
                reason=f"Core competency required for {target_role}",
                current_status="missing",
                learning_topic=info["topic"]
            )
            gaps.append(gap_item)

            roadmap_items_raw.append({
                "skill": skill,
                "priority": priority,
                "topic": info["topic"],
                "reason": f"Required competency for {target_role}"
            })

        priority_rank = {"high": 1, "medium": 2, "low": 3}
        roadmap_items_raw.sort(key=lambda x: (priority_rank.get(x["priority"], 2), x["skill"]))

        learning_roadmap: List[RoadmapItem] = []
        for idx, item in enumerate(roadmap_items_raw, start=1):
            learning_roadmap.append(RoadmapItem(
                order=idx,
                skill=item["skill"],
                priority=item["priority"],
                topic=item["topic"],
                reason=item["reason"]
            ))

        return RoleSkillGapResponse(
            target_role=target_role,
            status=status_val,
            current_skills=current_skills,
            target_skills=target_skills,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            coverage_percentage=coverage_pct,
            matched_skill_count=matched_count,
            missing_skill_count=missing_count,
            total_target_skill_count=total_count,
            gaps=gaps,
            learning_roadmap=learning_roadmap
        )

# Singleton analyzer instance
skill_gap_analyzer = SkillGapAnalyzer()
