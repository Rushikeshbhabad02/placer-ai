import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from database import engine as default_engine, SessionLocal as DefaultSessionLocal, check_database_connection
from models import Base
from models.user import User
from models.student_profile import StudentProfile
from models.recruiter_profile import RecruiterProfile
from models.job import Job
from auth.security import hash_password, create_access_token, decode_access_token
from auth.dependencies import require_role
from auth.routes import register, login
from student.routes import get_student_profile
from recruiter.routes import (
    get_recruiter_profile,
    update_recruiter_profile,
    get_recruiter_jobs,
    create_recruiter_job,
    get_recruiter_job_by_id,
    update_recruiter_job,
    delete_recruiter_job,
    get_recruiter_dashboard_stats
)
from schemas.auth import UserRegister, UserLogin
from schemas.recruiter import (
    RecruiterProfileUpdate,
    JobCreate,
    JobUpdate
)

# Test DB Setup
db_status = check_database_connection()
if db_status.get("database") == "connected" and default_engine:
    test_engine = default_engine
    TestSessionLocal = DefaultSessionLocal
else:
    test_engine = create_engine("sqlite:///./test_placer_ai.db", connect_args={"check_same_thread": False})
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)


class TestRecruiterModule(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Prepare database test accounts for Recruiter A, Recruiter B, Student, and Mentor."""
        cls.db = TestSessionLocal()

        # Clean old test users
        emails = ["recruiter_test_a@example.com", "recruiter_test_b@example.com", "student_rec_test@example.com", "mentor_rec_test@example.com"]
        for email in emails:
            u = cls.db.query(User).filter(User.email == email).first()
            if u:
                cls.db.delete(u)
        cls.db.commit()

        # Register Recruiter A
        cls.user_r_a = register(
            UserRegister(
                full_name="Recruiter Test A",
                email="recruiter_test_a@example.com",
                password="Password123!",
                role="recruiter"
            ),
            cls.db
        )

        # Register Recruiter B
        cls.user_r_b = register(
            UserRegister(
                full_name="Recruiter Test B",
                email="recruiter_test_b@example.com",
                password="Password123!",
                role="recruiter"
            ),
            cls.db
        )

        # Register Student
        cls.user_s = register(
            UserRegister(
                full_name="Student Test User",
                email="student_rec_test@example.com",
                password="Password123!",
                role="student"
            ),
            cls.db
        )

        # Register Mentor
        cls.user_m = register(
            UserRegister(
                full_name="Mentor Test User",
                email="mentor_rec_test@example.com",
                password="Password123!",
                role="mentor"
            ),
            cls.db
        )

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_recruiter_login_and_jwt(self):
        """Test recruiter authentication login and signed JWT token generation."""
        login_res = login(UserLogin(email="recruiter_test_a@example.com", password="Password123!"), self.db)
        self.assertIsNotNone(login_res.access_token)
        self.assertEqual(login_res.user.role, "recruiter")

        payload = decode_access_token(login_res.access_token)
        self.assertEqual(payload["sub"], str(self.user_r_a.id))
        self.assertEqual(payload["role"], "recruiter")

    def test_02_recruiter_profile_get_and_update(self):
        """Test GET /recruiter/profile and PUT /recruiter/profile."""
        prof = get_recruiter_profile(current_user=self.user_r_a, db=self.db)
        self.assertEqual(prof.email, "recruiter_test_a@example.com")

        update_in = RecruiterProfileUpdate(
            full_name="Recruiter A Updated",
            phone="+91 99999 88888",
            company_name="Acme Global Inc",
            designation="Lead Talent Scout",
            company_website="https://acmeglobal.com",
            company_industry="Information Technology",
            company_size="501-1000 Employees",
            company_description="Global tech solutions",
            location="Bengaluru"
        )
        updated_prof = update_recruiter_profile(profile_in=update_in, current_user=self.user_r_a, db=self.db)
        self.assertEqual(updated_prof.full_name, "Recruiter A Updated")
        self.assertEqual(updated_prof.company_name, "Acme Global Inc")
        self.assertEqual(updated_prof.location, "Bengaluru")

        # Re-fetch profile to verify database persistence
        refreshed = get_recruiter_profile(current_user=self.user_r_a, db=self.db)
        self.assertEqual(refreshed.company_name, "Acme Global Inc")
        self.assertEqual(refreshed.phone, "+91 99999 88888")

    def test_03_job_crud_operations(self):
        """Test Recruiter Job POST, GET list, GET by ID, PUT, DELETE."""
        # 1. POST Job
        job_in = JobCreate(
            title="Senior Frontend Engineer",
            company_name="Acme Global Inc",
            description="Leading React application development",
            location="Bengaluru, India",
            job_type="Full-time",
            experience_required="2-4 Years",
            salary_min=12.0,
            salary_max=18.0,
            skills_required="React, TypeScript, Redux, CSS",
            status="active"
        )
        created_job = create_recruiter_job(job_in=job_in, current_user=self.user_r_a, db=self.db)
        self.assertIsNotNone(created_job.id)
        self.assertEqual(created_job.recruiter_id, self.user_r_a.id)
        self.assertEqual(created_job.title, "Senior Frontend Engineer")

        # 2. GET Jobs List
        jobs_list = get_recruiter_jobs(current_user=self.user_r_a, db=self.db)
        self.assertTrue(any(j.id == created_job.id for j in jobs_list))

        # 3. GET Job by ID
        job_detail = get_recruiter_job_by_id(job_id=created_job.id, current_user=self.user_r_a, db=self.db)
        self.assertEqual(job_detail.id, created_job.id)
        self.assertEqual(job_detail.title, "Senior Frontend Engineer")

        # 4. PUT Job (Update)
        job_update = JobUpdate(title="Staff Frontend Engineer", salary_max=22.0)
        updated_job = update_recruiter_job(job_id=created_job.id, job_in=job_update, current_user=self.user_r_a, db=self.db)
        self.assertEqual(updated_job.title, "Staff Frontend Engineer")
        self.assertEqual(updated_job.salary_max, 22.0)

        # 5. DELETE Job
        delete_recruiter_job(job_id=created_job.id, current_user=self.user_r_a, db=self.db)
        jobs_after = get_recruiter_jobs(current_user=self.user_r_a, db=self.db)
        self.assertFalse(any(j.id == created_job.id for j in jobs_after))

    def test_04_recruiter_dashboard_stats(self):
        """Test GET /recruiter/dashboard statistics."""
        # Create 2 jobs (1 active, 1 closed)
        j1 = create_recruiter_job(JobCreate(title="Active Job", status="active"), current_user=self.user_r_a, db=self.db)
        j2 = create_recruiter_job(JobCreate(title="Closed Job", status="closed"), current_user=self.user_r_a, db=self.db)

        stats = get_recruiter_dashboard_stats(current_user=self.user_r_a, db=self.db)
        self.assertGreaterEqual(stats.total_jobs, 2)
        self.assertGreaterEqual(stats.active_jobs, 1)
        self.assertGreaterEqual(stats.closed_jobs, 1)

        # Cleanup
        delete_recruiter_job(job_id=j1.id, current_user=self.user_r_a, db=self.db)
        delete_recruiter_job(job_id=j2.id, current_user=self.user_r_a, db=self.db)

    def test_05_role_authorization_and_ownership_isolation(self):
        """Test Role Enforcement (403 for Student/Mentor) and Ownership Isolation between Recruiters."""
        # 1. Role enforcement: Student role raises 403 on recruiter endpoint
        recruiter_checker = require_role(["recruiter"])
        with self.assertRaises(HTTPException) as cm_s:
            recruiter_checker(current_user=self.user_s)
        self.assertEqual(cm_s.exception.status_code, 403)

        # 2. Role enforcement: Mentor role raises 403 on recruiter endpoint
        with self.assertRaises(HTTPException) as cm_m:
            recruiter_checker(current_user=self.user_m)
        self.assertEqual(cm_m.exception.status_code, 403)

        # 3. Ownership Isolation: Recruiter B posts a job
        job_b = create_recruiter_job(JobCreate(title="Recruiter B Confidential Job"), current_user=self.user_r_b, db=self.db)

        # Recruiter A attempts to GET Recruiter B's job -> 403 Forbidden
        with self.assertRaises(HTTPException) as cm_get:
            get_recruiter_job_by_id(job_id=job_b.id, current_user=self.user_r_a, db=self.db)
        self.assertEqual(cm_get.exception.status_code, 403)

        # Recruiter A attempts to UPDATE Recruiter B's job -> 403 Forbidden
        with self.assertRaises(HTTPException) as cm_put:
            update_recruiter_job(job_id=job_b.id, job_in=JobUpdate(title="Hacked Job"), current_user=self.user_r_a, db=self.db)
        self.assertEqual(cm_put.exception.status_code, 403)

        # Recruiter A attempts to DELETE Recruiter B's job -> 403 Forbidden
        with self.assertRaises(HTTPException) as cm_del:
            delete_recruiter_job(job_id=job_b.id, current_user=self.user_r_a, db=self.db)
        self.assertEqual(cm_del.exception.status_code, 403)

        # Cleanup Recruiter B job
        delete_recruiter_job(job_id=job_b.id, current_user=self.user_r_b, db=self.db)

    def test_06_student_regression_check(self):
        """Verify Student module profile API is completely unaffected."""
        student_prof = get_student_profile(current_user=self.user_s, db=self.db)
        self.assertEqual(student_prof.email, "student_rec_test@example.com")


if __name__ == "__main__":
    unittest.main()
