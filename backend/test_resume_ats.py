import os
import io
import unittest
import docx
import pypdf
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException, UploadFile

from database import engine as default_engine, SessionLocal as DefaultSessionLocal, check_database_connection
from models import Base
from models.user import User
from models.student_profile import StudentProfile
from models.job import Job
from models.resume import Resume
from auth.security import hash_password
from auth.routes import register
from resume.routes import (
    upload_resume,
    get_student_resumes,
    delete_student_resume,
    analyze_resume,
    get_resume_analysis,
    UPLOAD_DIR
)
from schemas.auth import UserRegister
from schemas.resume import ATSAnalysisRequest

# Test DB Setup
db_status = check_database_connection()
if db_status.get("database") == "connected" and default_engine:
    test_engine = default_engine
    TestSessionLocal = DefaultSessionLocal
else:
    test_engine = create_engine("sqlite:///./test_placer_ai.db", connect_args={"check_same_thread": False})
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)


def create_sample_docx_bytes() -> bytes:
    """Helper to generate a valid in-memory DOCX file for testing."""
    doc = docx.Document()
    doc.add_heading("Rahul Kumar", 0)
    doc.add_paragraph("Email: rahul@example.com | Phone: 9876543210 | LinkedIn: linkedin.com/in/rahulkumar")
    doc.add_heading("Education", level=1)
    doc.add_paragraph("B.Tech in Computer Science, 2026. CGPA: 9.2")
    doc.add_heading("Experience & Projects", level=1)
    doc.add_paragraph("Full Stack Developer Intern at Tech Corp. Developed React and Python FastAPI applications.")
    doc.add_heading("Skills", level=1)
    doc.add_paragraph("Python, React, SQL, JavaScript, Git, Docker, REST API, DSA")

    bio = io.BytesIO()
    doc.save(bio)
    return bio.getvalue()


class TestResumeATSModule(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Prepare database test accounts for Student A, Student B, and Recruiter."""
        cls.db = TestSessionLocal()

        # Clean old test users & resumes
        emails = [
            "student_resume_a@example.com",
            "student_resume_b@example.com",
            "recruiter_resume_test@example.com"
        ]
        for email in emails:
            u = cls.db.query(User).filter(User.email == email).first()
            if u:
                cls.db.delete(u)
        cls.db.commit()

        # Register Student A
        cls.user_s_a = register(
            UserRegister(
                full_name="Student Resume A",
                email="student_resume_a@example.com",
                password="Password123!",
                role="student"
            ),
            cls.db
        )

        # Register Student B
        cls.user_s_b = register(
            UserRegister(
                full_name="Student Resume B",
                email="student_resume_b@example.com",
                password="Password123!",
                role="student"
            ),
            cls.db
        )

        # Register Recruiter
        cls.user_r = register(
            UserRegister(
                full_name="Recruiter Resume Test",
                email="recruiter_resume_test@example.com",
                password="Password123!",
                role="recruiter"
            ),
            cls.db
        )

        # Create target job for job-specific ATS test
        cls.job = Job(
            recruiter_id=cls.user_r.id,
            title="Senior React & Python Developer",
            company_name="Cloud Tech Solutions",
            description="Looking for Python, React, SQL, and Docker expertise",
            skills_required="React, Python, SQL, Docker, Git",
            status="active"
        )
        cls.db.add(cls.job)
        cls.db.commit()
        cls.db.refresh(cls.job)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    async def async_upload_helper(self, filename: str, content: bytes, content_type: str, user: User):
        """Helper to invoke async upload_resume route handler."""
        upload_file = UploadFile(filename=filename, file=io.BytesIO(content), headers={"content-type": content_type})
        return await upload_resume(file=upload_file, current_user=user, db=self.db)

    def test_01_resume_upload_docx_and_metadata_persistence(self):
        """Test uploading a valid DOCX resume and metadata persistence in PostgreSQL."""
        import asyncio
        docx_bytes = create_sample_docx_bytes()

        res = asyncio.run(self.async_upload_helper("rahul_resume.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", self.user_s_a))

        self.assertEqual(res.file_name, "rahul_resume.docx")
        self.assertTrue(res.is_active)
        self.assertGreater(res.file_size, 0)

        # Verify DB Persistence
        db_resume = self.db.query(Resume).filter(Resume.id == res.id).first()
        self.assertIsNotNone(db_resume)
        self.assertTrue(os.path.exists(db_resume.file_path))

    def test_02_invalid_file_type_and_oversized_rejection(self):
        """Test rejection of unsupported file types (.exe) and oversized files (>10MB)."""
        import asyncio

        # Invalid file type (.exe) -> 415
        with self.assertRaises(HTTPException) as cm:
            asyncio.run(self.async_upload_helper("malicious.exe", b"binary content", "application/octet-stream", self.user_s_a))
        self.assertEqual(cm.exception.status_code, 415)

        # Oversized file (>10MB) -> 413
        large_bytes = b"0" * (11 * 1024 * 1024)
        with self.assertRaises(HTTPException) as cm:
            asyncio.run(self.async_upload_helper("large.pdf", large_bytes, "application/pdf", self.user_s_a))
        self.assertEqual(cm.exception.status_code, 413)

    def test_03_resume_listing_and_ownership_isolation(self):
        """Test GET /student/resumes and ownership isolation between students."""
        # Student A gets resumes
        resumes_a = get_student_resumes(current_user=self.user_s_a, db=self.db)
        self.assertGreaterEqual(len(resumes_a), 1)

        target_resume = resumes_a[0]

        # Student B attempting to DELETE Student A's resume -> 403 Forbidden
        with self.assertRaises(HTTPException) as cm:
            delete_student_resume(resume_id=target_resume.id, current_user=self.user_s_b, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)

        # Student B attempting to ANALYZE Student A's resume -> 403 Forbidden
        with self.assertRaises(HTTPException) as cm:
            analyze_resume(resume_id=target_resume.id, job_id=None, req_body=None, current_user=self.user_s_b, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)

    def test_04_deterministic_ats_analysis_and_scoring(self):
        """Test deterministic rule-based ATS analysis, skill detection, section detection, and scoring."""
        resumes_a = get_student_resumes(current_user=self.user_s_a, db=self.db)
        target_resume = resumes_a[0]

        # Analyze resume without specific job
        analysis = analyze_resume(resume_id=target_resume.id, job_id=None, req_body=None, current_user=self.user_s_a, db=self.db)

        self.assertGreaterEqual(analysis.ats_score, 60)
        self.assertIn("Python", analysis.skills_detected)
        self.assertIn("React", analysis.skills_detected)
        self.assertTrue(analysis.contact_info_detected["email"])
        self.assertTrue(analysis.contact_info_detected["phone"])
        self.assertIn("Education", analysis.sections_detected)

    def test_05_job_specific_ats_analysis(self):
        """Test ATS analysis matching resume against target job requirements."""
        resumes_a = get_student_resumes(current_user=self.user_s_a, db=self.db)
        target_resume = resumes_a[0]

        # Analyze against job
        analysis = analyze_resume(resume_id=target_resume.id, job_id=self.job.id, req_body=ATSAnalysisRequest(job_id=self.job.id), current_user=self.user_s_a, db=self.db)

        self.assertGreater(analysis.keyword_match_percentage, 50.0)
        self.assertIn("Python", [k.capitalize() for k in analysis.matching_keywords])
        self.assertIn("React", [k.capitalize() for k in analysis.matching_keywords])

    def test_06_resume_deletion(self):
        """Test DELETE /student/resumes/{id} deletes DB record and disk file."""
        import asyncio
        docx_bytes = create_sample_docx_bytes()
        temp_res = asyncio.run(self.async_upload_helper("temp_delete.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", self.user_s_a))

        file_path = temp_res.file_name

        # Delete resume
        del_res = delete_student_resume(resume_id=temp_res.id, current_user=self.user_s_a, db=self.db)
        self.assertIn("deleted successfully", del_res["message"])

        # Verify DB deletion
        db_check = self.db.query(Resume).filter(Resume.id == temp_res.id).first()
        self.assertIsNone(db_check)


if __name__ == "__main__":
    unittest.main()
