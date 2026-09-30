import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from models.job import Job
from vector_store.chroma_client import get_jobs_collection, is_vector_store_available
from vector_store.embeddings import local_embedding_provider
from vector_store.documents import build_job_document

logger = logging.getLogger("placer_ai.vector_store")


def index_job(job: Job) -> bool:
    """
    Indexes or updates a single Job model in ChromaDB using stable document ID.
    Returns True on success, False if vector store is unavailable or operation failed.
    """
    if not is_vector_store_available():
        return False

    collection = get_jobs_collection()
    if not collection:
        return False

    try:
        doc_text, metadata = build_job_document(job)
        embedding = local_embedding_provider.embed_text(doc_text)

        collection.upsert(
            ids=[str(job.id)],
            documents=[doc_text],
            embeddings=[embedding],
            metadatas=[metadata]
        )
        logger.info(f"Successfully indexed job ID {job.id} into ChromaDB")
        return True
    except Exception as e:
        logger.error(f"Failed to index job ID {job.id} into ChromaDB: {e}")
        return False


def remove_job_index(job_id: int) -> bool:
    """
    Deletes a job vector document from ChromaDB.
    """
    if not is_vector_store_available():
        return False

    collection = get_jobs_collection()
    if not collection:
        return False

    try:
        collection.delete(ids=[str(job_id)])
        logger.info(f"Successfully removed job ID {job_id} from ChromaDB")
        return True
    except Exception as e:
        logger.error(f"Failed to remove job ID {job_id} from ChromaDB: {e}")
        return False


def reindex_all_jobs(db: Session) -> Dict[str, int]:
    """
    Bulk re-indexes all active jobs from PostgreSQL into ChromaDB.
    Returns a dictionary summary: {"indexed_count": int, "failed_count": int, "total_jobs": int}.
    """
    if not is_vector_store_available():
        return {"indexed_count": 0, "failed_count": 0, "total_jobs": 0, "status": "vector_store_unavailable"}

    collection = get_jobs_collection()
    if not collection:
        return {"indexed_count": 0, "failed_count": 0, "total_jobs": 0, "status": "collection_unavailable"}

    jobs = db.query(Job).filter(Job.status == "active").all()
    total_jobs = len(jobs)
    indexed_count = 0
    failed_count = 0

    if not jobs:
        return {"indexed_count": 0, "failed_count": 0, "total_jobs": 0, "status": "ok"}

    ids: List[str] = []
    documents: List[str] = []
    embeddings: List[List[float]] = []
    metadatas: List[Dict[str, Any]] = []

    for job in jobs:
        try:
            doc_text, metadata = build_job_document(job)
            emb = local_embedding_provider.embed_text(doc_text)

            ids.append(str(job.id))
            documents.append(doc_text)
            embeddings.append(emb)
            metadatas.append(metadata)
            indexed_count += 1
        except Exception as err:
            logger.error(f"Error processing job ID {job.id} for bulk indexing: {err}")
            failed_count += 1

    if ids:
        try:
            collection.upsert(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas
            )
        except Exception as e:
            logger.error(f"Failed bulk upsert to ChromaDB: {e}")
            return {"indexed_count": 0, "failed_count": total_jobs, "total_jobs": total_jobs, "status": "error"}

    return {
        "indexed_count": indexed_count,
        "failed_count": failed_count,
        "total_jobs": total_jobs,
        "status": "ok"
    }
