from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from models.student_profile import StudentProfile
from models.job import Job
from models.resume import Resume
from vector_store.search import semantic_search_jobs
from recommendation.engine import recommendation_engine
from skill_gap.analyzer import skill_gap_analyzer
from resume.ats_analyzer import analyze_resume_text
from rag.config import RAG_TOP_K

class RAGRetriever:
    """
    RAG Retriever leveraging existing ChromaDB vector search (STEP 13),
    PostgreSQL student profile records, Rule-Based Recommendation Engine (STEP 11),
    Skill Gap Analyzer (STEP 12), and ATS Analyzer (STEP 10).
    """

    def retrieve_student_context(self, student: StudentProfile, db: Session) -> Dict[str, Any]:
        """
        Retrieves all authoritative student profile data from PostgreSQL.
        """
        # Academic / Education
        education_items = []
        if student.education_records:
            for edu in student.education_records:
                education_items.append({
                    "school": edu.institution or edu.college_name,
                    "degree": edu.degree,
                    "field_of_study": edu.field_of_study,
                    "grade": edu.grade or (f"CGPA: {student.cgpa}" if student.cgpa else None)
                })
        
        if not education_items and (student.college or student.degree or student.branch):
            education_items.append({
                "school": student.college or "University/Institute",
                "degree": student.degree or student.year,
                "field_of_study": student.branch,
                "grade": f"CGPA: {student.cgpa}" if student.cgpa else None
            })

        # Skills
        skills = []
        if student.skills:
            for s in student.skills:
                if hasattr(s, "name"):
                    skills.append(s.name)
                elif isinstance(s, str) and s.strip():
                    skills.append(s.strip())
                elif isinstance(s, dict) and s.get("name"):
                    skills.append(s.get("name"))

        # Projects
        projects = []
        if student.projects:
            for p in student.projects:
                if hasattr(p, "title"):
                    projects.append({
                        "title": getattr(p, "title", ""),
                        "description": getattr(p, "description", ""),
                        "technologies": getattr(p, "technologies", "")
                    })
                elif isinstance(p, dict):
                    projects.append({
                        "title": p.get("title") or p.get("name") or "",
                        "description": p.get("description") or "",
                        "technologies": p.get("technologies") or p.get("tech") or ""
                    })
                elif isinstance(p, str):
                    projects.append({"title": p, "description": "", "technologies": ""})


        # Resumes & Active ATS
        resumes = []
        active_resume = db.query(Resume).filter(
            Resume.student_id == student.id,
            Resume.is_active == True
        ).first()
        if not active_resume:
            active_resume = db.query(Resume).filter(Resume.student_id == student.id).first()

        ats_summary = None
        if active_resume:
            resumes.append({
                "id": active_resume.id,
                "file_name": active_resume.file_name,
                "is_active": active_resume.is_active
            })
            
            # Get ATS summary if text is present
            extracted_text = getattr(active_resume, "extracted_text", None)
            if extracted_text:
                ats_result = analyze_resume_text(extracted_text)
                ats_summary = {
                    "resume_id": active_resume.id,
                    "ats_score": ats_result.get("ats_score", 0),
                    "detected_skills": ats_result.get("skills_detected", []),
                    "warnings": ats_result.get("warnings", []),
                    "recommendations": ats_result.get("recommendations", [])
                }

        user_name = None
        if student.user:
            user_name = getattr(student.user, "full_name", None) or getattr(student.user, "name", None)

        return {
            "student_id": student.id,
            "name": user_name or "Student",
            "education": education_items,
            "skills": skills,
            "projects": projects,
            "resumes": resumes,
            "ats_summary": ats_summary
        }

    def retrieve_general_rag_context(self, student: StudentProfile, question: str, db: Session) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Retrieves context for general student career questions.
        Combines student profile data and top semantically relevant jobs.
        """
        student_data = self.retrieve_student_context(student, db)
        sources = [
            {"type": "student_profile", "section": "education"},
            {"type": "student_profile", "section": "skills"},
            {"type": "student_profile", "section": "projects"}
        ]

        if student_data.get("ats_summary"):
            sources.append({
                "type": "ats",
                "resume_id": student_data["ats_summary"]["resume_id"]
            })

        # Perform semantic search for relevant active jobs using ChromaDB
        search_res = semantic_search_jobs(question, db, limit=RAG_TOP_K)
        relevant_jobs = search_res.get("results", [])

        # If semantic search returns few results, fallback to top recommendations from Step 11
        if not relevant_jobs:
            recs = recommendation_engine.get_recommendations(student, db, limit=3)
            for item in recs.recommendations:
                relevant_jobs.append({
                    "job_id": item.job_id,
                    "title": item.title,
                    "company": item.company,
                    "location": item.location,
                    "employment_type": item.employment_type,
                    "skills_required": ", ".join(item.matched_skills + item.missing_skills),
                    "semantic_score": item.semantic_score or 0.8
                })

        for job in relevant_jobs:
            sources.append({
                "type": "job",
                "job_id": job.get("job_id"),
                "title": job.get("title")
            })

        context_payload = {
            "student": student_data,
            "relevant_jobs": relevant_jobs
        }

        return context_payload, sources

    def retrieve_job_analysis_context(self, student: StudentProfile, target_job: Job, question: Optional[str], db: Session) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Retrieves comprehensive context for job-specific AI analysis.
        Integrates Step 11 Job Match, Step 12 Skill Gap, Step 10 ATS analysis.
        """
        student_data = self.retrieve_student_context(student, db)
        
        # 1. Step 11 Match Analysis
        match_res = recommendation_engine.compute_job_match(student, target_job, db)
        
        # 2. Step 12 Skill Gap Analysis
        skill_gap_res = skill_gap_analyzer.analyze_job_skill_gap(student, target_job, db)

        # 3. Step 10 Job-Specific ATS Analysis (if active resume exists)
        ats_job_analysis = None
        active_resume = db.query(Resume).filter(
            Resume.student_id == student.id,
            Resume.is_active == True
        ).first()
        if not active_resume:
            active_resume = db.query(Resume).filter(Resume.student_id == student.id).first()

        extracted_text = getattr(active_resume, "extracted_text", None) if active_resume else None
        if active_resume and extracted_text:
            ats_res = analyze_resume_text(
                resume_text=extracted_text,
                job_skills=target_job.skills_required,
                job_description=target_job.description
            )
            ats_job_analysis = {
                "resume_id": active_resume.id,
                "ats_score": ats_res.get("ats_score"),
                "matching_keywords": ats_res.get("matching_keywords", []),
                "missing_keywords": ats_res.get("missing_keywords", []),
                "warnings": ats_res.get("warnings", []),
                "recommendations": ats_res.get("recommendations", [])
            }


        job_info = {
            "job_id": target_job.id,
            "title": target_job.title,
            "company": target_job.company_name,
            "location": target_job.location or "Remote",
            "job_type": target_job.job_type,
            "skills_required": target_job.skills_required,
            "experience_required": target_job.experience_required,
            "description": target_job.description
        }

        match_info = {
            "match_score": match_res.match_score,
            "match_level": match_res.match_level,
            "matched_skills": match_res.matched_skills,
            "missing_skills": match_res.missing_skills,
            "reasons": match_res.reasons,
            "improvement_suggestions": match_res.improvement_suggestions
        }

        gap_info = {
            "coverage_percentage": skill_gap_res.skill_coverage_percentage,
            "missing_skills": skill_gap_res.missing_skills,
            "gaps": [{"skill": g.skill, "priority": g.priority} for g in skill_gap_res.gaps],
            "learning_roadmap": [{"order": r.order, "skill": r.skill, "topic": r.topic} for r in skill_gap_res.learning_roadmap]
        }

        sources = [
            {"type": "job", "job_id": target_job.id, "title": target_job.title},
            {"type": "student_profile", "section": "skills"},
            {"type": "skill_gap", "job_id": target_job.id}
        ]

        if ats_job_analysis:
            sources.append({"type": "ats", "resume_id": ats_job_analysis["resume_id"]})

        context_payload = {
            "student": student_data,
            "target_job": job_info,
            "match_analysis": match_info,
            "skill_gap_analysis": gap_info,
            "ats_analysis": ats_job_analysis
        }

        return context_payload, sources

# Global singleton
rag_retriever = RAGRetriever()
