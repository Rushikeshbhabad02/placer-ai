import sys
import os

backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import engine as default_engine, SessionLocal as DefaultSessionLocal, check_database_connection
from auth.dependencies import get_db
from models import Base
from models.user import User
from models.student_profile import StudentProfile
from models.job import Job
from models.skill import Skill
from models.project import Project
from models.education import Education
from models.resume import Resume
from auth.security import create_access_token, hash_password
from recommendation.skill_normalizer import normalize_skill, normalize_skill_list, extract_skills_from_text
from recommendation.engine import recommendation_engine

# Database selection with fallback to SQLite for local test runs
db_status = check_database_connection()
if db_status.get("database") == "connected" and default_engine and DefaultSessionLocal:
    test_engine = default_engine
    TestSessionLocal = DefaultSessionLocal
else:
    test_engine = create_engine("sqlite:///./test_placer_ai.db", connect_args={"check_same_thread": False})
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)

def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

from sqlalchemy import text

def setup_test_db():
    db = TestSessionLocal()
    try:
        # Clean existing test data safely
        try:
            db.execute(text("DELETE FROM student_skills"))
        except Exception:
            pass
        db.query(Resume).delete()
        db.query(Project).delete()
        db.query(Education).delete()
        db.query(Skill).delete()
        db.query(Job).delete()
        db.query(StudentProfile).delete()
        db.query(User).filter(User.email.like("%@testrec.com")).delete()
        db.commit()

        # 1. Create Student User A
        student_user_a = User(
            full_name="Alice Recommendation Student",
            email="alice@testrec.com",
            password_hash=hash_password("password123"),
            role="student",
            is_active=True
        )
        db.add(student_user_a)

        # 2. Create Student User B
        student_user_b = User(
            full_name="Bob Recommendation Student",
            email="bob@testrec.com",
            password_hash=hash_password("password123"),
            role="student",
            is_active=True
        )
        db.add(student_user_b)

        # 3. Create Recruiter User
        recruiter_user = User(
            full_name="Recruiter Manager",
            email="recruiter@testrec.com",
            password_hash=hash_password("password123"),
            role="recruiter",
            is_active=True
        )
        db.add(recruiter_user)

        # 4. Create Mentor User
        mentor_user = User(
            full_name="Mentor Supervisor",
            email="mentor@testrec.com",
            password_hash=hash_password("password123"),
            role="mentor",
            is_active=True
        )
        db.add(mentor_user)

        db.commit()
        db.refresh(student_user_a)
        db.refresh(student_user_b)
        db.refresh(recruiter_user)
        db.refresh(mentor_user)

        student_a_id = student_user_a.id
        student_b_id = student_user_b.id
        recruiter_id = recruiter_user.id
        mentor_id = mentor_user.id

        # 5. Student A Profile
        profile_a = StudentProfile(
            user_id=student_a_id,
            college="MIT",
            degree="B.Tech",
            branch="Computer Science",
            graduation_year=2025,
            cgpa=9.2,
            location="Bangalore",
            bio="Passionate Python and Web Developer"
        )
        db.add(profile_a)

        # 6. Student B Profile (incomplete profile, no resume)
        profile_b = StudentProfile(
            user_id=student_b_id,
            college="IIT",
            degree="B.E.",
            branch="Civil Engineering",
            cgpa=6.5
        )
        db.add(profile_b)
        db.commit()
        db.refresh(profile_a)

        # Skills for Student A
        skill_python = Skill(name="Python")
        skill_sql = Skill(name="SQL")
        skill_react = Skill(name="React.js")
        db.add_all([skill_python, skill_sql, skill_react])
        db.commit()

        profile_a.skills.append(skill_python)
        profile_a.skills.append(skill_sql)
        profile_a.skills.append(skill_react)

        # Project for Student A
        proj = Project(
            student_id=profile_a.id,
            title="FastAPI Web App",
            description="Built a REST API using FastAPI, PostgreSQL and React",
            technologies="FastAPI, PostgreSQL, React"
        )
        db.add(proj)

        # Education for Student A
        edu = Education(
            student_id=profile_a.id,
            degree="B.Tech",
            field_of_study="Computer Science",
            institution="MIT",
            start_year=2021,
            end_year=2025,
            cgpa=9.2
        )
        db.add(edu)

        # Resume for Student A
        res_file_path = os.path.join(os.path.dirname(__file__), "uploads", "resumes", "alice_resume.txt")
        res = Resume(
            student_id=profile_a.id,
            file_name="alice_resume.txt",
            file_path=res_file_path,
            file_type="text/plain",
            is_active=True
        )
        db.add(res)

        # 7. Create Jobs
        job_1 = Job(
            recruiter_id=recruiter_id,
            title="Python Developer",
            company_name="Tech Solutions Inc",
            description="Looking for Python, SQL, Django, FastAPI developer with 0-1 years exp. CGPA >= 7.0",
            skills_required="Python, SQL, Django, React, FastAPI",
            location="Remote",
            job_type="Full-time",
            experience_required="0-1 years",
            status="active"
        )

        job_2 = Job(
            recruiter_id=recruiter_id,
            title="Frontend Developer",
            company_name="Design Dynamics",
            description="Seeking Frontend Developer skilled in React, HTML, CSS, JavaScript",
            skills_required="React, HTML, CSS, JavaScript",
            location="Bangalore",
            job_type="Full-time",
            status="active"
        )

        db.add_all([job_1, job_2])
        db.commit()
        db.refresh(job_1)
        db.refresh(job_2)

        return {
            "student_a_id": student_a_id,
            "student_b_id": student_b_id,
            "recruiter_id": recruiter_id,
            "mentor_id": mentor_id,
            "job_1_id": job_1.id,
            "job_2_id": job_2.id
        }
    finally:
        db.close()


def run_all_tests():
    print("==================================================")
    print("STARTING STEP 11 AI RECOMMENDATION & MATCH TESTS")
    print("==================================================")

    data = setup_test_db()
    token_a = create_access_token({"sub": str(data["student_a_id"]), "role": "student"})
    token_b = create_access_token({"sub": str(data["student_b_id"]), "role": "student"})
    token_recruiter = create_access_token({"sub": str(data["recruiter_id"]), "role": "recruiter"})
    token_mentor = create_access_token({"sub": str(data["mentor_id"]), "role": "mentor"})

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}
    headers_recruiter = {"Authorization": f"Bearer {token_recruiter}"}
    headers_mentor = {"Authorization": f"Bearer {token_mentor}"}

    # 1. Skill Normalization Unit Tests
    print("\n1. Testing Skill Normalization...")
    assert normalize_skill("  React.js  ") == "react"
    assert normalize_skill("NodeJS") == "node"
    assert normalize_skill("PostgreSQL") == "postgres"
    assert normalize_skill_list(["Python", "PYTHON", "react.js", "node.js"]) == ["node", "python", "react"]
    extracted = extract_skills_from_text("Experience in Python, FastAPI, Docker, and PostgreSQL")
    assert "python" in extracted and "fastapi" in extracted and "docker" in extracted and "postgres" in extracted
    print("   [PASS] Skill normalization & extraction working as expected.")

    # 2. Student Recommendation Endpoint
    print("\n2. Testing GET /student/recommendations...")
    res = client.get("/student/recommendations?limit=5", headers=headers_a)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    rec_json = res.json()
    assert "recommendations" in rec_json
    assert rec_json["total"] >= 2
    top_rec = rec_json["recommendations"][0]
    assert "match_score" in top_rec
    assert "matched_skills" in top_rec
    assert "missing_skills" in top_rec
    print(f"   [PASS] Recommended {rec_json['total']} jobs. Top job: {top_rec['title']} (Score: {top_rec['match_score']})")

    # 3. Deterministic Match Score Test
    print("\n3. Testing Score Determinism...")
    res1 = client.get(f"/student/jobs/{data['job_1_id']}/match", headers=headers_a)
    res2 = client.get(f"/student/jobs/{data['job_1_id']}/match", headers=headers_a)
    assert res1.status_code == 200 and res2.status_code == 200
    match1 = res1.json()
    match2 = res2.json()
    assert match1["match_score"] == match2["match_score"], "Scores must be identical!"
    assert match1["matched_skills"] == match2["matched_skills"]
    assert match1["missing_skills"] == match2["missing_skills"]
    print(f"   [PASS] Deterministic match verified! Score: {match1['match_score']}% (Level: {match1['match_level']})")

    # 4. Matched & Missing Skills Check
    print("\n4. Testing Matched and Missing Skills Logic...")
    assert "python" in match1["matched_skills"]
    assert "sql" in match1["matched_skills"]
    assert "react" in match1["matched_skills"]
    assert "django" in match1["missing_skills"]
    print("   [PASS] Matched & Missing skills verified accurately.")

    # 5. Score Breakdown Verification
    print("\n5. Testing Score Breakdown Structure...")
    bd = match1["score_breakdown"]
    assert "skill_match" in bd
    assert "eligibility" in bd
    assert "education" in bd
    assert "resume_alignment" in bd
    assert "profile_completeness" in bd
    print(f"   [PASS] Score breakdown verified: {bd}")

    # 6. Missing Resume Handling & Proportional Weight Redistribution
    print("\n6. Testing Student B (No Resume / Incomplete Profile)...")
    res_b = client.get(f"/student/jobs/{data['job_1_id']}/match", headers=headers_b)
    assert res_b.status_code == 200
    match_b = res_b.json()
    assert 0 <= match_b["match_score"] <= 100
    assert any("resume" in s.lower() for s in match_b["improvement_suggestions"])
    print(f"   [PASS] Student B without resume score calculated smoothly: {match_b['match_score']}%")

    # 7. Nonexistent Job Handling
    print("\n7. Testing Nonexistent Job 404 Error...")
    res_404 = client.get("/student/jobs/999999/match", headers=headers_a)
    assert res_404.status_code == 404
    print("   [PASS] Nonexistent job returns 404 correctly.")

    # 8. Role Authorization Security (Student-Only Endpoint Protection)
    print("\n8. Testing RBAC Role Restrictions...")
    res_rec = client.get("/student/recommendations", headers=headers_recruiter)
    assert res_rec.status_code == 403, f"Expected 403 for recruiter on student endpoint, got {res_rec.status_code}"
    res_men = client.get("/student/recommendations", headers=headers_mentor)
    assert res_men.status_code == 403, f"Expected 403 for mentor on student endpoint, got {res_men.status_code}"
    res_unauth = client.get("/student/recommendations")
    assert res_unauth.status_code == 401
    print("   [PASS] Role authorization restrictions enforced strictly.")

    # 9. Recruiter Candidate Matching & Ownership Isolation
    print("\n9. Testing Recruiter Candidate Match Endpoint & Ownership Security...")
    res_cand = client.get(f"/recruiter/jobs/{data['job_1_id']}/candidate-matches", headers=headers_recruiter)
    assert res_cand.status_code == 200
    cands_json = res_cand.json()
    assert "candidates" in cands_json
    assert len(cands_json["candidates"]) >= 1

    # Recruiter B attempts to view Recruiter A's job matches
    db = TestSessionLocal()
    recruiter_b = User(full_name="Recruiter B", email="rec2@testrec.com", password_hash="hash", role="recruiter", is_active=True)
    db.add(recruiter_b)
    db.commit()
    db.refresh(recruiter_b)
    token_rec_b = create_access_token({"sub": str(recruiter_b.id), "role": "recruiter"})
    headers_rec_b = {"Authorization": f"Bearer {token_rec_b}"}

    res_forbidden = client.get(f"/recruiter/jobs/{data['job_1_id']}/candidate-matches", headers=headers_rec_b)
    assert res_forbidden.status_code == 403, f"Expected 403, got {res_forbidden.status_code}"
    db.delete(recruiter_b)
    db.commit()
    db.close()
    print("   [PASS] Recruiter candidate matching & job ownership security verified.")

    print("\n==================================================")
    print("ALL STEP 11 RECOMMENDATION TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_all_tests()
