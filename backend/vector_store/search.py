import math
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from models.job import Job
from models.student_profile import StudentProfile
from vector_store.chroma_client import get_jobs_collection, is_vector_store_available
from vector_store.embeddings import local_embedding_provider
from vector_store.documents import build_job_document, build_student_document

logger = logging.getLogger("placer_ai.vector_store")


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculates cosine similarity between two float vectors."""
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    dot = sum(a * b for a, b in zip(vec1, vec2))
    mag1 = math.sqrt(sum(a * a for a in vec1))
    mag2 = math.sqrt(sum(b * b for b in vec2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    val = dot / (mag1 * mag2)
    return max(0.0, min(1.0, round(val, 4)))


def semantic_search_jobs(query: str, db: Session, limit: int = 10) -> Dict[str, Any]:
    """
    Executes semantic similarity search against indexed job vector documents in ChromaDB.
    Verifies candidate matches against PostgreSQL source-of-truth.
    """
    if not is_vector_store_available():
        return {
            "query": query,
            "results": [],
            "total": 0,
            "status": "vector_store_unavailable",
            "message": "Semantic search vector engine is currently unavailable."
        }

    collection = get_jobs_collection()
    if not collection:
        return {
            "query": query,
            "results": [],
            "total": 0,
            "status": "collection_unavailable"
        }

    query_text = (query or "").strip()
    if not query_text:
        return {
            "query": query,
            "results": [],
            "total": 0,
            "status": "empty_query"
        }

    query_emb = local_embedding_provider.embed_text(query_text)

    try:
        results_raw = collection.query(
            query_embeddings=[query_emb],
            n_results=min(limit * 3, 50),
            include=["documents", "metadatas", "distances"]
        )
    except Exception as e:
        logger.error(f"ChromaDB query execution error: {e}")
        return {
            "query": query,
            "results": [],
            "total": 0,
            "status": "error"
        }

    ids_list = results_raw.get("ids", [[]])[0]
    distances_list = results_raw.get("distances", [[]])[0]
    metadatas_list = results_raw.get("metadatas", [[]])[0]

    candidate_scores: Dict[int, float] = {}
    for idx, job_id_str in enumerate(ids_list):
        try:
            j_id = int(job_id_str)
            dist = distances_list[idx] if idx < len(distances_list) else 1.0
            # Convert cosine distance d in [0, 2] to similarity score in [0, 1]
            sim_score = max(0.0, min(1.0, round(1.0 - (dist / 2.0), 4)))
            candidate_scores[j_id] = sim_score
        except (ValueError, TypeError):
            continue

    if not candidate_scores:
        return {
            "query": query,
            "results": [],
            "total": 0,
            "status": "ok"
        }

    # PostgreSQL Source-of-Truth verification
    active_jobs = db.query(Job).filter(
        Job.id.in_(list(candidate_scores.keys())),
        Job.status == "active"
    ).all()

    verified_results = []
    for job in active_jobs:
        score = candidate_scores.get(job.id, 0.0)
        
        salary_str = None
        if job.salary_min or job.salary_max:
            salary_str = f"₹{int(job.salary_min or 0):,} - ₹{int(job.salary_max or 0):,}"

        verified_results.append({
            "job_id": job.id,
            "title": job.title,
            "company": job.company_name,
            "location": job.location or "Remote",
            "employment_type": job.job_type,
            "salary_range": salary_str,
            "skills_required": job.skills_required or "",
            "semantic_score": score,
            "similarity_percentage": round(score * 100.0, 1)
        })

    # Sort results by semantic_score descending
    verified_results.sort(key=lambda x: x["semantic_score"], reverse=True)
    selected = verified_results[:limit]

    return {
        "query": query,
        "results": selected,
        "total": len(selected),
        "status": "ok"
    }


def semantic_match_student_to_job(student: StudentProfile, job: Job, db: Session) -> float:
    """
    Calculates direct semantic similarity score between a StudentProfile and a Job.
    Returns float similarity score between 0.00 and 1.00.
    """
    try:
        student_doc = build_student_document(student, db)
        job_doc, _ = build_job_document(job)

        student_emb = local_embedding_provider.embed_text(student_doc)
        job_emb = local_embedding_provider.embed_text(job_doc)

        return cosine_similarity(student_emb, job_emb)
    except Exception as e:
        logger.error(f"Error computing student-job semantic match: {e}")
        return 0.0
