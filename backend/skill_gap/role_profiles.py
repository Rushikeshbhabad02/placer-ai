from typing import List, Dict

TARGET_ROLE_PROFILES: Dict[str, List[str]] = {
    "Python Full Stack Developer": [
        "python", "django", "fastapi", "html", "css", "javascript", "react", "sql", "postgres", "git", "rest api"
    ],
    "Data Analyst": [
        "python", "sql", "pandas", "numpy", "excel", "statistics", "tableau"
    ],
    "Data Scientist": [
        "python", "pandas", "numpy", "statistics", "machine learning", "sql", "scikit-learn"
    ],
    "Frontend Developer": [
        "html", "css", "javascript", "typescript", "react", "bootstrap", "git", "rest api"
    ],
    "Backend Developer": [
        "python", "fastapi", "django", "node", "express", "sql", "postgres", "rest api", "git", "docker"
    ],
    "AI/ML Developer": [
        "python", "numpy", "pandas", "machine learning", "deep learning", "nlp", "artificial intelligence", "git"
    ],
    "Cloud/DevOps": [
        "linux", "git", "docker", "kubernetes", "aws", "gcp", "azure", "ci/cd"
    ]
}

def get_supported_target_roles() -> List[str]:
    """Returns the list of supported target roles for skill gap analysis."""
    return list(TARGET_ROLE_PROFILES.keys())
