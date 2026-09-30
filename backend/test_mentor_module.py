import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from database import engine as default_engine, SessionLocal as DefaultSessionLocal, check_database_connection
from models import Base
from models.user import User
from models.student_profile import StudentProfile
from models.mentor_profile import MentorProfile
from models.mentor_approval import MentorApproval
from auth.security import create_access_token
from auth.dependencies import require_role
from auth.routes import register
from mentor.routes import (
    get_mentor_profile,
    update_mentor_profile,
    get_mentor_dashboard_stats,
    get_mentor_approvals,
    get_mentor_approval_by_id,
    approve_student_request,
    reject_student_request,
)
from schemas.auth import UserRegister
from schemas.mentor import MentorProfileUpdate, MentorApprovalAction

# Test DB Setup
db_status = check_database_connection()
if db_status.get("database") == "connected" and default_engine:
    test_engine = default_engine
    TestSessionLocal = DefaultSessionLocal
else:
    test_engine = create_engine("sqlite:///./test_placer_ai.db", connect_args={"check_same_thread": False})
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)


class TestMentorModule(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Prepare database test accounts for Mentor A, Mentor B, Student, and Recruiter."""
        cls.db = TestSessionLocal()

        # Clean old test users & approvals
        emails = [
            "mentor_test_a@example.com",
            "mentor_test_b@example.com",
            "student_mentor_test@example.com",
            "recruiter_mentor_test@example.com"
        ]
        for email in emails:
            u = cls.db.query(User).filter(User.email == email).first()
            if u:
                cls.db.query(MentorApproval).filter(
                    (MentorApproval.mentor_id == u.id) | (MentorApproval.student_id == u.id)
                ).delete(synchronize_session=False)
                cls.db.delete(u)
        cls.db.commit()

        # Register Mentor A
        cls.user_m_a = register(
            UserRegister(
                full_name="Mentor Test A",
                email="mentor_test_a@example.com",
                password="Password123!",
                role="mentor"
            ),
            cls.db
        )

        # Register Mentor B
        cls.user_m_b = register(
            UserRegister(
                full_name="Mentor Test B",
                email="mentor_test_b@example.com",
                password="Password123!",
                role="mentor"
            ),
            cls.db
        )

        # Register Student
        cls.user_s = register(
            UserRegister(
                full_name="Student Test User",
                email="student_mentor_test@example.com",
                password="Password123!",
                role="student"
            ),
            cls.db
        )

        # Get or create StudentProfile for student
        cls.student_profile = cls.db.query(StudentProfile).filter(StudentProfile.user_id == cls.user_s.id).first()
        if not cls.student_profile:
            cls.student_profile = StudentProfile(
                user_id=cls.user_s.id,
                college="Test Institute of Tech",
                degree="B.Tech",
                branch="Computer Science",
                cgpa=8.8
            )
            cls.db.add(cls.student_profile)
            cls.db.commit()
            cls.db.refresh(cls.student_profile)

        # Register Recruiter
        cls.user_r = register(
            UserRegister(
                full_name="Recruiter Test User",
                email="recruiter_mentor_test@example.com",
                password="Password123!",
                role="recruiter"
            ),
            cls.db
        )

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_mentor_profile_get_and_update(self):
        """Test getting and updating mentor profile."""
        profile = get_mentor_profile(current_user=self.user_m_a, db=self.db)
        self.assertEqual(profile.email, "mentor_test_a@example.com")
        self.assertEqual(profile.full_name, "Mentor Test A")

        # Update profile
        update_data = MentorProfileUpdate(
            designation="Senior Software Engineer",
            expertise="AI / Machine Learning",
            company="Tech Corp",
            experience="8 years",
            location="Bangalore",
            bio="Passionate mentor."
        )
        updated = update_mentor_profile(profile_in=update_data, current_user=self.user_m_a, db=self.db)
        self.assertEqual(updated.designation, "Senior Software Engineer")
        self.assertEqual(updated.expertise, "AI / Machine Learning")
        self.assertEqual(updated.company, "Tech Corp")

    def test_02_mentor_dashboard_stats(self):
        """Test mentor dashboard statistics calculation."""
        stats = get_mentor_dashboard_stats(current_user=self.user_m_a, db=self.db)
        self.assertIsNotNone(stats.total_assigned_students)
        self.assertIsNotNone(stats.pending_reviews)
        self.assertIsNotNone(stats.approved_students)
        self.assertIsNotNone(stats.rejected_requests)

    def test_03_mentor_approvals_workflow(self):
        """Test approval lifecycle: create, list, approve, reject."""
        # Create approval record for Mentor A
        app_a = MentorApproval(
            mentor_id=self.user_m_a.id,
            student_id=self.student_profile.id,
            status="pending",
            comments="Needs review"
        )
        # Create approval record for Mentor B
        app_b = MentorApproval(
            mentor_id=self.user_m_b.id,
            student_id=self.student_profile.id,
            status="pending",
            comments="Needs review B"
        )
        self.db.add_all([app_a, app_b])
        self.db.commit()
        self.db.refresh(app_a)
        self.db.refresh(app_b)

        # Mentor A lists approvals - should only see app_a
        approvals_a = get_mentor_approvals(current_user=self.user_m_a, db=self.db)
        a_ids = [a.id for a in approvals_a]
        self.assertIn(app_a.id, a_ids)
        self.assertNotIn(app_b.id, a_ids)

        # Safe student response check - ensure no password or hash exposed
        first_approval = approvals_a[0]
        if first_approval.student:
            self.assertFalse(hasattr(first_approval.student, "password"))
            self.assertFalse(hasattr(first_approval.student, "hashed_password"))
            self.assertEqual(first_approval.student.full_name, "Student Test User")

        # Get approval by ID for Mentor A
        fetched_a = get_mentor_approval_by_id(approval_id=app_a.id, current_user=self.user_m_a, db=self.db)
        self.assertEqual(fetched_a.id, app_a.id)

        # Mentor A approves app_a
        action = MentorApprovalAction(comments="Approved for mentorship.")
        approved_res = approve_student_request(approval_id=app_a.id, action=action, current_user=self.user_m_a, db=self.db)
        self.assertEqual(approved_res.status, "approved")

        # Mentor B rejects app_b
        rejected_res = reject_student_request(approval_id=app_b.id, action=action, current_user=self.user_m_b, db=self.db)
        self.assertEqual(rejected_res.status, "rejected")

    def test_04_mentor_ownership_isolation(self):
        """Test that Mentor A cannot view/approve/reject Mentor B's approval requests."""
        # Create approval record for Mentor B
        app_b = MentorApproval(
            mentor_id=self.user_m_b.id,
            student_id=self.student_profile.id,
            status="pending"
        )
        self.db.add(app_b)
        self.db.commit()
        self.db.refresh(app_b)

        # Mentor A trying to GET Mentor B's approval -> 403 Forbidden
        with self.assertRaises(HTTPException) as cm:
            get_mentor_approval_by_id(approval_id=app_b.id, current_user=self.user_m_a, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)

        # Mentor A trying to APPROVE Mentor B's approval -> 403 Forbidden
        with self.assertRaises(HTTPException) as cm:
            approve_student_request(approval_id=app_b.id, current_user=self.user_m_a, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)

        # Mentor A trying to REJECT Mentor B's approval -> 403 Forbidden
        with self.assertRaises(HTTPException) as cm:
            reject_student_request(approval_id=app_b.id, current_user=self.user_m_a, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)

    def test_05_role_authorization_dependency(self):
        """Test require_role dependency enforcement for mentor role."""
        role_checker = require_role(["mentor"])

        # Mentor user allowed
        verified_mentor = role_checker(current_user=self.user_m_a)
        self.assertEqual(verified_mentor.id, self.user_m_a.id)

        # Student user forbidden -> 403
        with self.assertRaises(HTTPException) as cm:
            role_checker(current_user=self.user_s)
        self.assertEqual(cm.exception.status_code, 403)

        # Recruiter user forbidden -> 403
        with self.assertRaises(HTTPException) as cm:
            role_checker(current_user=self.user_r)
        self.assertEqual(cm.exception.status_code, 403)


if __name__ == "__main__":
    unittest.main()
