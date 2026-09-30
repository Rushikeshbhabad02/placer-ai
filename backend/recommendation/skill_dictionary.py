from typing import List, Dict

COMMON_SKILLS_DICTIONARY: List[str] = [
    # Programming Languages
    "Python", "Java", "C", "C++", "C#", "JavaScript", "TypeScript", "Go", "Rust", "PHP", "Ruby",
    # Frontend
    "HTML", "CSS", "React", "Angular", "Vue", "Next.js", "Bootstrap", "Tailwind", "SASS",
    # Backend
    "FastAPI", "Django", "Flask", "Node", "Express", "Spring Boot", "ASP.NET",
    # Database
    "SQL", "MySQL", "PostgreSQL", "Postgres", "Oracle", "MongoDB", "Redis", "SQLite",
    # Data & AI
    "Pandas", "NumPy", "Machine Learning", "Data Science", "Tableau", "Power BI", "Deep Learning", "NLP",
    # Cloud & DevOps
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Linux", "CI/CD",
    # Core Concepts & Soft Skills
    "Git", "GitHub", "REST API", "JWT", "System Design", "DSA", "Data Structures", "Algorithms",
    "Agile", "Scrum", "Communication", "Problem Solving", "Teamwork"
]

SKILL_VARIANTS_MAP: Dict[str, str] = {
    "react.js": "react",
    "reactjs": "react",
    "node.js": "node",
    "nodejs": "node",
    "vue.js": "vue",
    "vuejs": "vue",
    "express.js": "express",
    "expressjs": "express",
    "next.js": "next",
    "nextjs": "next",
    "postgresql": "postgres",
    "postgre sql": "postgres",
    "dsa": "dsa",
    "data structures": "dsa",
    "data structures and algorithms": "dsa",
    "ml": "machine learning",
    "machine learning": "machine learning",
    "ai": "ai",
    "artificial intelligence": "ai",
    "rest api": "rest api",
    "restful api": "rest api",
    "restful apis": "rest api",
    "rest apis": "rest api",
    "aws": "aws",
    "amazon web services": "aws",
    "gcp": "gcp",
    "google cloud platform": "gcp",
}
