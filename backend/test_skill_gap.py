import sys
import os

backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
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

from recommendation.skill_normalizer import normalize_skill, normalize_skill_list
from skill_gap.analyzer import skill_gap_analyzer

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

def setup_test_db():
    db = TestSessionLocal()
    try:
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
        db.query(User).filter(User.email.like("%@testsg.com")).delete()
        db.commit()

        # 1. Student A User
        student_a = User(
            full_name="Alice SkillGap Student",
            email="alice@testsg.com",
            password_hash=hash_password("password123"),
            role="student",
            is_active=True
        )
        db.add(student_a)

        # 2. Student B User (empty profile / no resume)
        student_b = User(
            full_name="Bob SkillGap Student",
            email="bob@testsg.com",
            password_hash=hash_password("password123"),
            role="student",
            is_active=True
        )
        db.add(student_b)

        # 3. Recruiter User
        recruiter = User(
            full_name="Recruiter Manager",
            email="recruiter@testsg.com",
            password_hash=hash_password("password123"),
            role="recruiter",
            is_active=True
        )
        db.add(recruiter)

        # 4. Mentor User
        mentor = User(
            full_name="Mentor Supervisor",
            email="mentor@testsg.com",
            password_hash=hash_password("password123"),
            role="mentor",
            is_active=True
        )
        db.add(mentor)

        db.commit()
        db.refresh(student_a)
        db.refresh(student_b)
        db.refresh(recruiter)
        db.refresh(mentor)

        student_a_id = student_a.id
        student_b_id = student_b.id
        recruiter_id = recruiter.id
        mentor_id = mentor.id

        # Student A Profile
        profile_a = StudentProfile(
            user_id=student_a_id,
            college="MIT",
            degree="B.Tech",
            branch="Computer Science",
            cgpa=9.1,
            bio="Python & Web Developer"
        )
        db.add(profile_a)

        # Student B Profile
        profile_b = StudentProfile(
            user_id=student_b_id,
            college="IIT",
            degree="B.E.",
            branch="Mechanical",
            cgpa=6.8
        )
        db.add(profile_b)
        db.commit()
        db.refresh(profile_a)

        # Student A Skills
        sk_python = Skill(name="Python")
        sk_sql = Skill(name="SQL")
        sk_fastapi = Skill(name="FastAPI")
        db.add_all([sk_python, sk_sql, sk_fastapi])
        db.commit()

        profile_a.skills.append(sk_python)
        profile_a.skills.append(sk_sql)
        profile_a.skills.append(sk_fastapi)

        # Student A Project
        proj = Project(
            student_id=profile_a.id,
            title="React Dashboard",
            description="Built a React frontend with HTML and CSS",
            technologies="React, HTML, CSS"
        )
        db.add(proj)

        # Student A Resume
        res_file_path = os.path.join(os.path.dirname(__file__), "uploads", "resumes", "alice_resume.txt")
        res = Resume(
            student_id=profile_a.id,
            file_name="alice_resume.txt",
            file_path=res_file_path,
            file_type="text/plain",
            is_active=True
        )
        db.add(res)

        # Job 1: Python Full Stack Position
        job_1 = Job(
            recruiter_id=recruiter_id,
            title="Python Full Stack Developer",
            company_name="Innovate Tech",
            description="Looking for Python, Django, FastAPI, React, SQL, and Docker skills.",
            skills_required="Python, Django, FastAPI, React, SQL, Docker",
            status="active"
        )

        db.add(job_1)
        db.commit()
        db.refresh(job_1)

        return {
            "student_a_id": student_a_id,
            "student_b_id": student_b_id,
            "recruiter_id": recruiter_id,
            "mentor_id": mentor_id,
            "job_1_id": job_1.id
        }
    finally:
        db.close()


def run_all_tests():
    print("==================================================")
    print("STARTING STEP 12 SKILL GAP ANALYSIS TESTS")
    print("==================================================")

    data = setup_test_db()
    token_a = create_access_token({"sub": str(data["student_a_id"]), "role": "student"})
    token_b = create_access_token({"sub": str(data["student_b_id"]), "role": "student"})
    token_rec = create_access_token({"sub": str(data["recruiter_id"]), "role": "recruiter"})
    token_men = create_access_token({"sub": str(data["mentor_id"]), "role": "mentor"})

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}
    headers_rec = {"Authorization": f"Bearer {token_rec}"}
    headers_men = {"Authorization": f"Bearer {token_men}"}

    # 1. Target Role Skill Gap Endpoint
    print("\n1. Testing GET /student/skill-gap (Target Role)...")
    res_role = client.get("/student/skill-gap?target_role=Python%20Full%20Stack%20Developer", headers=headers_a)
    assert res_role.status_code == 200, f"Expected 200, got {res_role.status_code}: {res_role.text}"
    rg_json = res_role.json()
    assert rg_json["target_role"] == "Python Full Stack Developer"
    assert "python" in rg_json["current_skills"]
    assert "django" in rg_json["missing_skills"]
    assert rg_json["coverage_percentage"] > 0
    assert len(rg_json["learning_roadmap"]) > 0
    print(f"   [PASS] Target Role Gap calculated. Coverage: {rg_json['coverage_percentage']}%, Missing: {len(rg_json['missing_skills'])} skills.")

    # 2. Job-Specific Skill Gap Endpoint
    print("\n2. Testing GET /student/jobs/{job_id}/skill-gap...")
    res_job = client.get(f"/student/jobs/{data['job_1_id']}/skill-gap", headers=headers_a)
    assert res_job.status_code == 200, f"Expected 200, got {res_job.status_code}: {res_job.text}"
    jg_json = res_job.json()
    assert jg_json["job_id"] == data["job_1_id"]
    assert "python" in jg_json["matched_skills"]
    assert "django" in jg_json["missing_skills"]
    assert jg_json["matched_skill_count"] + jg_json["missing_skill_count"] == jg_json["total_target_skill_count"]
    print(f"   [PASS] Job Skill Gap verified: {jg_json['matched_skill_count']}/{jg_json['total_target_skill_count']} skills matched ({jg_json['skill_coverage_percentage']}%).")

    # 3. Determinism Verification
    print("\n3. Testing Skill Gap Determinism...")
    res_job_2 = client.get(f"/student/jobs/{data['job_1_id']}/skill-gap", headers=headers_a)
    assert res_job_2.json() == jg_json, "Subsequent skill gap calls must be 100% identical!"
    print("   [PASS] Skill Gap analysis is completely deterministic.")

    # 4. Learning Roadmap Priority Ordering Check
    print("\n4. Testing Learning Roadmap Priority Ordering...")
    roadmap = jg_json["learning_roadmap"]
    orders = [item["order"] for item in roadmap]
    assert orders == list(range(1, len(roadmap) + 1)), "Roadmap items must be sequentially ordered!"
    # Ensure high priority appears before medium/low priority
    priorities = [item["priority"] for item in roadmap]
    priority_ranks = [{"high": 1, "medium": 2, "low": 3}[p] for p in priorities]
    assert priority_ranks == sorted(priority_ranks), "Roadmap items must be sorted by priority rank!"
    print("   [PASS] Learning Roadmap priority ordering verified.")

    # 5. Unsupported Target Role 400 Error
    print("\n5. Testing Unsupported Target Role Validation...")
    res_err = client.get("/student/skill-gap?target_role=NonExistentRole", headers=headers_a)
    assert res_err.status_code == 400
    assert "Supported target roles" in res_err.json()["detail"]
    print("   [PASS] Unsupported target role returns 400 Bad Request with supported list.")

    # 6. Nonexistent Job 404 Error
    print("\n6. Testing Nonexistent Job 404 Error...")
    res_404 = client.get("/student/jobs/999999/skill-gap", headers=headers_a)
    assert res_404.status_code == 404
    print("   [PASS] Nonexistent job returns 404 Not Found correctly.")

    # 7. Role Authorization Restrictions (Student Only)
    print("\n7. Testing RBAC Student Role Enforcement...")
    assert client.get("/student/skill-gap", headers=headers_rec).status_code == 403
    assert client.get("/student/skill-gap", headers=headers_men).status_code == 403
    assert client.get("/student/skill-gap").status_code == 401
    print("   [PASS] Non-student roles blocked with 403 Forbidden.")

    # 8. Student B (No Resume / Minimal Profile)
    print("\n8. Testing Student B (Empty Skill Profile)...")
    res_b = client.get("/student/skill-gap?target_role=Python%20Full%20Stack%20Developer", headers=headers_b)
    assert res_b.status_code == 200
    b_json = res_b.json()
    assert b_json["coverage_percentage"] == 0.0 or len(b_json["matched_skills"]) == 0
    print("   [PASS] Student B with empty profile handled smoothly.")

    print("\n==================================================")
    print("ALL STEP 12 SKILL GAP TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_all_tests()
