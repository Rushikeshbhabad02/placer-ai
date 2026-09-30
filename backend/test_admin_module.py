import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from database import engine as default_engine, SessionLocal as DefaultSessionLocal, check_database_connection
from models import Base
from models.user import User
from models.student_profile import StudentProfile
from models.recruiter_profile import RecruiterProfile
from models.mentor_profile import MentorProfile
from auth.security import hash_password
from auth.dependencies import require_role
from auth.routes import register
from admin.routes import (
    get_admin_profile,
    update_admin_profile,
    get_admin_dashboard_stats,
    get_all_users,
    get_user_by_id,
    update_user_status,
    get_all_students,
    get_student_by_id,
    get_all_recruiters,
    get_recruiter_by_id,
    get_all_mentors,
    get_mentor_by_id,
)
from schemas.auth import UserRegister
from schemas.admin import AdminProfileUpdate, UserStatusUpdate

# Test DB Setup
db_status = check_database_connection()
if db_status.get("database") == "connected" and default_engine:
    test_engine = default_engine
    TestSessionLocal = DefaultSessionLocal
else:
    test_engine = create_engine("sqlite:///./test_placer_ai.db", connect_args={"check_same_thread": False})
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)


class TestAdminModule(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Prepare database test accounts for Admin, Student, Recruiter, and Mentor."""
        cls.db = TestSessionLocal()

        # Clean old test users
        emails = [
            "admin_test_unit@example.com",
            "student_admin_test@example.com",
            "recruiter_admin_test@example.com",
            "mentor_admin_test@example.com"
        ]
        for email in emails:
            u = cls.db.query(User).filter(User.email == email).first()
            if u:
                cls.db.delete(u)
        cls.db.commit()

        # Create Admin user directly in DB (public registration for admin is restricted)
        cls.user_admin = User(
            full_name="Admin Test Director",
            email="admin_test_unit@example.com",
            password_hash=hash_password("Password123!"),
            role="admin",
            is_active=True
        )
        cls.db.add(cls.user_admin)
        cls.db.commit()
        cls.db.refresh(cls.user_admin)

        # Register Student
        cls.user_student = register(
            UserRegister(
                full_name="Student Admin Test",
                email="student_admin_test@example.com",
                password="Password123!",
                role="student"
            ),
            cls.db
        )

        # Register Recruiter
        cls.user_recruiter = register(
            UserRegister(
                full_name="Recruiter Admin Test",
                email="recruiter_admin_test@example.com",
                password="Password123!",
                role="recruiter"
            ),
            cls.db
        )

        # Register Mentor
        cls.user_mentor = register(
            UserRegister(
                full_name="Mentor Admin Test",
                email="mentor_admin_test@example.com",
                password="Password123!",
                role="mentor"
            ),
            cls.db
        )

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_admin_profile_get_and_update(self):
        """Test GET and PUT /admin/profile."""
        profile = get_admin_profile(current_user=self.user_admin, db=self.db)
        self.assertEqual(profile.email, "admin_test_unit@example.com")
        self.assertEqual(profile.role, "admin")

        # Update profile
        update_data = AdminProfileUpdate(full_name="Director of Placements", phone="9988776655")
        updated = update_admin_profile(profile_in=update_data, current_user=self.user_admin, db=self.db)
        self.assertEqual(updated.full_name, "Director of Placements")
        self.assertEqual(updated.phone, "9988776655")

    def test_02_admin_dashboard_stats(self):
        """Test GET /admin/dashboard returns valid counts."""
        stats = get_admin_dashboard_stats(current_user=self.user_admin, db=self.db)
        self.assertGreaterEqual(stats.total_users, 4)
        self.assertGreaterEqual(stats.total_students, 1)
        self.assertGreaterEqual(stats.total_recruiters, 1)
        self.assertGreaterEqual(stats.total_mentors, 1)
        self.assertGreaterEqual(stats.total_admins, 1)

    def test_03_user_list_filtering_and_search(self):
        """Test GET /admin/users with role, search, and is_active filters."""
        # Search by role = student
        students = get_all_users(role="student", current_user=self.user_admin, db=self.db)
        self.assertTrue(all(u.role == "student" for u in students))

        # Search by query "Director"
        search_res = get_all_users(search="Director", current_user=self.user_admin, db=self.db)
        self.assertTrue(any("Director" in u.full_name for u in search_res))

        # Get specific user by ID
        single_user = get_user_by_id(user_id=self.user_student.id, current_user=self.user_admin, db=self.db)
        self.assertEqual(single_user.id, self.user_student.id)

    def test_04_user_deactivation_and_reactivation(self):
        """Test activating/deactivating a user account while preserving records."""
        # Deactivate student account
        deactive_req = UserStatusUpdate(is_active=False)
        updated_res = update_user_status(user_id=self.user_student.id, status_in=deactive_req, current_user=self.user_admin, db=self.db)
        self.assertFalse(updated_res.is_active)

        # Verify DB persistence
        db_user = self.db.query(User).filter(User.id == self.user_student.id).first()
        self.assertFalse(db_user.is_active)

        # Reactivate student account
        active_req = UserStatusUpdate(is_active=True)
        reactivated_res = update_user_status(user_id=self.user_student.id, status_in=active_req, current_user=self.user_admin, db=self.db)
        self.assertTrue(reactivated_res.is_active)

        # Verify DB persistence
        db_user_active = self.db.query(User).filter(User.id == self.user_student.id).first()
        self.assertTrue(db_user_active.is_active)

    def test_05_admin_self_deactivation_protection(self):
        """Test that Admin cannot deactivate their own account."""
        deactive_req = UserStatusUpdate(is_active=False)
        with self.assertRaises(HTTPException) as cm:
            update_user_status(user_id=self.user_admin.id, status_in=deactive_req, current_user=self.user_admin, db=self.db)
        self.assertEqual(cm.exception.status_code, 400)

    def test_06_student_recruiter_mentor_management_endpoints(self):
        """Test GET /admin/students, GET /admin/recruiters, GET /admin/mentors."""
        # Students
        students_list = get_all_students(current_user=self.user_admin, db=self.db)
        self.assertTrue(len(students_list) >= 1)
        single_student = get_student_by_id(student_id=self.user_student.id, current_user=self.user_admin, db=self.db)
        self.assertEqual(single_student.user_id, self.user_student.id)

        # Recruiters
        recruiters_list = get_all_recruiters(current_user=self.user_admin, db=self.db)
        self.assertTrue(len(recruiters_list) >= 1)
        single_recruiter = get_recruiter_by_id(recruiter_id=self.user_recruiter.id, current_user=self.user_admin, db=self.db)
        self.assertEqual(single_recruiter.user_id, self.user_recruiter.id)

        # Mentors
        mentors_list = get_all_mentors(current_user=self.user_admin, db=self.db)
        self.assertTrue(len(mentors_list) >= 1)
        single_mentor = get_mentor_by_id(mentor_id=self.user_mentor.id, current_user=self.user_admin, db=self.db)
        self.assertEqual(single_mentor.user_id, self.user_mentor.id)

    def test_07_role_authorization_dependency(self):
        """Test require_role dependency enforcement for admin role."""
        admin_checker = require_role(["admin"])

        # Admin user allowed
        verified_admin = admin_checker(current_user=self.user_admin)
        self.assertEqual(verified_admin.id, self.user_admin.id)

        # Student user forbidden -> 403
        with self.assertRaises(HTTPException) as cm:
            admin_checker(current_user=self.user_student)
        self.assertEqual(cm.exception.status_code, 403)

        # Recruiter user forbidden -> 403
        with self.assertRaises(HTTPException) as cm:
            admin_checker(current_user=self.user_recruiter)
        self.assertEqual(cm.exception.status_code, 403)

        # Mentor user forbidden -> 403
        with self.assertRaises(HTTPException) as cm:
            admin_checker(current_user=self.user_mentor)
        self.assertEqual(cm.exception.status_code, 403)

    def test_08_privacy_and_data_protection(self):
        """Verify password hashes and authentication secrets are never exposed in responses."""
        users = get_all_users(current_user=self.user_admin, db=self.db)
        for u in users:
            self.assertFalse(hasattr(u, "password"))
            self.assertFalse(hasattr(u, "password_hash"))


if __name__ == "__main__":
    unittest.main()
