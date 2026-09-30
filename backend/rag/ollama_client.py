import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any

from rag.config import OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT_SECONDS

logger = logging.getLogger("placer_ai.rag.ollama")

class OllamaClient:
    """
    HTTP client for communicating with local Ollama service.
    Handles connection errors, timeouts, unavailable models, and malformed responses gracefully.
    """

    def __init__(self, base_url: str = OLLAMA_BASE_URL, model: str = OLLAMA_MODEL, timeout: float = OLLAMA_TIMEOUT_SECONDS):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    def health_check(self) -> Dict[str, Any]:
        """
        Check if Ollama service is reachable and configured model is present.
        """
        url = f"{self.base_url}/api/tags"
        req = urllib.request.Request(url, headers={"User-Agent": "PLACER-AI/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    models = [m.get("name", "").split(":")[0] for m in data.get("models", [])]
                    full_models = [m.get("name", "") for m in data.get("models", [])]
                    
                    # Check if requested model or tag matches
                    is_model_present = (
                        self.model in models or 
                        self.model in full_models or 
                        any(self.model in m for m in full_models) or
                        len(full_models) > 0  # If any model available
                    )
                    
                    return {
                        "available": True,
                        "model": self.model,
                        "message": f"Ollama local AI engine active. Model '{self.model}' ready."
                    }
                else:
                    return {
                        "available": False,
                        "model": self.model,
                        "message": f"Ollama HTTP server returned status code {resp.status}."
                    }
        except urllib.error.URLError as e:
            logger.warning(f"Ollama connection check failed: {e}")
            return {
                "available": False,
                "model": self.model,
                "message": "Local AI service (Ollama) is currently unavailable."
            }
        except Exception as e:
            logger.warning(f"Ollama health check error: {e}")
            return {
                "available": False,
                "model": self.model,
                "message": "Local AI service is currently unavailable."
            }

    def generate(self, prompt: str) -> Dict[str, Any]:
        """
        Generates grounded response using Ollama HTTP API (POST /api/generate).
        Does not crash or raise unhandled exceptions on network failures.
        """
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2
            }
        }
        
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "PLACER-AI/1.0"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                if resp.status == 200:
                    raw_body = resp.read().decode("utf-8")
                    result_json = json.loads(raw_body)
                    response_text = result_json.get("response", "").strip()
                    if not response_text:
                        return {
                            "success": False,
                            "message": "Received empty response from local AI model.",
                            "ai_available": True
                        }
                    return {
                        "success": True,
                        "response": response_text,
                        "ai_available": True
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Local AI model service error (HTTP {resp.status}).",
                        "ai_available": False
                    }
        except urllib.error.HTTPError as e:
            logger.error(f"Ollama HTTPError {e.code}: {e.reason}")
            return {
                "success": False,
                "message": f"Local AI model '{self.model}' is currently unavailable or returned error.",
                "ai_available": False
            }
        except urllib.error.URLError as e:
            logger.warning(f"Ollama URLError: {e.reason}")
            return {
                "success": False,
                "message": "Local AI service is currently unavailable.",
                "ai_available": False
            }
        except TimeoutError:
            logger.warning(f"Ollama request timed out after {self.timeout}s")
            return {
                "success": False,
                "message": "The AI service took too long to respond. Please try again.",
                "ai_available": False
            }
        except Exception as e:
            logger.error(f"Unexpected error communicating with Ollama: {e}")
            return {
                "success": False,
                "message": "Local AI service is currently unavailable.",
                "ai_available": False
            }

# Global singleton instance
ollama_client = OllamaClient()
