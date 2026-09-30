from .chroma_client import (
    init_vector_store,
    is_vector_store_available,
    get_jobs_collection,
    get_chroma_client,
    CHROMA_DIR,
    COLLECTION_NAME
)
from .embeddings import local_embedding_provider, EmbeddingProvider
from .documents import build_job_document, build_student_document
from .indexer import index_job, remove_job_index, reindex_all_jobs
from .search import semantic_search_jobs, semantic_match_student_to_job
from .routes import vector_router

__all__ = [
    "init_vector_store",
    "is_vector_store_available",
    "get_jobs_collection",
    "get_chroma_client",
    "CHROMA_DIR",
    "COLLECTION_NAME",
    "local_embedding_provider",
    "EmbeddingProvider",
    "build_job_document",
    "build_student_document",
    "index_job",
    "remove_job_index",
    "reindex_all_jobs",
    "semantic_search_jobs",
    "semantic_match_student_to_job",
    "vector_router"
]
