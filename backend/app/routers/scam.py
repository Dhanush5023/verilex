"""
Scam Detector Router — Module 3: Scam & Fraud Risk Detector.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.scam_check import ScamCheck
from app.schemas.schemas import ScamCheckRequest, ScamCheckResponse
from app.utils.auth import get_current_user
from app.services.llm_service import detect_scam

router = APIRouter(prefix="/scam-check", tags=["Scam Detector — Module 3"])


@router.post("/analyze", response_model=ScamCheckResponse, status_code=201)
def analyze_for_scam(
    request: ScamCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Analyze text (job offer, loan message, investment pitch, etc.) for fraud indicators.
    Returns risk score, risk level, and detailed red flags with explanations.
    """
    if len(request.input_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Please provide more text to analyze (at least 20 characters).")

    result = detect_scam(request.input_text, request.check_type)

    check = ScamCheck(
        user_id=current_user.id,
        input_text=request.input_text,
        check_type=result.get("check_type", request.check_type),
        risk_score=float(result.get("risk_score", 50.0)),
        risk_level=result.get("risk_level", "MEDIUM"),
        verdict=result.get("verdict"),
        red_flags=result.get("red_flags", []),
        safe_signals=result.get("safe_signals", []),
        recommendation=result.get("recommendation"),
    )
    db.add(check)
    db.commit()
    db.refresh(check)
    return check


@router.get("/history", response_model=List[ScamCheckResponse])
def get_scam_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get history of scam checks for the current user."""
    return (
        db.query(ScamCheck)
        .filter(ScamCheck.user_id == current_user.id)
        .order_by(ScamCheck.created_at.desc())
        .all()
    )


@router.get("/{check_id}", response_model=ScamCheckResponse)
def get_scam_check(
    check_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific scam check result."""
    check = db.query(ScamCheck).filter(
        ScamCheck.id == check_id,
        ScamCheck.user_id == current_user.id,
    ).first()
    if not check:
        raise HTTPException(status_code=404, detail="Scam check not found")
    return check
