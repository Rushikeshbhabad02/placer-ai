# PLACER-AI — AI-Powered Placement & Internship Management Platform

PLACER-AI is a comprehensive, multi-role placement management platform built with FastAPI, PostgreSQL, React, ChromaDB, and Ollama Local Generative AI. It connects Students, Recruiters, Mentors, and Placement Administrators into an automated workflow enhanced with rule-based ATS parsing, AI job recommendations, skill-gap learning roadmaps, 384D semantic vector search, and grounded RAG AI assistance.

---

## Key Features

1. **Multi-Role Authentication & Security**: JWT-based authentication with bcrypt password hashing and strict Role-Based Access Control (RBAC) for `student`, `recruiter`, `mentor`, and `admin`.
2. **Student Portal**: Complete student profile management, education history, skills, project portfolio, resume upload, and active job discovery.
3. **Rule-Based Resume ATS**: PDF/DOCX text extraction, keyword alignment, layout scoring, formatting check, and actionable ATS score improvement feedback.
4. **AI Job Recommendation & Match Score**: Deterministic multi-factor match score (skills, eligibility, education, resume alignment, profile completeness).
5. **Skill Gap Analysis & Learning Roadmap**: Comprehensive gap analysis comparing student skills against job posting requirements and target career roles, generating prioritized learning paths.
6. **ChromaDB Semantic Search & 384D Embeddings**: High-performance vector similarity search across job postings using local dense vector embeddings with PostgreSQL source-of-truth filtering.
7. **RAG + Ollama Contextual Generative AI**: Local LLM assistant (`llama3.2:1b`) providing grounded answers to student career queries and detailed job fit analyses with prompt injection defenses.
8. **Recruiter Portal**: Job creation, application tracking, interview scheduling, assessment management, and candidate matching scores.
9. **Mentor Portal**: Student approval requests, profile verifications, and mentor dashboard.
10. **Admin Portal**: System statistics dashboard, user activation/deactivation management, role oversight, and ChromaDB vector index trigger.

---

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Pydantic V2, Gunicorn, Uvicorn.
- **Database**: PostgreSQL (Authoritative Relational Store).
- **Vector Store**: ChromaDB (Derived Persistent Semantic Vector Index).
- **Generative AI / LLM**: Ollama (`llama3.2:1b` / local LLM service).
- **Frontend**: React.js, Vanilla CSS Design System, Axios.
- **Testing**: Python `unittest`, `fastapi.testclient.TestClient`.

---

## Setup & Local Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or local SQLite for dev fallback)
- Ollama (Optional for local RAG generative features)

### 1. Environment Configuration
Copy environment placeholders to `.env`:
```bash
cp backend/.env.example backend/.env
```

Set environment variables in `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/placer_ai
JWT_SECRET_KEY=your-secure-production-jwt-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
UPLOAD_DIRECTORY=./uploads/resumes
MAX_UPLOAD_SIZE_MB=5
CHROMA_PERSIST_DIRECTORY=./data/chroma
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend API server will run at: `http://localhost:8000`  
Swagger API Docs available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
npm install
npm start
```
Frontend development server will run at: `http://localhost:3000`

---

## Running Test Suite

Execute the comprehensive backend test suites:
```bash
python backend/test_final_integration.py
python backend/test_rag.py
python backend/test_semantic_search.py
python backend/test_recommendation.py
python backend/test_skill_gap.py
python backend/test_student_module.py
python backend/test_recruiter_module.py
python backend/test_mentor_module.py
python backend/test_admin_module.py
python backend/test_placement_workflow.py
python backend/test_resume_ats.py
```

Build the frontend production bundle:
```bash
npm run build
```

---

## API Summary

- `POST /auth/register` — Register user account
- `POST /auth/login` — User login & JWT issuance
- `GET /auth/me` — Authenticated user info
- `GET /student/profile` — Student profile details
- `POST /student/resumes/upload` — Upload PDF/DOCX resume & calculate ATS score
- `GET /student/recommendations` — AI job recommendations
- `GET /student/jobs/{job_id}/match` — Match score calculation
- `GET /student/jobs/{job_id}/skill-gap` — Skill gap roadmap
- `GET /student/jobs/semantic-search` — ChromaDB 384D semantic vector job search
- `POST /student/ai/chat` — RAG grounded career AI assistant
- `POST /student/jobs/{job_id}/ai-analysis` — AI job fit analysis
- `GET /recruiter/jobs` — Recruiter job listings
- `GET /recruiter/jobs/{job_id}/candidate-matches` — Candidate match list
- `GET /admin/dashboard` — Admin system statistics
- `POST /admin/reindex-jobs` — Trigger vector store re-indexing
- `GET /health` — Application health check

---

## Deployment & Security

For production deployment instructions, Docker containerization, and security considerations, refer to:
- [DEPLOYMENT.md](file:///c:/Users/ASUS/Downloads/placer-ai-frontend%20%282%29/placer-ai-frontend/DEPLOYMENT.md)
- [SECURITY_CHECKLIST.md](file:///c:/Users/ASUS/Downloads/placer-ai-frontend%20%282%29/placer-ai-frontend/SECURITY_CHECKLIST.md)

---

## Known Production Limitations

1. **Local Disk Resume Storage**: Files stored on local disk should be migrated to S3 for ephemeral cloud containers.
2. **Local Ollama Requirement**: RAG generative features rely on a reachable Ollama instance; core ATS, recommendations, skill gap, and semantic search work independently without LLM availability.
3. **Database Schema Evolution**: Schema currently initializes with `create_all()`; Alembic migrations should be configured for frequent production model updates.
