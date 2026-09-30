from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    scheduled_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    interview_date = Column(String(50), nullable=True)
    interview_time = Column(String(50), nullable=True)
    interview_type = Column(String(50), default="online", nullable=False)
    meeting_link = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="scheduled", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    application = relationship("Application", back_populates="interviews")
    scheduler = relationship("User")
