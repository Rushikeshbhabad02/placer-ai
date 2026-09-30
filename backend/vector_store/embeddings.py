import math
import hashlib
import re
from typing import List

class EmbeddingProvider:
    """
    Abstract Base Class / Interface for Local Vector Embedding Providers.
    Generates 384-dimensional dense vector representations locally without external API keys.
    """

    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    def _tokenize(self, text: str) -> List[str]:
        text_clean = (text or "").lower()
        return [w for w in re.split(r'[^a-z0-9#+.]+', text_clean) if len(w) > 1]

    def embed_text(self, text: str) -> List[float]:
        """Generate a normalized 384-dimensional dense vector for a single text string."""
        tokens = self._tokenize(text)
        if not tokens:
            return [0.0] * self.dimension

        vector = [0.0] * self.dimension
        for token in tokens:
            # Generate deterministic hash feature indices
            h1 = int(hashlib.md5(token.encode('utf-8')).hexdigest(), 16)
            h2 = int(hashlib.sha256(token.encode('utf-8')).hexdigest(), 16)
            
            idx1 = h1 % self.dimension
            idx2 = h2 % self.dimension
            val1 = 1.0 if (h1 & 1) else -1.0
            val2 = 1.0 if (h2 & 1) else -1.0

            vector[idx1] += val1
            vector[idx2] += val2

        # L2 Vector Normalization
        magnitude = math.sqrt(sum(v * v for v in vector))
        if magnitude > 0:
            vector = [round(v / magnitude, 6) for v in vector]

        return vector

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generate dense vectors for a batch of text strings."""
        return [self.embed_text(t) for t in texts]

# Singleton local embedding provider instance
local_embedding_provider = EmbeddingProvider(dimension=384)
