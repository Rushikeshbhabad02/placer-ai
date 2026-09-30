import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from database import engine as default_engine, SessionLocal as DefaultSessionLocal, check_database_connection
from models import Base
from models.user import User
from models.student_profile import StudentProfile
from models.education import Education
from models.skill import Skill, student_skills
from models.project import Project
from models.resume import Resume
from auth.security import hash_password, verify_password, create_access_token, decode_access_token
from auth.dependencies import get_current_user, require_role
from auth.routes import register, login, get_me
from student.routes import (
    get_student_profile,
    update_student_profile,
    get_student_education,
    create_student_education,
    update_student_education,
    delete_student_education,
    get_student_skills,
    add_student_skill,
    remove_student_skill,
    get_student_projects,
    create_student_project,
    update_student_project,
    delete_student_project,
    get_student_resumes,
    create_student_resume,
    delete_student_resume,
    get_student_dashboard_stats
)
from schemas.auth import UserRegister, UserLogin
from schemas.student import (
    StudentProfileUpdate,
    EducationCreate,
    EducationUpdate,
    SkillCreate,
    ProjectCreate,
    ProjectUpdate,
    ResumeCreate
)

# Test database setup
db_status = check_database_connection()
if db_status.get("database") == "connected" and default_engine:
    test_engine = default_engine
    TestSessionLocal = DefaultSessionLocal
else:
    test_engine = create_engine("sqlite:///./test_placer_ai.db", connect_args={"check_same_thread": False})
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)


class TestStudentModule(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Setup test database records for Student A, Student B, Recruiter, and Mentor."""
        cls.db = TestSessionLocal()

        # Clean old test users
        for email in ["student_test_a@example.com", "student_test_b@example.com", "recruiter_test@example.com", "mentor_test@example.com"]:
            u = cls.db.query(User).filter(User.email == email).first()
            if u:
                cls.db.delete(u)
        cls.db.commit()

        # Register Student A
        cls.user_a = register(
            UserRegister(
                full_name="Student Test A",
                email="student_test_a@example.com",
                password="Password123!",
                role="student"
            ),
            cls.db
        )

        # Register Student B
        cls.user_b = register(
            UserRegister(
                full_name="Student Test B",
                email="student_test_b@example.com",
                password="Password123!",
                role="student"
            ),
            cls.db
        )

        # Register Recruiter
        cls.user_r = register(
            UserRegister(
                full_name="Recruiter Test",
                email="recruiter_test@example.com",
                password="Password123!",
                role="recruiter"
            ),
            cls.db
        )

        # Register Mentor
        cls.user_m = register(
            UserRegister(
                full_name="Mentor Test",
                email="mentor_test@example.com",
                password="Password123!",
                role="mentor"
            ),
            cls.db
        )

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_login_and_jwt(self):
        """Test authentication login and JWT issuance."""
        token_resp = login(UserLogin(email="student_test_a@example.com", password="Password123!"), self.db)
        self.assertIsNotNone(token_resp.access_token)
        self.assertEqual(token_resp.token_type, "bearer")
        self.assertEqual(token_resp.user.email, "student_test_a@example.com")

        # Decode token
        payload = decode_access_token(token_resp.access_token)
        self.assertEqual(payload["sub"], str(self.user_a.id))
        self.assertEqual(payload["role"], "student")

    def test_02_get_and_update_student_profile(self):
        """Test GET /student/profile and PUT /student/profile."""
        prof = get_student_profile(current_user=self.user_a, db=self.db)
        self.assertEqual(prof.email, "student_test_a@example.com")

        update_in = StudentProfileUpdate(
            college="Sanghvi College of Engineering",
            degree="B.E.",
            branch="Computer Engineering",
            graduation_year=2026,
            cgpa=8.8,
            location="Pune",
            bio="Software Developer Aspirant",
            github_url="https://github.com/student_a"
        )
        updated_prof = update_student_profile(profile_in=update_in, current_user=self.user_a, db=self.db)
        self.assertEqual(updated_prof.college, "Sanghvi College of Engineering")
        self.assertEqual(updated_prof.cgpa, 8.8)
        self.assertEqual(updated_prof.github_url, "https://github.com/student_a")

        # Re-fetch profile to verify persistence
        refreshed = get_student_profile(current_user=self.user_a, db=self.db)
        self.assertEqual(refreshed.cgpa, 8.8)
        self.assertEqual(refreshed.location, "Pune")

    def test_03_education_crud(self):
        """Test Education POST, GET, PUT, DELETE."""
        # Create
        edu_in = EducationCreate(
            institution="Sanghvi College of Engineering",
            degree="B.E.",
            field_of_study="Computer Engineering",
            start_year=2022,
            end_year=2026,
            cgpa=8.8
        )
        created_edu = create_student_education(edu_in=edu_in, current_user=self.user_a, db=self.db)
        self.assertIsNotNone(created_edu.id)
        self.assertEqual(created_edu.institution, "Sanghvi College of Engineering")

        # Read list
        edus = get_student_education(current_user=self.user_a, db=self.db)
        self.assertTrue(any(e.id == created_edu.id for e in edus))

        # Update
        update_in = EducationUpdate(degree="B.Tech Honours")
        updated_edu = update_student_education(education_id=created_edu.id, edu_in=update_in, current_user=self.user_a, db=self.db)
        self.assertEqual(updated_edu.degree, "B.Tech Honours")

        # Delete
        delete_student_education(education_id=created_edu.id, current_user=self.user_a, db=self.db)
        edus_after = get_student_education(current_user=self.user_a, db=self.db)
        self.assertFalse(any(e.id == created_edu.id for e in edus_after))

    def test_04_skills_crud_and_global_deduplication(self):
        """Test Skills POST, GET, DELETE and shared global skill retention."""
        # Student A adds Python
        skill_a = add_student_skill(SkillCreate(name="Python", category="Language"), current_user=self.user_a, db=self.db)
        self.assertIsNotNone(skill_a.id)

        # Student B adds Python (case-insensitive deduplication check)
        skill_b = add_student_skill(SkillCreate(name="python", category="Programming"), current_user=self.user_b, db=self.db)
        self.assertEqual(skill_a.id, skill_b.id)

        # Verify Student A skills
        skills_a = get_student_skills(current_user=self.user_a, db=self.db)
        self.assertTrue(any(s.id == skill_a.id for s in skills_a))

        # Remove skill association for Student A
        remove_student_skill(skill_id=skill_a.id, current_user=self.user_a, db=self.db)
        skills_a_after = get_student_skills(current_user=self.user_a, db=self.db)
        self.assertFalse(any(s.id == skill_a.id for s in skills_a_after))

        # Verify global skill record still exists for Student B!
        skills_b = get_student_skills(current_user=self.user_b, db=self.db)
        self.assertTrue(any(s.id == skill_b.id for s in skills_b))

        # Clean up Student B skill
        remove_student_skill(skill_id=skill_b.id, current_user=self.user_b, db=self.db)

    def test_05_projects_crud(self):
        """Test Projects POST, GET, PUT, DELETE."""
        proj_in = ProjectCreate(
            title="PLACER-AI System",
            description="AI Placement Platform",
            technologies="FastAPI, React, PostgreSQL",
            github_url="https://github.com/placer-ai"
        )
        created_proj = create_student_project(project_in=proj_in, current_user=self.user_a, db=self.db)
        self.assertIsNotNone(created_proj.id)

        projs = get_student_projects(current_user=self.user_a, db=self.db)
        self.assertTrue(any(p.id == created_proj.id for p in projs))

        updated_proj = update_student_project(project_id=created_proj.id, project_in=ProjectUpdate(title="PLACER-AI Enterprise"), current_user=self.user_a, db=self.db)
        self.assertEqual(updated_proj.title, "PLACER-AI Enterprise")

        delete_student_project(project_id=created_proj.id, current_user=self.user_a, db=self.db)
        projs_after = get_student_projects(current_user=self.user_a, db=self.db)
        self.assertFalse(any(p.id == created_proj.id for p in projs_after))

    def test_06_resume_metadata(self):
        """Test Resume metadata POST, GET, DELETE."""
        resume_in = ResumeCreate(
            file_name="student_a_resume.pdf",
            file_path="/uploads/student_a_resume.pdf",
            file_type="application/pdf",
            file_size=102400
        )
        created_resume = create_student_resume(resume_in=resume_in, current_user=self.user_a, db=self.db)
        self.assertIsNotNone(created_resume.id)

        resumes = get_student_resumes(current_user=self.user_a, db=self.db)
        self.assertTrue(any(r.id == created_resume.id for r in resumes))

        delete_student_resume(resume_id=created_resume.id, current_user=self.user_a, db=self.db)
        resumes_after = get_student_resumes(current_user=self.user_a, db=self.db)
        self.assertFalse(any(r.id == created_resume.id for r in resumes_after))

    def test_07_dashboard_stats(self):
        """Test Student Dashboard database statistics."""
        stats = get_student_dashboard_stats(current_user=self.user_a, db=self.db)
        self.assertIsNotNone(stats.profile_completion)
        self.assertIsInstance(stats.education_count, int)
        self.assertIsInstance(stats.skills_count, int)
        self.assertIsInstance(stats.projects_count, int)
        self.assertIsInstance(stats.resumes_count, int)

    def test_08_role_authorization_and_ownership_isolation(self):
        """Test Role Enforcement (403 for non-student roles) and Data Ownership Isolation."""
        # 1. Role enforcement check: Recruiter role raises 403
        recruiter_checker = require_role(["student"])
        with self.assertRaises(HTTPException) as cm_r:
            recruiter_checker(current_user=self.user_r)
        self.assertEqual(cm_r.exception.status_code, 403)

        # 2. Role enforcement check: Mentor role raises 403
        with self.assertRaises(HTTPException) as cm_m:
            recruiter_checker(current_user=self.user_m)
        self.assertEqual(cm_m.exception.status_code, 403)

        # 3. Ownership Isolation check: Student B creates an education record
        edu_b = create_student_education(
            edu_in=EducationCreate(institution="Student B Private College"),
            current_user=self.user_b,
            db=self.db
        )

        # Student A attempts to update Student B's education record -> raises 403
        with self.assertRaises(HTTPException) as cm_update:
            update_student_education(
                education_id=edu_b.id,
                edu_in=EducationUpdate(institution="Hacked College"),
                current_user=self.user_a,
                db=self.db
            )
        self.assertEqual(cm_update.exception.status_code, 403)

        # Student A attempts to delete Student B's education record -> raises 403
        with self.assertRaises(HTTPException) as cm_delete:
            delete_student_education(
                education_id=edu_b.id,
                current_user=self.user_a,
                db=self.db
            )
        self.assertEqual(cm_delete.exception.status_code, 403)

        # Clean up Student B education record
        delete_student_education(education_id=edu_b.id, current_user=self.user_b, db=self.db)


if __name__ == "__main__":
    unittest.main()
