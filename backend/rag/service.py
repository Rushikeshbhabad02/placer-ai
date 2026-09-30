import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from models.student_profile import StudentProfile
from models.job import Job
from rag.retriever import rag_retriever
from rag.context_builder import rag_context_builder
from rag.prompt_builder import rag_prompt_builder
from rag.ollama_client import ollama_client
from recommendation.engine import recommendation_engine

logger = logging.getLogger("placer_ai.rag.service")

class RAGService:
    """
    Service orchestrator for student RAG AI chat and job-specific match analysis.
    Ensures answers are grounded in retrieved context and degrades gracefully if Ollama is offline.
    """

    def answer_student_question(self, student: StudentProfile, question: str, db: Session) -> Dict[str, Any]:
        """
        Orchestrates RAG pipeline for general student career / placement questions.
        """
        q_text = (question or "").strip()
        if not q_text:
            return {
                "answer": "Please provide a valid question.",
                "sources": [],
                "grounded": False,
                "ai_available": True
            }

        # 1. Retrieve Context and Sources
        context_payload, sources = rag_retriever.retrieve_general_rag_context(student, q_text, db)
        
        # 2. Build Structured Context Text
        context_text = rag_context_builder.build_general_context(context_payload)

        # Check if context is completely empty
        if not context_text or "None specified" in context_text and not context_payload.get("relevant_jobs"):
            return {
                "answer": "I don't have enough relevant information to answer this question.",
                "sources": sources,
                "grounded": True,
                "ai_available": True
            }

        # 3. Build Grounded Prompt
        prompt = rag_prompt_builder.build_prompt(q_text, context_text)

        # 4. Generate Response via Ollama HTTP Client
        res = ollama_client.generate(prompt)
        
        if not res.get("success"):
            return {
                "answer": res.get("message", "Local AI service is currently unavailable. Please start Ollama and try again."),
                "sources": sources,
                "grounded": False,
                "ai_available": False
            }

        return {
            "answer": res.get("response", ""),
            "sources": sources,
            "grounded": True,
            "ai_available": True
        }

    def analyze_job_with_ai(self, student: StudentProfile, target_job: Job, custom_question: Optional[str], db: Session) -> Dict[str, Any]:
        """
        Orchestrates RAG pipeline for job-specific match explanations and recommendations.
        """
        # 1. Retrieve Context and Sources (reusing Step 11 match and Step 12 skill gap)
        context_payload, sources = rag_retriever.retrieve_job_analysis_context(student, target_job, custom_question, db)
        
        match_info = context_payload.get("match_analysis", {})
        match_score = match_info.get("match_score")
        missing_skills = match_info.get("missing_skills", [])

        # Default question if none provided
        question = custom_question if custom_question and custom_question.strip() else f"Explain my match for {target_job.title} at {target_job.company_name} and how I can improve."

        # 2. Build Structured Context Text
        context_text = rag_context_builder.build_job_analysis_context(context_payload)

        # 3. Build Grounded Prompt
        prompt = rag_prompt_builder.build_prompt(question, context_text)

        # 4. Generate Response via Ollama HTTP Client
        res = ollama_client.generate(prompt)

        if not res.get("success"):
            # Provide deterministic breakdown as fallback answer if Ollama is unavailable
            fallback_msg = (
                f"Your match score for {target_job.title} is {match_score}/100. "
                f"Matched skills: {', '.join(match_info.get('matched_skills', [])) or 'None'}. "
                f"Missing skills: {', '.join(missing_skills) or 'None'}. "
                f"(Note: Local AI service is currently unavailable for natural language explanations)."
            )
            return {
                "job_id": target_job.id,
                "answer": fallback_msg,
                "match_score": match_score,
                "missing_skills": missing_skills,
                "sources": sources,
                "grounded": False,
                "ai_available": False
            }

        return {
            "job_id": target_job.id,
            "answer": res.get("response", ""),
            "match_score": match_score,
            "missing_skills": missing_skills,
            "sources": sources,
            "grounded": True,
            "ai_available": True
        }

# Global singleton instance
rag_service = RAGService()
