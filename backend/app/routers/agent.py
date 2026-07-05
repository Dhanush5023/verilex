from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.document import Document
from app.models.user import User
from app.utils.auth import get_current_user
from app.schemas.schemas import AgentReportResponse
from app.services.legal_agent import run_legal_agent
from app.utils.pdf_generator import generate_report_pdf

router = APIRouter(prefix="/agent", tags=["AI Legal Agent"])

@router.post("/run/{document_id}", response_model=AgentReportResponse)
def run_agent_audit(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Triggers the autonomous AI legal audit for a specific document."""
    try:
        report = run_legal_agent(db, document_id, current_user.id)
        return {
            "document_id": document_id,
            **report
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent analysis failed: {str(e)}")


@router.get("/download/{document_id}")
def download_agent_pdf_report(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates and downloads the PDF legal audit report for a document."""
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if not doc.agent_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="AI Agent report has not been generated yet. Please run the agent audit first."
        )
        
    try:
        # Compile PDF bytes in memory
        pdf_stream = generate_report_pdf(doc, doc.agent_report)
        filename = f"VeriLex_Audit_Report_{document_id}.pdf"
        
        return StreamingResponse(
            pdf_stream,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
