from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    college = Column(String(255), nullable=True)
    degree = Column(String(255), nullable=True)
    branch = Column(String(255), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    cgpa = Column(Float, nullable=True)
    location = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    github_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    education_records = relationship("Education", back_populates="student", cascade="all, delete-orphan")
    skills = relationship("Skill", secondary="student_skills", back_populates="students")
    projects = relationship("Project", back_populates="student", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="student", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student")
    assessment_results = relationship("AssessmentResult", back_populates="student")
    mentor_approvals = relationship("MentorApproval", foreign_keys="MentorApproval.student_id", back_populates="student")
