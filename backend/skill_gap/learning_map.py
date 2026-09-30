from typing import Dict, Any

LEARNING_MAP: Dict[str, Dict[str, str]] = {
    "python": {
        "topic": "Python Fundamentals & OOP",
        "reason": "Core programming language for backend, automation, and data engineering",
        "priority": "high"
    },
    "django": {
        "topic": "Django Web Development & REST Framework",
        "reason": "Full-featured backend web framework required for enterprise applications",
        "priority": "high"
    },
    "fastapi": {
        "topic": "FastAPI Async Web APIs & Pydantic",
        "reason": "High-performance modern Python REST API framework",
        "priority": "high"
    },
    "react": {
        "topic": "React.js Components, Hooks & State Management",
        "reason": "Industry standard frontend library for dynamic web applications",
        "priority": "high"
    },
    "javascript": {
        "topic": "Modern ES6+ JavaScript & Async Programming",
        "reason": "Essential web development scripting language",
        "priority": "high"
    },
    "typescript": {
        "topic": "TypeScript Type Systems & Static Typing",
        "reason": "Scalable JavaScript development with static type safety",
        "priority": "medium"
    },
    "html": {
        "topic": "HTML5 Semantic Structure & Web Accessibility",
        "reason": "Core foundational structure of web pages",
        "priority": "medium"
    },
    "css": {
        "topic": "CSS3 Flexbox, Grid & Responsive Layouts",
        "reason": "Visual styling and dynamic application responsive design",
        "priority": "medium"
    },
    "sql": {
        "topic": "SQL Relational Queries, JOINs & Subqueries",
        "reason": "Database query language for data retrieval and persistence",
        "priority": "high"
    },
    "postgres": {
        "topic": "PostgreSQL Relational Database & Indexing",
        "reason": "Enterprise relational database system",
        "priority": "high"
    },
    "mongodb": {
        "topic": "MongoDB NoSQL Document Store & Aggregations",
        "reason": "Popular document-oriented database for flexible schemas",
        "priority": "medium"
    },
    "node": {
        "topic": "Node.js Runtime & Event Loop Architecture",
        "reason": "Server-side JavaScript runtime environment",
        "priority": "high"
    },
    "express": {
        "topic": "Express.js REST Middleware & Routing",
        "reason": "Minimalist web framework for Node.js backends",
        "priority": "medium"
    },
    "docker": {
        "topic": "Docker Containerization & Docker Compose",
        "reason": "Container technology for application deployment isolation",
        "priority": "medium"
    },
    "kubernetes": {
        "topic": "Kubernetes Container Orchestration & Clusters",
        "reason": "Automated deployment, scaling, and container management",
        "priority": "low"
    },
    "git": {
        "topic": "Git Version Control, Branching & GitHub Workflows",
        "reason": "Distributed version control system essential for teamwork",
        "priority": "high"
    },
    "rest api": {
        "topic": "RESTful API Design, Auth & Integration",
        "reason": "Architectural pattern for frontend-backend web communication",
        "priority": "high"
    },
    "pandas": {
        "topic": "Pandas DataFrames, Cleaning & Manipulation",
        "reason": "Data manipulation library for data science and analysis",
        "priority": "high"
    },
    "numpy": {
        "topic": "NumPy Numerical Computing & Matrix Arrays",
        "reason": "Fundamental library for scientific computing in Python",
        "priority": "medium"
    },
    "statistics": {
        "topic": "Applied Probability, Hypothesis Testing & Statistics",
        "reason": "Statistical foundations for analytical modeling and data science",
        "priority": "high"
    },
    "machine learning": {
        "topic": "Supervised & Unsupervised Machine Learning Algorithms",
        "reason": "Core predictive modeling and AI algorithm development",
        "priority": "high"
    },
    "deep learning": {
        "topic": "Neural Networks, PyTorch & TensorFlow",
        "reason": "Advanced neural network architectures for complex AI models",
        "priority": "medium"
    },
    "nlp": {
        "topic": "Natural Language Processing & Text Mining",
        "reason": "Text processing, embeddings, and language understanding",
        "priority": "medium"
    },
    "tableau": {
        "topic": "Tableau Data Visualization & BI Dashboards",
        "reason": "Business intelligence tool for visual data storytelling",
        "priority": "medium"
    },
    "aws": {
        "topic": "AWS Cloud Services (EC2, S3, RDS, Lambda)",
        "reason": "Leading cloud provider infrastructure management",
        "priority": "medium"
    },
    "linux": {
        "topic": "Linux Command Line, Shell Scripting & Server Admin",
        "reason": "Standard server operating system environment",
        "priority": "medium"
    },
    "ci/cd": {
        "topic": "CI/CD Automated Pipelines (GitHub Actions / Jenkins)",
        "reason": "Continuous integration and deployment automation",
        "priority": "medium"
    }
}

def get_learning_info(skill: str) -> Dict[str, str]:
    """Retrieves learning topic, reason, and priority for a normalized skill."""
    skill_key = skill.lower().strip()
    if skill_key in LEARNING_MAP:
        return LEARNING_MAP[skill_key]
    
    # Generic fallback for unmapped skills
    return {
        "topic": f"Master {skill.title()} Concepts & Practical Implementation",
        "reason": f"Required competency for target role / job position",
        "priority": "medium"
    }
