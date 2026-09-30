import os
import logging
from typing import Optional, Any

logger = logging.getLogger("placer_ai.vector_store")

CHROMA_DIR = os.path.abspath(
    os.getenv(
        "CHROMA_PERSIST_DIRECTORY",
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "chroma")
    )
)
COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "placer_jobs")

_chroma_client: Optional[Any] = None
_jobs_collection: Optional[Any] = None
_vector_store_initialized: bool = False

def init_vector_store() -> bool:
    """
    Safely initializes ChromaDB client and creates/fetches the jobs collection.
    Guarantees zero backend crashes if storage or ChromaDB fails.
    """
    global _chroma_client, _jobs_collection, _vector_store_initialized

    if _vector_store_initialized and _jobs_collection is not None:
        return True

    try:
        import chromadb
        from chromadb.config import Settings

        os.makedirs(CHROMA_DIR, exist_ok=True)

        _chroma_client = chromadb.PersistentClient(
            path=CHROMA_DIR,
            settings=Settings(allow_reset=True, anonymized_telemetry=False)
        )

        _jobs_collection = _chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )

        _vector_store_initialized = True
        logger.info(f"ChromaDB initialized at '{CHROMA_DIR}' with collection '{COLLECTION_NAME}'")
        return True
    except Exception as e:
        logger.warning(f"ChromaDB initialization failed: {e}. Vector search will gracefully degrade.")
        _vector_store_initialized = False
        _jobs_collection = None
        return False

def is_vector_store_available() -> bool:
    """Returns True if ChromaDB is active and accessible, False otherwise."""
    if not _vector_store_initialized:
        return init_vector_store()
    return _jobs_collection is not None

def get_jobs_collection() -> Optional[Any]:
    """Retrieves active ChromaDB collection for jobs or None if unavailable."""
    if is_vector_store_available():
        return _jobs_collection
    return None

def get_chroma_client() -> Optional[Any]:
    """Retrieves active ChromaDB client instance."""
    if is_vector_store_available():
        return _chroma_client
    return None
