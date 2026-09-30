# PLACER-AI Deployment & Operations Guide

> **Status Notice**: Production deployment configuration prepared; live cloud deployment not executed from this local environment.

---

## 1. System Architecture

```
                                 ┌───────────────────────┐
                                 │   React Frontend UI   │
                                 │  (Port 3000 / CDN)    │
                                 └───────────┬───────────┘
                                             │ HTTPS REST
                                             ▼
                                 ┌───────────────────────┐
                                 │  FastAPI Backend API  │
                                 │ (Gunicorn / Uvicorn)  │
                                 └───────────┬───────────┘
                                             │
         ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
         │                   │                               │                   │
         ▼                   ▼                               ▼                   ▼
┌─────────────────┐ ┌─────────────────┐             ┌─────────────────┐ ┌─────────────────┐
│  PostgreSQL DB  │ │ Local Filesystem│             │    ChromaDB     │ │  Ollama Server  │
│ (Primary Store) │ │ (Resume Store)  │             │ (Vector Index)  │ │ (Local LLM Service)│
└─────────────────┘ └─────────────────┘             └─────────────────┘ └─────────────────┘
```

### Component Responsibilities:
1. **FastAPI Backend**: Authoritative business logic, JWT authentication, RBAC, placement workflow, ATS scoring, recommendation engine, skill gap evaluation, vector query service, and RAG prompt processing.
2. **PostgreSQL**: Absolute source of truth for Users, Profiles, Jobs, Applications, Resumes, Skills, Interviews, Assessments, and Notifications.
3. **Local Filesystem / Object Storage**: Storage for uploaded PDF/DOCX resume documents.
4. **ChromaDB**: Derived semantic index storing 384-dimensional dense embeddings for fast similarity searches.
5. **Ollama**: Local generative AI provider for contextual Q&A and job fit analysis.

---

## 2. Environment Configuration

### Development vs Production Variables (`backend/.env`)

| Variable Key | Development Default | Production Recommended | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///./placer_ai.db` | `postgresql://user:pass@host:5432/dbname` | Authoritative database connection string |
| `JWT_SECRET_KEY` | `super-secret-jwt-key...` | `[Generative 256-bit Random Hex Secret]` | JWT signature secret |
| `JWT_ALGORITHM` | `HS256` | `HS256` | JWT signing algorithm |
| `JWT_EXPIRE_MINUTES` | `1440` (24h) | `120` (2h) | Access token validity window |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | `https://your-frontend-domain.com` | Allowed CORS origins |
| `UPLOAD_DIRECTORY` | `./uploads/resumes` | Persistent Mount / S3 Bucket | Target upload path |
| `MAX_UPLOAD_SIZE_MB` | `5` | `5` | Maximum file size limit |
| `CHROMA_PERSIST_DIRECTORY` | `./data/chroma` | Persistent Mount | ChromaDB storage folder |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | `http://ai-server.internal:11434` | Reachable Ollama API URL |
| `OLLAMA_MODEL` | `llama3.2:1b` | `llama3.2:1b` | Target LLM model name |

---

## 3. Storage Strategy & Production Warnings

### Resumes & File Storage
> [!WARNING]
> Local filesystem storage (`backend/uploads/resumes/`) is designed for development and single-server deployments. Ephemeral cloud containers (e.g. Heroku, AWS Fargate, Render without disk mounts) will lose uploaded files on restart.
> **Production Recommendation**: Integrate AWS S3, Google Cloud Storage, or mount a persistent volume (EFS / Render Disk) for `/app/uploads/resumes`.

### ChromaDB Vector Storage
> [!NOTE]
> ChromaDB is a derived vector index. If ChromaDB data is lost, it can be fully regenerated at any time by triggering the admin endpoint: `POST /admin/reindex-jobs`.
> **Production Recommendation**: Configure `CHROMA_PERSIST_DIRECTORY` on persistent disk storage or utilize a managed vector service (Pinecone / Qdrant) if horizontally scaling backend containers.

---

## 4. Database Initialization & Migration Warning

> [!IMPORTANT]
> The platform currently uses SQLAlchemy schema auto-creation (`Base.metadata.create_all(bind=engine)`).
> **Migration Warning**: For long-term production schema evolution, introduce **Alembic migrations** before modifying database models frequently. Never drop tables or reset production databases during deployments.

---

## 5. Deployment Step-by-Step

### Option A: Docker Deployment (Recommended)
1. Build container:
   ```bash
   docker build -t placer-ai-backend -f backend/Dockerfile .
   ```
2. Run container:
   ```bash
   docker run -d -p 8000:8000 --env-file backend/.env placer-ai-backend
   ```

### Option B: Manual Production Startup
1. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt gunicorn uvicorn
   ```
2. Start Gunicorn with Uvicorn workers:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app --bind 0.0.0.0:8000
   ```

### Option C: Frontend Production Deployment
1. Build optimized static assets:
   ```bash
   npm run build
   ```
2. Deploy the `build/` directory to static hosting (Vercel, Netlify, AWS S3 + CloudFront, or Nginx).

---

## 6. Production Verification Health Checks

Validate backend health endpoints post-deployment:
- `GET /health` -> `{"status": "healthy"}`
- `GET /health/db` -> `{"database": "connected"}`
- `GET /ai/health` -> `{"status": "ok", "ollama_available": true/false}`
