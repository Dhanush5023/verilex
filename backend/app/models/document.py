from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_type = Column(String(50))  # pdf, docx, image, txt
    file_size = Column(Integer)  # in bytes
    status = Column(String(50), default="uploaded")  # uploaded, processing, ready, error
    
    # Analysis results
    summary = Column(Text, nullable=True)
    risk_score = Column(Float, nullable=True)  # 0.0 to 10.0
    risk_level = Column(String(20), nullable=True)  # LOW, MEDIUM, HIGH, CRITICAL
    flagged_clauses = Column(JSON, nullable=True)  # List of {clause, reason, severity}
    key_terms = Column(JSON, nullable=True)  # List of important extracted terms
    important_dates = Column(JSON, nullable=True)  # List of {date, event, description}
    missing_information = Column(JSON, nullable=True)  # List of missing clause strings
    suggestions = Column(JSON, nullable=True)  # List of improvement suggestions
    document_type = Column(String(100), nullable=True)  # rental, loan, employment, insurance
    agent_report = Column(JSON, nullable=True)  # Detailed AI Legal Agent audit report
    
    # Vector store
    chroma_collection_id = Column(String(255), nullable=True)  # ChromaDB collection name
    chunk_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="documents")
    chat_messages = relationship("ChatMessage", back_populates="document", cascade="all, delete-orphan")
