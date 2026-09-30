from typing import Dict, Any, Optional
from rag.config import RAG_MAX_CONTEXT_CHARS

class RAGContextBuilder:
    """
    Constructs structured, clearly sectioned context strings for local LLM prompt injection.
    Enforces maximum context character limits safely.
    """

    def build_general_context(self, context_payload: Dict[str, Any], max_chars: int = RAG_MAX_CONTEXT_CHARS) -> str:
        """
        Builds structured context for general student chat questions.
        """
        student = context_payload.get("student", {})
        relevant_jobs = context_payload.get("relevant_jobs", [])

        sections = []

        # SECTION 1: STUDENT PROFILE
        student_lines = ["--- STUDENT PROFILE ---"]
        
        # Education
        edu_list = student.get("education", [])
        if edu_list:
            edu_strs = []
            for e in edu_list:
                s_name = e.get("school") or e.get("degree") or "College"
                f_study = e.get("field_of_study") or ""
                grade = e.get("grade") or ""
                edu_strs.append(f"{s_name} ({f_study}) {grade}".strip())
            student_lines.append(f"- Education: {'; '.join(edu_strs)}")
        else:
            student_lines.append("- Education: Not specified")

        # Skills
        skills = student.get("skills", [])
        student_lines.append(f"- Skills: {', '.join(skills) if skills else 'None specified'}")

        # Projects
        projects = student.get("projects", [])
        if projects:
            proj_strs = []
            for p in projects[:3]:  # Top 3 projects
                t = p.get("title") or "Project"
                tech = p.get("technologies") or ""
                desc = (p.get("description") or "")[:100]
                proj_strs.append(f"{t} [Tech: {tech}] - {desc}")
            student_lines.append(f"- Projects:\n  * " + "\n  * ".join(proj_strs))
        else:
            student_lines.append("- Projects: None listed")

        # ATS Summary if available
        ats = student.get("ats_summary")
        if ats:
            student_lines.append(f"- Active Resume ATS Score: {ats.get('ats_score')}/100")
            student_lines.append(f"  Detected ATS Skills: {', '.join(ats.get('detected_skills', []))}")

        sections.append("\n".join(student_lines))

        # SECTION 2: RELEVANT JOBS IN PLATFORM
        if relevant_jobs:
            job_lines = ["--- RELEVANT JOBS ---"]
            for idx, j in enumerate(relevant_jobs[:3], start=1):
                j_title = j.get("title") or "Job"
                j_comp = j.get("company") or "Company"
                j_loc = j.get("location") or "Location"
                j_req = j.get("skills_required") or "Not specified"
                j_id = j.get("job_id") or j.get("id")
                job_lines.append(f"Job #{j_id} - {j_title} at {j_comp} ({j_loc})\n  Required Skills: {j_req}")
            sections.append("\n".join(job_lines))

        full_context = "\n\n".join(sections)
        if len(full_context) > max_chars:
            full_context = full_context[:max_chars - 50] + "\n...[Context Truncated]"

        return full_context

    def build_job_analysis_context(self, context_payload: Dict[str, Any], max_chars: int = RAG_MAX_CONTEXT_CHARS) -> str:
        """
        Builds structured context for job-specific match analysis.
        """
        student = context_payload.get("student", {})
        job = context_payload.get("target_job", {})
        match = context_payload.get("match_analysis", {})
        skill_gap = context_payload.get("skill_gap_analysis", {})
        ats = context_payload.get("ats_analysis", {})

        sections = []

        # SECTION 1: STUDENT PROFILE
        student_lines = ["--- STUDENT PROFILE ---"]
        skills = student.get("skills", [])
        student_lines.append(f"- Verified Student Skills: {', '.join(skills) if skills else 'None listed'}")
        
        edu_list = student.get("education", [])
        if edu_list:
            edu_strs = [f"{e.get('degree') or ''} in {e.get('field_of_study') or ''}".strip() for e in edu_list]
            student_lines.append(f"- Education: {'; '.join(edu_strs)}")

        projects = student.get("projects", [])
        if projects:
            proj_strs = [p.get("title") for p in projects[:3] if p.get("title")]
            student_lines.append(f"- Key Projects: {', '.join(proj_strs)}")

        sections.append("\n".join(student_lines))

        # SECTION 2: TARGET JOB SPECIFICATIONS
        job_lines = [
            "--- TARGET JOB ---",
            f"- Job Title: {job.get('title')}",
            f"- Company: {job.get('company')}",
            f"- Location: {job.get('location')}",
            f"- Experience Level: {job.get('experience_required') or 'Fresher / Entry Level'}",
            f"- Required Skills: {job.get('skills_required') or 'Not specified'}",
            f"- Job Description Snippet: {(job.get('description') or '')[:300]}"
        ]
        sections.append("\n".join(job_lines))

        # SECTION 3: DETERMINISTIC MATCH ANALYSIS (STEP 11)
        match_lines = [
            "--- MATCH ANALYSIS (DETERMINISTIC ENGINE RESULT) ---",
            f"- Overall Match Score: {match.get('match_score')}/100 ({match.get('match_level', '').upper()} MATCH)",
            f"- Matched Skills: {', '.join(match.get('matched_skills', [])) if match.get('matched_skills') else 'None'}",
            f"- Missing Skills: {', '.join(match.get('missing_skills', [])) if match.get('missing_skills') else 'None'}"
        ]
        if match.get("reasons"):
            match_lines.append(f"- Match Reasons: {'; '.join(match.get('reasons')[:3])}")
        sections.append("\n".join(match_lines))

        # SECTION 4: SKILL GAP & LEARNING ROADMAP (STEP 12)
        if skill_gap:
            gap_lines = [
                "--- SKILL GAP ANALYSIS (STEP 12) ---",
                f"- Skill Coverage: {skill_gap.get('coverage_percentage')}%\n- Priority Missing Skills:"
            ]
            gaps = skill_gap.get("gaps", [])
            for g in gaps:
                gap_lines.append(f"  * {g.get('skill')} (Priority: {g.get('priority')})")
            
            roadmap = skill_gap.get("learning_roadmap", [])
            if roadmap:
                gap_lines.append("- Recommended Learning Order:")
                for r in roadmap[:4]:
                    gap_lines.append(f"  {r.get('order')}. Learn {r.get('skill')} ({r.get('topic')})")
            sections.append("\n".join(gap_lines))

        # SECTION 5: RESUME ATS ALIGNMENT (STEP 10)
        if ats:
            ats_lines = [
                "--- RESUME ATS ALIGNMENT (STEP 10) ---",
                f"- ATS Score: {ats.get('ats_score')}/100",
                f"- Matching Keywords: {', '.join(ats.get('matching_keywords', [])) if ats.get('matching_keywords') else 'None'}",
                f"- Missing Keywords: {', '.join(ats.get('missing_keywords', [])) if ats.get('missing_keywords') else 'None'}"
            ]
            if ats.get("warnings"):
                ats_lines.append(f"- ATS Warnings: {'; '.join(ats.get('warnings'))}")
            sections.append("\n".join(ats_lines))

        full_context = "\n\n".join(sections)
        if len(full_context) > max_chars:
            full_context = full_context[:max_chars - 50] + "\n...[Context Truncated]"

        return full_context

# Global singleton instance
rag_context_builder = RAGContextBuilder()
