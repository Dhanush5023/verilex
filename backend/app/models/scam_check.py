from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class ScamCheck(Base):
    __tablename__ = "scam_checks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Input
    input_text = Column(Text, nullable=False)
    check_type = Column(String(50), nullable=True)  # job_offer, loan_offer, investment, message, other

    # Analysis
    risk_score = Column(Float, nullable=True)  # 0.0 to 100.0
    risk_level = Column(String(20), nullable=True)  # SAFE, LOW, MEDIUM, HIGH, CRITICAL
    verdict = Column(Text, nullable=True)
    red_flags = Column(JSON, nullable=True)  # List of {flag, explanation, severity}
    safe_signals = Column(JSON, nullable=True)  # Positive indicators
    recommendation = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="scam_checks")
