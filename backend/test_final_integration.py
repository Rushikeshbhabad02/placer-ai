import os
import sys
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient

backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from main import app
from database import engine as default_engine, SessionLocal as DefaultSessionLocal, check_database_connection
from auth.dependencies import get_db
from models import Base
from models.user import User
from models.student_profile import StudentProfile
from models.recruiter_profile import RecruiterProfile
from models.mentor_profile import MentorProfile
from models.job import Job
from models.skill import Skill
from models.project import Project
from models.education import Education
from models.resume import Resume
from models.application import Application
from auth.security import create_access_token, hash_password

db_status = check_database_connection()
if db_status.get("database") == "connected" and default_engine and DefaultSessionLocal:
    test_engine = default_engine
    TestSessionLocal = DefaultSessionLocal
else:
    test_engine = create_engine("sqlite:///./test_placer_ai.db", connect_args={"check_same_thread": False})
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestFinalIntegration(unittest.TestCase):
    """
    End-to-end integration test suite verifying complete multi-role platform capabilities:
    Student, Recruiter, Mentor, Admin, Placement Workflow, ATS, Recommendation, Skill Gap, Semantic Search, and RAG AI.
    """

    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=test_engine)
        cls.client = TestClient(app)

    def setUp(self):
        self.db = TestSessionLocal()

        # Clean isolated test records
        try:
            self.db.execute(text("DELETE FROM student_skills"))
        except Exception:
            pass
        self.db.query(Application).delete()
        self.db.query(Resume).delete()
        self.db.query(Project).delete()
        self.db.query(Skill).delete()
        self.db.query(Education).delete()
        self.db.query(Job).delete()
        self.db.query(MentorProfile).delete()
        self.db.query(RecruiterProfile).delete()
        self.db.query(StudentProfile).delete()
        self.db.query(User).filter(User.email.like("%@finaltest.com")).delete()
        self.db.commit()

        # 1. Seed Student
        self.student_user = User(
            full_name="Final Student",
            email="student@finaltest.com",
            password_hash=hash_password("password123"),
            role="student",
            is_active=True
        )
        self.db.add(self.student_user)
        self.db.commit()
        self.db.refresh(self.student_user)

        self.student_profile = StudentProfile(
            user_id=self.student_user.id,
            college="DY Patil Institute",
            degree="B.Tech",
            branch="Computer Engineering",
            graduation_year=2026,
            cgpa=9.3,
            bio="Final integration candidate"
        )
        self.db.add(self.student_profile)
        self.db.commit()

        sk_py = Skill(name="Python")
        sk_sql = Skill(name="SQL")
        sk_react = Skill(name="React")
        self.db.add_all([sk_py, sk_sql, sk_react])
        self.db.commit()
        self.student_profile.skills.extend([sk_py, sk_sql, sk_react])
        self.db.commit()

        # 2. Seed Recruiter & Job
        self.recruiter_user = User(
            full_name="Final Recruiter",
            email="recruiter@finaltest.com",
            password_hash=hash_password("password123"),
            role="recruiter",
            is_active=True
        )
        self.db.add(self.recruiter_user)
        self.db.commit()

        self.job = Job(
            recruiter_id=self.recruiter_user.id,
            company_name="Final Tech Ltd",
            title="Senior Python Engineer",
            description="Looking for Python, SQL, REST API, Docker developer.",
            skills_required="Python, SQL, REST API, Docker",
            experience_required="0-2 Years",
            status="active"
        )
        self.db.add(self.job)
        self.db.commit()
        self.db.refresh(self.job)

        # 3. Seed Mentor
        self.mentor_user = User(
            full_name="Final Mentor",
            email="mentor@finaltest.com",
            password_hash=hash_password("password123"),
            role="mentor",
            is_active=True
        )
        self.db.add(self.mentor_user)
        self.db.commit()

        # 4. Seed Admin
        self.admin_user = User(
            full_name="Final Admin",
            email="admin@finaltest.com",
            password_hash=hash_password("password123"),
            role="admin",
            is_active=True
        )
        self.db.add(self.admin_user)
        self.db.commit()

        # Tokens
        self.student_token = create_access_token({"sub": str(self.student_user.id), "role": "student"})
        self.recruiter_token = create_access_token({"sub": str(self.recruiter_user.id), "role": "recruiter"})
        self.mentor_token = create_access_token({"sub": str(self.mentor_user.id), "role": "mentor"})
        self.admin_token = create_access_token({"sub": str(self.admin_user.id), "role": "admin"})

        self.student_headers = {"Authorization": f"Bearer {self.student_token}"}
        self.recruiter_headers = {"Authorization": f"Bearer {self.recruiter_token}"}
        self.mentor_headers = {"Authorization": f"Bearer {self.mentor_token}"}
        self.admin_headers = {"Authorization": f"Bearer {self.admin_token}"}

    def tearDown(self):
        self.db.close()

    def test_01_health_endpoints(self):
        h1 = self.client.get("/health")
        self.assertEqual(h1.status_code, 200)

        h2 = self.client.get("/health/db")
        self.assertIn(h2.status_code, [200, 503])

        h3 = self.client.get("/ai/health")
        self.assertEqual(h3.status_code, 200)

    def test_02_authentication_flow(self):
        login_res = self.client.post("/auth/login", json={"email": "student@finaltest.com", "password": "password123"})
        self.assertEqual(login_res.status_code, 200)
        token = login_res.json()["access_token"]

        me_res = self.client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["email"], "student@finaltest.com")

    def test_03_student_module_flow(self):
        p_res = self.client.get("/student/profile", headers=self.student_headers)
        self.assertEqual(p_res.status_code, 200)

        sk_res = self.client.get("/student/skills", headers=self.student_headers)
        self.assertEqual(sk_res.status_code, 200)

        r_res = self.client.get("/student/resumes", headers=self.student_headers)
        self.assertEqual(r_res.status_code, 200)

    def test_04_placement_workflow_and_match(self):
        # Job Browse
        j_res = self.client.get("/student/jobs", headers=self.student_headers)
        self.assertEqual(j_res.status_code, 200)

        # Match Score (Step 11)
        m_res = self.client.get(f"/student/jobs/{self.job.id}/match", headers=self.student_headers)
        self.assertEqual(m_res.status_code, 200)
        self.assertGreater(m_res.json()["match_score"], 0)

        # Apply for Job
        app_res = self.client.post(f"/student/jobs/{self.job.id}/apply", headers=self.student_headers)
        self.assertEqual(app_res.status_code, 200)

        # Check applications
        my_apps = self.client.get("/student/applications", headers=self.student_headers)
        self.assertEqual(my_apps.status_code, 200)
        self.assertEqual(len(my_apps.json()), 1)

    def test_05_skill_gap_and_recommendations(self):
        rec_res = self.client.get("/student/recommendations", headers=self.student_headers)
        self.assertEqual(rec_res.status_code, 200)

        gap_res = self.client.get(f"/student/jobs/{self.job.id}/skill-gap", headers=self.student_headers)
        self.assertEqual(gap_res.status_code, 200)
        self.assertIn("docker", [s.lower() for s in gap_res.json()["missing_skills"]])

    def test_06_semantic_search(self):
        s_res = self.client.get("/student/jobs/semantic-search?q=Python", headers=self.student_headers)
        self.assertEqual(s_res.status_code, 200)

    @patch("rag.ollama_client.OllamaClient.generate")
    def test_07_rag_ai_assistant(self, mock_generate):
        mock_generate.return_value = {
            "success": True,
            "response": "Your Python and SQL skills fit the Senior Python Engineer posting well.",
            "ai_available": True
        }
        chat_res = self.client.post("/student/ai/chat", headers=self.student_headers, json={"question": "What backend job fits me?"})
        self.assertEqual(chat_res.status_code, 200)
        self.assertTrue(chat_res.json()["grounded"])

    def test_08_recruiter_and_candidate_match(self):
        j_res = self.client.get("/recruiter/jobs", headers=self.recruiter_headers)
        self.assertEqual(j_res.status_code, 200)

        c_res = self.client.get(f"/recruiter/jobs/{self.job.id}/candidate-matches", headers=self.recruiter_headers)
        self.assertEqual(c_res.status_code, 200)
        self.assertGreaterEqual(c_res.json()["total"], 1)

    def test_09_mentor_workflow(self):
        m_res = self.client.get("/mentor/profile", headers=self.mentor_headers)
        self.assertEqual(m_res.status_code, 200)

    def test_10_admin_workflow(self):
        dash_res = self.client.get("/admin/dashboard", headers=self.admin_headers)
        self.assertEqual(dash_res.status_code, 200)

        u_res = self.client.get("/admin/users", headers=self.admin_headers)
        self.assertEqual(u_res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
