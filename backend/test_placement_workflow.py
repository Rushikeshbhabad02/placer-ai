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
from models.application import Application
from models.interview import Interview
from models.assessment import Assessment
from models.assessment_result import AssessmentResult
from auth.security import hash_password
from auth.routes import register
from placement.routes import (
    get_student_jobs,
    get_student_job_by_id,
    apply_for_job,
    get_my_applications,
    get_my_application_by_id,
    withdraw_application,
    get_recruiter_applications,
    get_recruiter_application_by_id,
    update_application_status,
    schedule_candidate_interview,
    get_recruiter_interviews,
    get_my_interviews,
    update_recruiter_interview,
    cancel_recruiter_interview,
    create_recruiter_assessment,
    get_student_assessments,
    submit_student_assessment,
    get_recruiter_assessment_results,
)
from schemas.auth import UserRegister
from schemas.workflow import (
    ApplicationStatusUpdate,
    InterviewCreate,
    InterviewUpdate,
    AssessmentCreate,
    AssessmentSubmit,
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


class TestPlacementWorkflow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Prepare database test accounts for Student A, Student B, Recruiter A, and Recruiter B."""
        cls.db = TestSessionLocal()

        # Clean old test users & related workflow entities
        emails = [
            "student_flow_a@example.com",
            "student_flow_b@example.com",
            "recruiter_flow_a@example.com",
            "recruiter_flow_b@example.com"
        ]
        for email in emails:
            u = cls.db.query(User).filter(User.email == email).first()
            if u:
                cls.db.query(AssessmentResult).delete(synchronize_session=False)
                cls.db.query(Assessment).delete(synchronize_session=False)
                cls.db.query(Interview).delete(synchronize_session=False)
                cls.db.query(Application).delete(synchronize_session=False)
                cls.db.query(Job).filter(Job.recruiter_id == u.id).delete(synchronize_session=False)
                cls.db.delete(u)
        cls.db.commit()

        # Register Student A
        cls.user_s_a = register(
            UserRegister(
                full_name="Student Flow A",
                email="student_flow_a@example.com",
                password="Password123!",
                role="student"
            ),
            cls.db
        )

        # Register Student B
        cls.user_s_b = register(
            UserRegister(
                full_name="Student Flow B",
                email="student_flow_b@example.com",
                password="Password123!",
                role="student"
            ),
            cls.db
        )

        # Register Recruiter A
        cls.user_r_a = register(
            UserRegister(
                full_name="Recruiter Flow A",
                email="recruiter_flow_a@example.com",
                password="Password123!",
                role="recruiter"
            ),
            cls.db
        )

        # Register Recruiter B
        cls.user_r_b = register(
            UserRegister(
                full_name="Recruiter Flow B",
                email="recruiter_flow_b@example.com",
                password="Password123!",
                role="recruiter"
            ),
            cls.db
        )

        # Create Job for Recruiter A
        cls.job_a = Job(
            recruiter_id=cls.user_r_a.id,
            title="Software Development Engineer - I",
            company_name="Tech Innovation Corp",
            description="Full stack React and Python engineering role",
            location="Pune, India",
            job_type="Full-time",
            salary_min=1200000.0,
            salary_max=1800000.0,
            skills_required="React, Python, SQL",
            status="active"
        )
        cls.db.add(cls.job_a)

        # Create Job for Recruiter B
        cls.job_b = Job(
            recruiter_id=cls.user_r_b.id,
            title="Data Analyst Specialist",
            company_name="Analytics Solutions",
            description="SQL and Tableau business analytics",
            location="Bangalore, India",
            job_type="Full-time",
            salary_min=800000.0,
            salary_max=1200000.0,
            skills_required="SQL, Python, Tableau",
            status="active"
        )
        cls.db.add(cls.job_b)
        cls.db.commit()
        cls.db.refresh(cls.job_a)
        cls.db.refresh(cls.job_b)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_student_job_discovery(self):
        """Test student job discovery and detail endpoints."""
        jobs = get_student_jobs(current_user=self.user_s_a, db=self.db)
        self.assertGreaterEqual(len(jobs), 2)

        # Filter by search
        searched = get_student_jobs(search="Software", current_user=self.user_s_a, db=self.db)
        self.assertTrue(any("Software" in j.title for j in searched))

        # Get job by ID
        job_detail = get_student_job_by_id(job_id=self.job_a.id, current_user=self.user_s_a, db=self.db)
        self.assertEqual(job_detail.id, self.job_a.id)

    def test_02_student_application_workflow_and_uniqueness(self):
        """Test applying for a job, duplicate prevention (409 Conflict), and application listing."""
        # Student A applies to Job A
        app_res = apply_for_job(job_id=self.job_a.id, current_user=self.user_s_a, db=self.db)
        self.assertEqual(app_res.job_id, self.job_a.id)
        self.assertEqual(app_res.status, "applied")

        # Duplicate application attempt by Student A to Job A -> 409 Conflict
        with self.assertRaises(HTTPException) as cm:
            apply_for_job(job_id=self.job_a.id, current_user=self.user_s_a, db=self.db)
        self.assertEqual(cm.exception.status_code, 409)

        # Student A lists applications
        my_apps = get_my_applications(current_user=self.user_s_a, db=self.db)
        self.assertTrue(any(a.id == app_res.id for a in my_apps))

    def test_03_student_application_ownership_isolation(self):
        """Test Student A cannot access Student B's applications."""
        # Student B applies to Job B
        app_b = apply_for_job(job_id=self.job_b.id, current_user=self.user_s_b, db=self.db)

        # Student A trying to GET Student B's application -> 403 Forbidden
        with self.assertRaises(HTTPException) as cm:
            get_my_application_by_id(application_id=app_b.id, current_user=self.user_s_a, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)

        # Student A trying to WITHDRAW Student B's application -> 403 Forbidden
        with self.assertRaises(HTTPException) as cm:
            withdraw_application(application_id=app_b.id, current_user=self.user_s_a, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)

    def test_04_recruiter_application_management_and_isolation(self):
        """Test recruiter candidates view, status update, and ownership isolation."""
        # Recruiter A views applications for Recruiter A's jobs
        apps_r_a = get_recruiter_applications(current_user=self.user_r_a, db=self.db)
        self.assertTrue(len(apps_r_a) >= 1)
        app_target = apps_r_a[0]

        # Recruiter B attempting to view Recruiter A's candidate application -> 403 Forbidden
        with self.assertRaises(HTTPException) as cm:
            get_recruiter_application_by_id(application_id=app_target.id, current_user=self.user_r_b, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)

        # Recruiter B attempting to update status of Recruiter A's candidate -> 403 Forbidden
        status_req = ApplicationStatusUpdate(status="shortlisted")
        with self.assertRaises(HTTPException) as cm:
            update_application_status(application_id=app_target.id, status_in=status_req, current_user=self.user_r_b, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)

        # Recruiter A updates candidate status to shortlisted
        updated_app = update_application_status(application_id=app_target.id, status_in=status_req, current_user=self.user_r_a, db=self.db)
        self.assertEqual(updated_app.status, "shortlisted")

    def test_05_interview_workflow_and_isolation(self):
        """Test interview scheduling, student interview tracking, and ownership isolation."""
        apps_r_a = get_recruiter_applications(current_user=self.user_r_a, db=self.db)
        app_target = apps_r_a[0]

        # Recruiter B attempting to schedule interview for Recruiter A's candidate -> 403 Forbidden
        inv_data = InterviewCreate(
            interview_date="2026-10-15",
            interview_time="11:00 AM",
            interview_type="online",
            meeting_link="https://meet.google.com/abc-defg-hij",
            notes="Technical Interview Round 1"
        )
        with self.assertRaises(HTTPException) as cm:
            schedule_candidate_interview(application_id=app_target.id, interview_in=inv_data, current_user=self.user_r_b, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)

        # Recruiter A schedules interview for candidate
        inv_res = schedule_candidate_interview(application_id=app_target.id, interview_in=inv_data, current_user=self.user_r_a, db=self.db)
        self.assertEqual(inv_res.interview_date, "2026-10-15")
        self.assertEqual(inv_res.status, "scheduled")

        # Student A sees scheduled interview
        student_interviews = get_my_interviews(current_user=self.user_s_a, db=self.db)
        self.assertTrue(any(i.id == inv_res.id for i in student_interviews))

        # Recruiter B attempting to update or cancel Recruiter A's interview -> 403 Forbidden
        inv_update = InterviewUpdate(notes="Hacked Note")
        with self.assertRaises(HTTPException) as cm:
            update_recruiter_interview(interview_id=inv_res.id, interview_in=inv_update, current_user=self.user_r_b, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)

        with self.assertRaises(HTTPException) as cm:
            cancel_recruiter_interview(interview_id=inv_res.id, current_user=self.user_r_b, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)

    def test_06_assessment_workflow_and_results(self):
        """Test assessment creation, student submission, and candidate assessment result retrieval."""
        # Recruiter A creates assessment
        asm_req = AssessmentCreate(
            title="Core Python & Algorithms Assessment",
            description="Multiple choice & coding concepts",
            duration_minutes=45,
            total_marks=100
        )
        asm_res = create_recruiter_assessment(assessment_in=asm_req, current_user=self.user_r_a, db=self.db)
        self.assertEqual(asm_res.title, "Core Python & Algorithms Assessment")

        # Student A views assessment list
        student_asms = get_student_assessments(current_user=self.user_s_a, db=self.db)
        self.assertTrue(any(a.id == asm_res.id for a in student_asms))

        # Student A submits assessment
        submit_data = AssessmentSubmit(
            score=90.0,
            percentage=90.0,
            correct_answers=18,
            wrong_answers=2,
            time_taken_seconds=1800
        )
        sub_res = submit_student_assessment(assessment_id=asm_res.id, submit_in=submit_data, current_user=self.user_s_a, db=self.db)
        self.assertEqual(sub_res.score, 90.0)

        # Recruiter A views candidate results for assessment
        rec_results = get_recruiter_assessment_results(assessment_id=asm_res.id, current_user=self.user_r_a, db=self.db)
        self.assertTrue(any(r.id == sub_res.id for r in rec_results))

        # Recruiter B attempting to view Recruiter A's assessment results -> 403 Forbidden
        with self.assertRaises(HTTPException) as cm:
            get_recruiter_assessment_results(assessment_id=asm_res.id, current_user=self.user_r_b, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)


if __name__ == "__main__":
    unittest.main()
