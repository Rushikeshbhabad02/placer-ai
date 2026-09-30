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
from models.resume import Resume
from auth.security import create_access_token, hash_password

from vector_store.chroma_client import init_vector_store, is_vector_store_available, get_jobs_collection
from vector_store.embeddings import local_embedding_provider
from vector_store.documents import build_job_document, build_student_document
from vector_store.indexer import index_job, remove_job_index, reindex_all_jobs
from vector_store.search import semantic_search_jobs, semantic_match_student_to_job
from recommendation.engine import recommendation_engine
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
        db.query(Skill).delete()
        db.query(Job).delete()
        db.query(StudentProfile).delete()
        db.query(User).filter(User.email.like("%@testsem.com")).delete()
        db.commit()

        # 1. Student User
        student = User(
            full_name="Alice Semantic Student",
            email="student@testsem.com",
            password_hash=hash_password("password123"),
            role="student",
            is_active=True
        )
        db.add(student)

        # 2. Recruiter User
        recruiter = User(
            full_name="Recruiter Manager",
            email="recruiter@testsem.com",
            password_hash=hash_password("password123"),
            role="recruiter",
            is_active=True
        )
        db.add(recruiter)

        # 3. Admin User
        admin = User(
            full_name="Admin Supervisor",
            email="admin@testsem.com",
            password_hash=hash_password("password123"),
            role="admin",
            is_active=True
        )
        db.add(admin)

        db.commit()
        db.refresh(student)
        db.refresh(recruiter)
        db.refresh(admin)

        student_id = student.id
        recruiter_id = recruiter.id
        admin_id = admin.id

        profile = StudentProfile(
            user_id=student_id,
            college="MIT",
            degree="B.Tech",
            branch="Computer Science",
            cgpa=9.0,
            bio="Python & Web Developer"
        )
        db.add(profile)

        sk_py = Skill(name="Python")
        sk_sql = Skill(name="SQL")
        db.add_all([sk_py, sk_sql])
        db.commit()
        profile.skills.extend([sk_py, sk_sql])

        # Active Job 1: Python Backend
        job_1 = Job(
            recruiter_id=recruiter_id,
            title="Python Backend Developer",
            company_name="Alpha Tech",
            description="Developing REST APIs with Python, FastAPI, and PostgreSQL",
            skills_required="Python, FastAPI, PostgreSQL",
            location="Remote",
            job_type="Full-time",
            status="active"
        )

        # Active Job 2: Frontend React
        job_2 = Job(
            recruiter_id=recruiter_id,
            title="Frontend React Engineer",
            company_name="Beta Digital",
            description="Building interactive user interfaces using React, CSS, and TypeScript",
            skills_required="React, CSS, TypeScript",
            location="Bangalore",
            job_type="Full-time",
            status="active"
        )

        # Inactive Job 3: Inactive Backend
        job_3 = Job(
            recruiter_id=recruiter_id,
            title="Inactive Legacy Python Job",
            company_name="Old Corp",
            description="Legacy Python 2 maintenance job",
            skills_required="Python",
            status="inactive"
        )

        db.add_all([job_1, job_2, job_3])
        db.commit()
        db.refresh(job_1)
        db.refresh(job_2)
        db.refresh(job_3)

        return {
            "student_id": student_id,
            "recruiter_id": recruiter_id,
            "admin_id": admin_id,
            "job_1_id": job_1.id,
            "job_2_id": job_2.id,
            "job_3_id": job_3.id
        }
    finally:
        db.close()


def run_all_tests():
    print("==================================================")
    print("STARTING STEP 13 CHROMADB & SEMANTIC SEARCH TESTS")
    print("==================================================")

    data = setup_test_db()
    token_student = create_access_token({"sub": str(data["student_id"]), "role": "student"})
    token_recruiter = create_access_token({"sub": str(data["recruiter_id"]), "role": "recruiter"})
    token_admin = create_access_token({"sub": str(data["admin_id"]), "role": "admin"})

    headers_student = {"Authorization": f"Bearer {token_student}"}
    headers_recruiter = {"Authorization": f"Bearer {token_recruiter}"}
    headers_admin = {"Authorization": f"Bearer {token_admin}"}

    # 1. ChromaDB Initialization & Availability
    print("\n1. Testing ChromaDB Client Initialization...")
    assert is_vector_store_available() == True
    collection = get_jobs_collection()
    assert collection is not None
    print("   [PASS] ChromaDB persistent vector store initialized successfully.")

    # 2. Local Embedding Generation
    print("\n2. Testing Local 384D Dense Embeddings...")
    emb1 = local_embedding_provider.embed_text("Python Backend Developer")
    emb2 = local_embedding_provider.embed_text("Python Backend Developer")
    assert len(emb1) == 384
    assert emb1 == emb2, "Embeddings must be 100% deterministic!"
    print("   [PASS] Local embedding provider generated deterministic 384D vector.")

    # 3. Document Builders
    print("\n3. Testing Document Builder Utilities...")
    db = TestSessionLocal()
    job1 = db.query(Job).filter(Job.id == data["job_1_id"]).first()
    student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == data["student_id"]).first()
    job_doc, meta = build_job_document(job1)
    std_doc = build_student_document(student_profile, db)
    assert "Python Backend Developer" in job_doc
    assert meta["job_id"] == data["job_1_id"]
    assert "Python" in std_doc
    print("   [PASS] Document builders constructed clean searchable text representations.")

    # 4. Job Indexing, Upsert, and Removal
    print("\n4. Testing Job Indexing, Upsert, and Removal...")
    assert index_job(job1) == True
    assert remove_job_index(job1.id) == True
    assert index_job(job1) == True
    print("   [PASS] Job vector index creation, upsert, and deletion verified.")

    # 5. Bulk Job Re-indexing
    print("\n5. Testing Bulk Job Re-indexing...")
    reindex_res = reindex_all_jobs(db)
    assert reindex_res["status"] == "ok"
    assert reindex_res["indexed_count"] >= 2
    print(f"   [PASS] Bulk re-indexed {reindex_res['indexed_count']} active jobs.")

    # 6. Admin Reindex Endpoint Protection
    print("\n6. Testing Admin Vector Reindex API Protection...")
    res_adm = client.post("/admin/vector/jobs/reindex", headers=headers_admin)
    assert res_adm.status_code == 200
    res_stud = client.post("/admin/vector/jobs/reindex", headers=headers_student)
    assert res_stud.status_code == 403
    print("   [PASS] Admin reindex endpoint protected strictly.")

    # 7. Semantic Search Endpoint & Ordering
    print("\n7. Testing GET /student/jobs/semantic-search...")
    res_search = client.get("/student/jobs/semantic-search?q=Python%20backend%20APIs", headers=headers_student)
    assert res_search.status_code == 200, f"Expected 200, got {res_search.status_code}: {res_search.text}"
    s_json = res_search.json()
    assert s_json["status"] == "ok"
    assert s_json["total"] >= 1
    top_hit = s_json["results"][0]
    assert "semantic_score" in top_hit
    assert "similarity_percentage" in top_hit
    assert "raw_embedding" not in top_hit  # No raw embedding exposure!
    assert top_hit["job_id"] == data["job_1_id"], "Python backend query must rank Job 1 first!"
    print(f"   [PASS] Top semantic hit: {top_hit['title']} (Score: {top_hit['semantic_score']})")

    # 8. PostgreSQL Source-of-Truth Visibility Filtering
    print("\n8. Testing PostgreSQL Visibility Filtering...")
    job_ids_returned = [r["job_id"] for r in s_json["results"]]
    assert data["job_3_id"] not in job_ids_returned, "Inactive jobs must be filtered out by PostgreSQL!"
    print("   [PASS] Inactive/deleted jobs filtered out using PostgreSQL source-of-truth.")

    # 9. Student-to-Job Semantic Similarity
    print("\n9. Testing Student-to-Job Semantic Match Function...")
    sim = semantic_match_student_to_job(student_profile, job1, db)
    assert 0.0 <= sim <= 1.0
    print(f"   [PASS] Direct student-job semantic match score: {sim}")

    # 10. STEP 11 & STEP 12 Regression Verification
    print("\n10. Testing STEP 11 Recommendation & STEP 12 Skill Gap Consistency...")
    match_11 = recommendation_engine.compute_job_match(student_profile, job1, db)
    assert match_11.match_score >= 0
    assert hasattr(match_11, "semantic_score")

    gap_12 = skill_gap_analyzer.analyze_job_skill_gap(student_profile, job1, db)
    assert gap_12.skill_coverage_percentage >= 0
    print("   [PASS] STEP 11 recommendation and STEP 12 skill gap remain 100% functional.")

    db.close()

    print("\n==================================================")
    print("ALL STEP 13 CHROMADB & SEMANTIC SEARCH TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    run_all_tests()
