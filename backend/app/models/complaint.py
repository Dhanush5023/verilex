from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Input
    issue_description = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)  # consumer, tenant, employment, digital_fraud, etc.
    
    # Generated output
    complaint_title = Column(String(500), nullable=True)
    formal_complaint = Column(Text, nullable=True)
    filing_authority = Column(String(500), nullable=True)
    filing_portal = Column(String(500), nullable=True)
    legal_references = Column(JSON, nullable=True)  # relevant acts/sections
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="complaints")
