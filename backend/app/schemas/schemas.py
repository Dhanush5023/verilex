from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Document Schemas ─────────────────────────────────────────────────────────

class FlaggedClause(BaseModel):
    clause: str
    reason: str
    severity: str  # LOW, MEDIUM, HIGH


class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: Optional[str]
    file_size: Optional[int]
    status: str
    summary: Optional[str]
    risk_score: Optional[float]
    risk_level: Optional[str]
    flagged_clauses: Optional[List[FlaggedClause]]
    key_terms: Optional[List[str]]
    important_dates: Optional[List[Any]]
    missing_information: Optional[List[str]]
    suggestions: Optional[List[str]]
    document_type: Optional[str]
    chunk_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    id: int
    original_filename: str
    file_type: Optional[str]
    status: str
    risk_level: Optional[str]
    risk_score: Optional[float]
    document_type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Chat Schemas ─────────────────────────────────────────────────────────────

class ChatSource(BaseModel):
    content: str
    source: str
    page: Optional[int] = None


class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    sources: Optional[List[ChatSource]]
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionResponse(BaseModel):
    id: int
    title: str
    session_type: str
    document_id: Optional[int]
    created_at: datetime
    messages: Optional[List[ChatMessageResponse]] = []

    class Config:
        from_attributes = True


class AskQuestionRequest(BaseModel):
    question: str
    session_id: Optional[int] = None


# ─── Complaint Schemas ────────────────────────────────────────────────────────

class ComplaintRequest(BaseModel):
    issue_description: str
    category: Optional[str] = None  # hint from user


class ComplaintResponse(BaseModel):
    id: int
    issue_description: str
    category: Optional[str]
    complaint_title: Optional[str]
    formal_complaint: Optional[str]
    filing_authority: Optional[str]
    filing_portal: Optional[str]
    legal_references: Optional[List[str]]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Scam Check Schemas ───────────────────────────────────────────────────────

class RedFlag(BaseModel):
    flag: str
    explanation: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL


class ScamCheckRequest(BaseModel):
    input_text: str
    check_type: Optional[str] = "auto"  # job_offer, loan_offer, investment, message, auto


class ScamCheckResponse(BaseModel):
    id: int
    input_text: str
    check_type: Optional[str]
    risk_score: Optional[float]
    risk_level: Optional[str]
    verdict: Optional[str]
    red_flags: Optional[List[RedFlag]]
    safe_signals: Optional[List[str]]
    recommendation: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Agent Schemas ────────────────────────────────────────────────────────────

class AgentLawRef(BaseModel):
    act: str
    section: str
    description: str


class AgentReportResponse(BaseModel):
    document_id: int
    summary: str
    risk_level: str
    risk_score: float
    recommended_actions: List[str]
    relevant_laws: List[AgentLawRef]
    complaint_template: str


# ─── Tools Schemas ────────────────────────────────────────────────────────────

class SummarizeRequest(BaseModel):
    text: str
    summary_type: Optional[str] = "case"

class SummarizeResponse(BaseModel):
    summary: str
    key_points: List[str]
    parties_involved: Optional[List[str]] = []
    outcome: Optional[str] = None
    applicable_laws: Optional[List[str]] = []

class NoticeRequest(BaseModel):
    notice_type: str
    facts: str
    sender_name: str
    recipient_name: str
    demands: str

class NoticeResponse(BaseModel):
    notice_text: str
    subject: str
    legal_basis: List[str]

class IpcBnsRequest(BaseModel):
    query: str

class IpcBnsSection(BaseModel):
    section: str
    act: str
    title: str
    description: str
    punishment: Optional[str] = None

class IpcBnsResponse(BaseModel):
    sections: List[IpcBnsSection]
    summary: str

class TranslateRequest(BaseModel):
    text: str
    target_language: str
    document_type: Optional[str] = "legal document"

class TranslateResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str
    notes: Optional[str] = None
