import re
from typing import List
from .skill_dictionary import COMMON_SKILLS_DICTIONARY, SKILL_VARIANTS_MAP


def normalize_skill(skill: str) -> str:
    """
    Normalizes a single skill string to lower-case standard form.
    E.g., "Python" -> "python", "React.js" -> "react", "PostgreSQL" -> "postgres".
    """
    if not skill:
        return ""
    
    cleaned = skill.strip().lower()
    
    # Check variant mapping first
    if cleaned in SKILL_VARIANTS_MAP:
        return SKILL_VARIANTS_MAP[cleaned]
    
    return cleaned


def normalize_skill_list(skills: List[str]) -> List[str]:
    """
    Normalizes a list of skill strings and returns a deduplicated list.
    """
    if not skills:
        return []
    
    normalized_set = set()
    for s in skills:
        norm = normalize_skill(s)
        if norm:
            normalized_set.add(norm)
            
    return sorted(list(normalized_set))


def extract_skills_from_text(text: str) -> List[str]:
    """
    Scans arbitrary text (such as resume text or job description)
    against the central skill dictionary and returns normalized detected skills.
    """
    if not text:
        return []

    text_lower = text.lower()
    detected = set()

    for skill in COMMON_SKILLS_DICTIONARY:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text_lower):
            norm = normalize_skill(skill)
            if norm:
                detected.add(norm)

    return sorted(list(detected))
