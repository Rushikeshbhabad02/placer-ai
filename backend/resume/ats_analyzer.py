import re
from typing import List, Dict, Any, Optional

COMMON_SKILLS_DICTIONARY = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "Express",
    "HTML", "CSS", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Git", "GitHub",
    "Docker", "AWS", "Linux", "C++", "C#", "REST API", "DSA", "Data Structures",
    "Algorithms", "Machine Learning", "Data Analysis", "Tableau", "Power BI",
    "Figma", "UI/UX", "System Design", "Agile", "Scrum", "Communication",
    "Problem Solving", "Teamwork"
]

SECTION_KEYWORDS = {
    "Education": ["education", "academic", "university", "college", "degree", "b.tech", "b.e.", "cgpa", "gpa"],
    "Experience": ["experience", "work history", "employment", "internship", "position", "role"],
    "Projects": ["projects", "project", "key projects", "portfolio", "built", "developed"],
    "Skills": ["skills", "technical skills", "technologies", "proficiencies", "competencies"],
    "Certifications": ["certifications", "certificate", "certification", "licenses", "courses", "achievements"]
}


def analyze_resume_text(resume_text: str, job_skills: Optional[str] = None, job_description: Optional[str] = None) -> Dict[str, Any]:
    """
    Deterministic rule-based ATS analyzer scoring extracted resume text (0-100 score).
    """
    text = resume_text or ""
    text_lower = text.lower()

    # 1. Contact Information Detection (Max 15 pts)
    has_email = bool(re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text))
    has_phone = bool(re.search(r"\+?\d[\d\s\-]{8,14}\d", text))
    has_links = bool(re.search(r"(linkedin\.com|github\.com|portfolio|http|https)", text_lower))

    contact_pts = (5 if has_email else 0) + (5 if has_phone else 0) + (5 if has_links else 0)

    # 2. Section Detection (Max 20 pts)
    detected_sections = []
    for section, keywords in SECTION_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            detected_sections.append(section)

    sections_pts = min(20, len(detected_sections) * 4)

    # 3. Core Skills Detection (Max 25 pts)
    detected_skills = []
    for skill in COMMON_SKILLS_DICTIONARY:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text_lower):
            detected_skills.append(skill)

    skills_pts = min(25, len(detected_skills) * 3)

    # 4. Formatting & Word Count Structure (Max 20 pts)
    words = text.split()
    word_count = len(words)
    format_pts = 0

    if 150 <= word_count <= 1200:
        format_pts += 10
    elif word_count > 50:
        format_pts += 5

    has_bullets = bool(re.search(r"[\bullet\-\*•\u2022]", text)) or ("\n-" in text) or ("\n•" in text)
    if has_bullets or len(text.splitlines()) >= 10:
        format_pts += 10

    # 5. Job-Specific / Domain Keyword Alignment (Max 20 pts)
    target_keywords = set()
    if job_skills:
        for s in job_skills.split(","):
            s_clean = s.strip()
            if s_clean:
                target_keywords.add(s_clean.lower())

    if job_description:
        for word in re.findall(r"\b[a-zA-Z]{3,}\b", job_description.lower()):
            if word in [s.lower() for s in COMMON_SKILLS_DICTIONARY]:
                target_keywords.add(word)

    matching_keywords = []
    missing_keywords = []

    if target_keywords:
        for kw in target_keywords:
            if kw in text_lower:
                matching_keywords.append(kw.capitalize())
            else:
                missing_keywords.append(kw.capitalize())

        keyword_match_pct = round((len(matching_keywords) / len(target_keywords)) * 100, 1)
        job_alignment_pts = min(20, int((keyword_match_pct / 100) * 20))
    else:
        # Fallback baseline alignment based on detected skills
        keyword_match_pct = round(min(100.0, (len(detected_skills) / 8.0) * 100), 1)
        job_alignment_pts = min(20, int((keyword_match_pct / 100) * 20))
        matching_keywords = [s.capitalize() for s in detected_skills[:5]]

    # Total Score Calculation (0 - 100)
    total_score = min(100, contact_pts + sections_pts + skills_pts + format_pts + job_alignment_pts)

    # Rule-Based Warnings & Recommendations
    warnings = []
    recommendations = []

    if not has_email:
        warnings.append("Missing email address in contact section.")
        recommendations.append("Include a professional email address at the top of your resume.")
    if not has_phone:
        warnings.append("Missing phone number in contact section.")
        recommendations.append("Provide a primary contact phone number.")
    if "Education" not in detected_sections:
        warnings.append("Education section not clearly identified.")
        recommendations.append("Add an explicit 'Education' heading with your degree, college, and graduation year.")
    if "Experience" not in detected_sections and "Projects" not in detected_sections:
        warnings.append("Neither Work Experience nor Projects section was detected.")
        recommendations.append("Include a dedicated 'Projects' or 'Work Experience' section with key responsibilities.")
    if word_count < 150:
        warnings.append("Resume length is shorter than recommended (less than 150 words).")
        recommendations.append("Elaborate on project achievements, technical skills, and educational coursework.")
    if missing_keywords:
        recommendations.append(f"Consider adding key target skills: {', '.join(missing_keywords[:4])}.")

    if not warnings and total_score >= 80:
        recommendations.append("Resume structure and technical content look strong for automated ATS parsers.")

    return {
        "ats_score": total_score,
        "keyword_match_percentage": keyword_match_pct,
        "skills_detected": sorted(list(set(detected_skills))),
        "matching_keywords": sorted(list(set(matching_keywords))),
        "missing_keywords": sorted(list(set(missing_keywords))),
        "sections_detected": detected_sections,
        "contact_info_detected": {
            "email": has_email,
            "phone": has_phone,
            "links": has_links
        },
        "word_count": word_count,
        "warnings": warnings,
        "recommendations": recommendations
    }
