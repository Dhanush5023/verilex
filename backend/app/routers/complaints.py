"""
Complaints Router — Module 2: Complaint & Grievance Drafter.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.complaint import Complaint
from app.schemas.schemas import ComplaintRequest, ComplaintResponse
from app.utils.auth import get_current_user
from app.services.llm_service import draft_complaint

router = APIRouter(prefix="/complaints", tags=["Complaint Drafter — Module 2"])


@router.post("/draft", response_model=ComplaintResponse, status_code=201)
def create_complaint(
    request: ComplaintRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate a formal complaint letter from a plain-language issue description.
    Uses Groq LLM to classify the complaint and draft a legally-worded letter.
    """
    result = draft_complaint(request.issue_description, request.category)

    complaint = Complaint(
        user_id=current_user.id,
        issue_description=request.issue_description,
        category=result.get("category"),
        complaint_title=result.get("complaint_title"),
        formal_complaint=result.get("formal_complaint"),
        filing_authority=result.get("filing_authority"),
        filing_portal=result.get("filing_portal"),
        legal_references=result.get("legal_references", []),
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("/", response_model=List[ComplaintResponse])
def list_complaints(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all complaints created by the current user."""
    return (
        db.query(Complaint)
        .filter(Complaint.user_id == current_user.id)
        .order_by(Complaint.created_at.desc())
        .all()
    )


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific complaint by ID."""
    from fastapi import HTTPException
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.user_id == current_user.id,
    ).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint
