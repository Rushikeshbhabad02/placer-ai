import os
import re
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session

from models.job import Job
from models.student_profile import StudentProfile
from models.resume import Resume
from models.user import User

from recommendation.skill_normalizer import (
    normalize_skill_list,
    extract_skills_from_text
)
from recommendation.profile_aggregator import aggregate_student_skill_profile
from schemas.recommendation import (
    JobMatchResponse,
    EligibilityDetail,
    ScoreBreakdown,
    JobRecommendationItem,
    StudentRecommendationsResponse
)

class RuleBasedRecommendationEngine:
    """
    Deterministic, transparent, rule-based matching engine for Job Recommendations and Job Match Scoring.
    Calculates a 0-100 score based on:
    - Skill Match (50 pts base)
    - Experience/Eligibility (15 pts base)
    - Education Match (10 pts base)
    - Resume/ATS Alignment (15 pts base)
    - Profile Completeness (10 pts base)
    Redistributes weight proportionally if data sources (e.g. resume) are unavailable.
    """

    def __init__(self):
        pass

    def extract_job_skills(self, job: Job) -> List[str]:
        """Extract and normalize all skills associated with a Job."""
        skills = set()
        
        # 1. Direct skills_required field
        if job.skills_required:
            raw_items = re.split(r'[,;\n/|]', job.skills_required)
            for item in raw_items:
                item_clean = item.strip()
                if item_clean:
                    skills.add(item_clean)

        # 2. Extract from job title and description
        text_to_scan = f"{job.title or ''} {job.description or ''}"
        extracted = extract_skills_from_text(text_to_scan)
        skills.update(extracted)

        return normalize_skill_list(list(skills))

    def calculate_profile_completeness(self, student: StudentProfile) -> Tuple[float, Dict[str, bool]]:
        """Calculate profile completeness percentage (0-100)."""
        user_name = getattr(student.user, "full_name", None) or getattr(student.user, "name", None)
        checks = {
            "name": bool(student.user and user_name),
            "email": bool(student.user and student.user.email),
            "academic_info": bool(student.college or student.degree or student.branch or student.cgpa),
            "skills": bool(student.skills and len(student.skills) > 0),
            "projects": bool(student.projects and len(student.projects) > 0),
            "resume": bool(student.resumes and len(student.resumes) > 0)
        }
        
        weights = {
            "name": 15,
            "email": 15,
            "academic_info": 30,
            "skills": 15,
            "projects": 15,
            "resume": 10
        }

        score = sum(weights[k] for k, v in checks.items() if v)
        return float(score), checks

    def evaluate_eligibility(self, student: StudentProfile, job: Job) -> Tuple[float, EligibilityDetail, List[str]]:
        """Evaluate eligibility based on CGPA and experience criteria."""
        reasons = []
        edu_match = None
        exp_match = True
        is_eligible = True

        # Check CGPA eligibility if job description specifies a min CGPA
        cgpa_requirement = None
        if job.description:
            cgpa_match = re.search(r'(?:cgpa|gpa|cutoff)\s*(?:>=|:|of|above)?\s*([0-9]\.[0-9]+|[0-9])', job.description.lower())
            if cgpa_match:
                try:
                    cgpa_requirement = float(cgpa_match.group(1))
                except ValueError:
                    pass

        if cgpa_requirement is not None:
            student_cgpa = student.cgpa or 0.0
            if student_cgpa >= cgpa_requirement:
                reasons.append(f"Meets CGPA cutoff requirement ({student_cgpa:.1f} >= {cgpa_requirement:.1f})")
            else:
                is_eligible = False
                reasons.append(f"CGPA ({student_cgpa:.1f}) is below requested cutoff ({cgpa_requirement:.1f})")

        # Check experience requirement
        job_exp = (job.experience_required or "").lower()
        if "fresher" in job_exp or "0" in job_exp or "entry" in job_exp or not job_exp:
            exp_match = True
            reasons.append("Eligible for entry-level / fresher position")
        else:
            exp_match = True  # Default to open unless strict senior requirement
            reasons.append(f"Job experience requirement: {job.experience_required}")

        status = "eligible" if is_eligible else "ineligible"
        detail = EligibilityDetail(
            status=status,
            education_match=edu_match,
            experience_match=exp_match
        )
        
        score = 15.0 if is_eligible else 5.0
        return score, detail, reasons

    def evaluate_education(self, student: StudentProfile, job: Job) -> Tuple[float, Optional[bool], List[str]]:
        """Evaluate education degree / branch match."""
        reasons = []
        if not student.degree and not student.branch and not student.education_records:
            return 5.0, None, ["Insufficient education data provided"]

        student_branches = [b.lower() for b in [student.degree, student.branch] if b]
        for edu in student.education_records:
            if edu.field_of_study:
                student_branches.append(edu.field_of_study.lower())
            if edu.degree:
                student_branches.append(edu.degree.lower())

        student_branches_str = " ".join(student_branches)
        
        # Keywords for technical degree matching
        tech_keywords = ["computer", "cs", "it", "information", "software", "engineering", "b.tech", "be", "bca", "mca", "technology"]
        job_text = f"{job.title or ''} {job.description or ''}".lower()

        # Check if student is from a tech background
        is_tech_student = any(kw in student_branches_str for kw in tech_keywords)
        is_tech_job = any(kw in job_text for kw in tech_keywords)

        if is_tech_student and is_tech_job:
            reasons.append("Education background aligns with job field")
            return 10.0, True, reasons
        elif not is_tech_job:
            reasons.append("General education requirement met")
            return 8.0, True, reasons
        else:
            reasons.append("Field of study may differ from core job focus")
            return 5.0, False, reasons

    def evaluate_resume_alignment(self, student: StudentProfile, job_skills: List[str], db: Session) -> Tuple[Optional[float], Optional[float], List[str]]:
        """
        Evaluate resume text alignment against job required skills.
        Returns: (earned_score, max_possible_weight, reasons)
        If no resume exists: returns (None, None, reasons)
        """
        primary_resume = db.query(Resume).filter(
            Resume.student_id == student.id,
            Resume.is_active == True
        ).first()

        if not primary_resume:
            primary_resume = db.query(Resume).filter(Resume.student_id == student.id).first()

        if not primary_resume:
            return None, None, ["No resume uploaded for ATS alignment check"]

        resume_text = ""
        extracted_text_attr = getattr(primary_resume, "extracted_text", None)
        if extracted_text_attr:
            resume_text = extracted_text_attr.lower()
        elif primary_resume.file_path and os.path.exists(primary_resume.file_path):
            try:
                from resume.extractor import extract_text_from_file
                text = extract_text_from_file(primary_resume.file_path, getattr(primary_resume, "file_type", ""))
                if text:
                    resume_text = text.lower()
            except Exception:
                pass

        if not resume_text:
            return None, None, ["Uploaded resume text could not be extracted"]

        extracted_resume_skills = extract_skills_from_text(resume_text)
        
        if not job_skills:
            return 15.0, 15.0, ["Resume content matches general job description"]

        matched_in_resume = [s for s in job_skills if s in extracted_resume_skills or s in resume_text]
        match_ratio = len(matched_in_resume) / len(job_skills)
        score = round(match_ratio * 15.0, 2)
        
        reasons = [f"Resume contains {len(matched_in_resume)} out of {len(job_skills)} required job skills"]
        return score, 15.0, reasons

    def compute_job_match(self, student: StudentProfile, job: Job, db: Session) -> JobMatchResponse:
        """Calculate complete deterministic match response between a student and a job."""
        reasons = []
        improvement_suggestions = []

        # 1. Student Skills & Job Skills
        student_skills = aggregate_student_skill_profile(student, db)
        job_skills = self.extract_job_skills(job)

        student_skills_set = set(student_skills)
        job_skills_set = set(job_skills)

        matched_skills = sorted(list(job_skills_set.intersection(student_skills_set)))
        missing_skills = sorted(list(job_skills_set - student_skills_set))

        if job_skills_set:
            skill_match_pct = round((len(matched_skills) / len(job_skills_set)) * 100.0, 2)
        else:
            skill_match_pct = 100.0

        raw_skill_score = round((skill_match_pct / 100.0) * 50.0, 2)
        
        if matched_skills:
            reasons.append(f"Strong skill overlap in: {', '.join(matched_skills[:4])}")
        if missing_skills:
            improvement_suggestions.append(f"Acquire missing skills: {', '.join(missing_skills[:4])}")

        # 2. Eligibility
        elig_score, elig_detail, elig_reasons = self.evaluate_eligibility(student, job)
        reasons.extend(elig_reasons)

        # 3. Education
        edu_score, edu_match, edu_reasons = self.evaluate_education(student, job)
        elig_detail.education_match = edu_match
        reasons.extend(edu_reasons)

        # 4. Resume / ATS Alignment
        resume_score, resume_max_weight, resume_reasons = self.evaluate_resume_alignment(student, job_skills, db)
        if resume_reasons:
            reasons.extend(resume_reasons)

        # 5. Profile Completeness
        completeness_pct, _ = self.calculate_profile_completeness(student)
        completeness_score = round((completeness_pct / 100.0) * 10.0, 2)

        # 6. Proportional Weight Redistribution Formula
        weights_map = {
            "skill_match": (raw_skill_score, 50.0),
            "eligibility": (elig_score, 15.0),
            "education": (edu_score, 10.0),
            "profile_completeness": (completeness_score, 10.0),
        }

        if resume_score is not None and resume_max_weight is not None:
            weights_map["resume_alignment"] = (resume_score, resume_max_weight)
        else:
            improvement_suggestions.append("Upload a resume to boost your match score and enable ATS alignment analysis")

        total_earned_raw = sum(earned for earned, max_w in weights_map.values())
        total_possible_max = sum(max_w for earned, max_w in weights_map.values())

        if total_possible_max > 0:
            final_match_score = int(round((total_earned_raw / total_possible_max) * 100.0))
        else:
            final_match_score = 0

        final_match_score = max(0, min(100, final_match_score))

        # Determine Match Level
        if final_match_score >= 80:
            match_level = "strong"
        elif final_match_score >= 60:
            match_level = "good"
        elif final_match_score >= 40:
            match_level = "moderate"
        else:
            match_level = "low"

        # Build Score Breakdown
        score_breakdown = ScoreBreakdown(
            skill_match=raw_skill_score,
            eligibility=elig_score,
            education=edu_score,
            resume_alignment=resume_score if resume_score is not None else 0.0,
            profile_completeness=completeness_score
        )

        # Compute optional semantic score signal
        semantic_sim = None
        try:
            from vector_store.search import semantic_match_student_to_job
            semantic_sim = semantic_match_student_to_job(student, job, db)
        except Exception:
            pass

        return JobMatchResponse(
            job_id=job.id,
            student_id=student.id,
            match_score=final_match_score,
            match_level=match_level,
            semantic_score=semantic_sim,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            skill_match_percentage=skill_match_pct,
            eligibility=elig_detail,
            score_breakdown=score_breakdown,
            reasons=list(dict.fromkeys(reasons)),  # Deduplicate preserving order
            improvement_suggestions=list(dict.fromkeys(improvement_suggestions))
        )

    def get_recommendations(self, student: StudentProfile, db: Session, limit: int = 10) -> StudentRecommendationsResponse:
        """
        Get recommended jobs for a student ordered by match score descending.
        Only active jobs are considered.
        """
        active_jobs = db.query(Job).filter(Job.status == "active").all()
        
        matches = []
        for job in active_jobs:
            match_res = self.compute_job_match(student, job, db)
            
            salary_str = None
            if job.salary_min or job.salary_max:
                salary_str = f"₹{int(job.salary_min or 0):,} - ₹{int(job.salary_max or 0):,}"

            rec_item = JobRecommendationItem(
                job_id=job.id,
                title=job.title,
                company=job.company_name,
                location=job.location or "Remote / Unspecified",
                employment_type=job.job_type,
                salary_range=salary_str,
                match_score=match_res.match_score,
                match_level=match_res.match_level,
                semantic_score=match_res.semantic_score,
                matched_skills=match_res.matched_skills,
                missing_skills=match_res.missing_skills,
                reasons=match_res.reasons[:3]
            )
            matches.append(rec_item)

        # Sort by match_score descending, then title ascending
        matches.sort(key=lambda x: (x.match_score, x.title), reverse=True)

        selected = matches[:limit]
        return StudentRecommendationsResponse(
            recommendations=selected,
            total=len(matches)
        )

# Central singleton engine instance
recommendation_engine = RuleBasedRecommendationEngine()
