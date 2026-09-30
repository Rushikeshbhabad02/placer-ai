import os
from typing import List, Set, Optional
from sqlalchemy.orm import Session
from models.student_profile import StudentProfile
from models.resume import Resume
from recommendation.skill_normalizer import normalize_skill, extract_skills_from_text


def aggregate_student_skill_profile(student_profile: StudentProfile, db: Optional[Session] = None) -> List[str]:
    """
    Aggregates a comprehensive normalized skill list for a student by combining:
    1. Student Skills table records
    2. Project descriptions & technologies
    3. Education field of study & degree
    4. Primary / Active Resume extracted text
    Returns a sorted list of unique normalized skill strings.
    """
    collected_skills = set()

    # 1. DB Skills table
    if student_profile.skills:
        for sk in student_profile.skills:
            if hasattr(sk, "name") and sk.name:
                norm = normalize_skill(sk.name)
                if norm:
                    collected_skills.add(norm)

    # 2. Projects
    if student_profile.projects:
        for proj in student_profile.projects:
            tech_text = getattr(proj, "technologies", None) or getattr(proj, "technologies_used", None) or ""
            proj_text = f"{proj.title or ''} {proj.description or ''} {tech_text}"
            proj_skills = extract_skills_from_text(proj_text)
            for ps in proj_skills:
                collected_skills.add(ps)

    # 3. Education
    education_text = f"{student_profile.degree or ''} {student_profile.branch or ''} {student_profile.college or ''}"
    if student_profile.education_records:
        for edu in student_profile.education_records:
            education_text += f" {edu.degree or ''} {edu.field_of_study or ''}"

    edu_skills = extract_skills_from_text(education_text)
    for es in edu_skills:
        collected_skills.add(es)

    # 4. Resume text / ATS detected skills
    resume_obj = None
    if student_profile.resumes:
        for r in student_profile.resumes:
            if getattr(r, "is_primary", False) or getattr(r, "is_active", False):
                resume_obj = r
                break
        if not resume_obj and len(student_profile.resumes) > 0:
            resume_obj = student_profile.resumes[0]

    if resume_obj:
        extracted = getattr(resume_obj, "extracted_text", None)
        if extracted:
            r_skills = extract_skills_from_text(extracted)
            for rs in r_skills:
                collected_skills.add(rs)
        elif resume_obj.file_path and os.path.exists(resume_obj.file_path):
            try:
                from resume.extractor import extract_text_from_file
                text = extract_text_from_file(resume_obj.file_path, getattr(resume_obj, "file_type", ""))
                if text:
                    r_skills = extract_skills_from_text(text)
                    for rs in r_skills:
                        collected_skills.add(rs)
            except Exception:
                pass

    return sorted(list(collected_skills))
