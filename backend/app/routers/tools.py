"""
Tools Router — AI Legal Utility Tools.
Modules: Case Summarizer, Legal Notice Generator, IPC/BNS Finder, Document Translator.
"""
from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User
from app.utils.auth import get_current_user
from app.schemas.schemas import (
    SummarizeRequest, SummarizeResponse,
    NoticeRequest, NoticeResponse,
    IpcBnsRequest, IpcBnsResponse,
    TranslateRequest, TranslateResponse,
)
from app.services.llm_service import summarize_case, generate_notice, find_ipc_bns, translate_document

router = APIRouter(prefix="/tools", tags=["AI Legal Tools"])


@router.post("/summarize", response_model=SummarizeResponse)
def summarize_case_text(
    request: SummarizeRequest,
    current_user: User = Depends(get_current_user),
):
    """Summarize a legal case, FIR, or court order."""
    if len(request.text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Please provide more text to summarize.")
    return summarize_case(request.text)


@router.post("/notice", response_model=NoticeResponse)
def create_legal_notice(
    request: NoticeRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a formal legal notice."""
    return generate_notice(
        notice_type=request.notice_type,
        facts=request.facts,
        sender_name=request.sender_name,
        recipient_name=request.recipient_name,
        demands=request.demands,
    )


@router.post("/ipc-bns", response_model=IpcBnsResponse)
def find_applicable_sections(
    request: IpcBnsRequest,
    current_user: User = Depends(get_current_user),
):
    """Find applicable IPC/BNS sections for a crime or legal situation."""
    if len(request.query.strip()) < 10:
        raise HTTPException(status_code=400, detail="Please describe the situation in more detail.")
    return find_ipc_bns(request.query)


@router.post("/translate", response_model=TranslateResponse)
def translate_legal_document(
    request: TranslateRequest,
    current_user: User = Depends(get_current_user),
):
    """Translate a legal document to an Indian regional language."""
    if len(request.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Please provide text to translate.")
    return translate_document(request.text, request.target_language, request.document_type)
