# PLACER-AI Security Audit & Verification Checklist

This document details the security posture and verification status for the PLACER-AI platform across backend APIs, authentication, storage, vector indexing, and frontend modules.

---

## Security Audit Status

- [x] **JWT Secret Externalized**: Configured via `JWT_SECRET_KEY` environment variable. Defaults to local key only in dev.
- [x] **Password Hashing**: Passwords stored exclusively as `bcrypt` hashes; plaintext passwords are never logged or stored.
- [x] **Role-Based Access Control (RBAC)**: Enforced via `require_role(["student", "recruiter", "mentor", "admin"])` dependencies on all protected routes.
- [x] **Ownership Isolation (IDOR Protection)**:
  - Students can only access their own profile, skills, projects, education, applications, resumes, and AI analysis.
  - Recruiters can only access candidates and applications for jobs created by their own user ID.
  - Mentors can only manage assigned approvals.
  - Inactive users are rejected by authentication dependencies.
- [x] **CORS Restricted**:
  - Restricts origins to `CORS_ORIGINS` environment variable in production.
  - Wildcard `*` disabled when credentials/authentication are enabled.
- [x] **File Upload Security**:
  - MIME type validation (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
  - File extension validation (`.pdf`, `.docx`).
  - Safe UUID filename generation (`uuid4().hex`) preventing path traversal attacks.
  - Maximum upload size restricted (`5 MB`).
  - Direct static directory browsing disabled for raw upload paths.
- [x] **Safe Response Schemas**:
  - `password_hash` excluded from all API response models.
  - Internal database paths, connection strings, and server traces hidden from response bodies.
- [x] **No Secrets in Frontend / Git**:
  - `.env`, `*.db`, `uploads/`, `data/chroma/` listed in `.gitignore`.
  - Frontend environment variables restricted to public API URLs (`REACT_APP_API_URL`).
- [x] **RAG Security & Input Sanitation**:
  - Retrieved ChromaDB contexts treated as untrusted data.
  - System prompts instruct LLM to answer read-only questions only.
  - RAG engine contains zero state-mutating tools or execution capabilities.
- [x] **Database & Vector Isolation**:
  - PostgreSQL acts as authoritative relational source of truth.
  - ChromaDB acts as non-destructive, rebuildable derived vector index.
  - Inactive and deleted jobs filtered before returning semantic search or RAG contexts.
- [x] **AI Failure Graceful Degradation**:
  - If Ollama or ChromaDB is down, core application APIs (auth, jobs, applications, ATS, skill gap) continue functioning without crash.

---

## Recommended Production Enhancements

1. **Rate Limiting**: Implement API rate limiting (e.g. `slowapi` or Nginx reverse proxy limit) on `/auth/login`, `/student/resumes/upload`, and `/student/ai/chat`.
2. **HTTPS/TLS Termination**: Deploy behind Nginx, Cloudflare, or AWS ALB with forced TLS 1.3 encryption.
3. **Database Backups**: Enable automated point-in-time PostgreSQL backups before running production updates.
4. **S3 Object Storage**: Migrate resume file uploads from local disk to S3-compatible cloud storage for ephemeral server setups.
