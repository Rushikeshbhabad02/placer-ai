from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from .base import Base

# Association table for StudentProfile <-> Skill many-to-many relationship
student_skills = Table(
    "student_skills",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
)

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    students = relationship("StudentProfile", secondary=student_skills, back_populates="skills")
