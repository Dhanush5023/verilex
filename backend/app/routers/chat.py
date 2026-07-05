"""
Chat Router — Module 4: Legal RAG Chatbot.
Supports general legal Q&A (using legal corpus) and per-document Q&A.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.chat import ChatSession, ChatMessage
from app.schemas.schemas import (
    AskQuestionRequest, ChatMessageResponse, ChatSessionResponse, ChatSource
)
from app.utils.auth import get_current_user
from app.services.rag_engine import (
    query_collection, query_multiple_collections,
    document_collection_name, LEGAL_CORPUS_COLLECTION
)
from app.services.llm_service import answer_legal_question

router = APIRouter(prefix="/chat", tags=["Legal Chat — Module 4"])


@router.post("/sessions", response_model=ChatSessionResponse, status_code=201)
def create_session(
    session_type: str = "general",
    document_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new chat session (general legal Q&A or document-specific)."""
    if document_id:
        doc = db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == current_user.id,
        ).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        title = f"Chat about: {doc.original_filename}"
        session_type = "document"
    else:
        title = "Legal Q&A Session"
    
    session = ChatSession(
        user_id=current_user.id,
        title=title,
        session_type=session_type,
        document_id=document_id,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions", response_model=List[ChatSessionResponse])
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all chat sessions for the current user."""
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
        .all()
    )
    return sessions


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a chat session with all messages."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/sessions/{session_id}/ask", response_model=ChatMessageResponse)
def ask_question(
    session_id: int,
    request: AskQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Ask a legal question in a session.
    - General session: retrieves from legal corpus
    - Document session: retrieves from document's vector store
    """
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Save user message
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=request.question,
    )
    db.add(user_msg)
    db.commit()

    # Retrieve relevant context
    context_chunks = []
    
    if session.session_type == "document" and session.document_id:
        doc = db.query(Document).filter(Document.id == session.document_id).first()
        if doc and doc.chroma_collection_id and doc.status == "ready":
            context_chunks = query_collection(
                collection_name=doc.chroma_collection_id,
                query_text=request.question,
                n_results=5,
            )
    else:
        # General legal Q&A — query legal corpus
        context_chunks = query_collection(
            collection_name=LEGAL_CORPUS_COLLECTION,
            query_text=request.question,
            n_results=5,
        )

    # Generate LLM answer
    answer = answer_legal_question(request.question, context_chunks)

    # Build sources for citation
    sources = [
        {"content": c["content"][:200], "source": c["source"], "page": c.get("page")}
        for c in context_chunks[:3]
    ] if context_chunks else None

    # Save assistant message
    assistant_msg = ChatMessage(
        session_id=session_id,
        document_id=session.document_id,
        role="assistant",
        content=answer,
        sources=sources,
    )
    db.add(assistant_msg)

    # Update session title if it's the first message
    if session.title in ("Legal Q&A Session", "New Chat") and len(session.messages) <= 1:
        session.title = request.question[:80]

    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg


@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a chat session and all its messages."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
