"""
Documents Router — Module 1: Document Intelligence Engine.
Handles upload, text extraction, AI analysis, and per-document Q&A setup.
"""
import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.schemas.schemas import DocumentResponse, DocumentListResponse
from app.utils.auth import get_current_user
from app.utils.file_utils import validate_file, generate_unique_filename, save_upload, get_file_type
from app.services.doc_processor import extract_text, clean_text, chunk_text
from app.services.llm_service import analyze_document
from app.services.rag_engine import add_chunks_to_collection, document_collection_name, delete_collection

router = APIRouter(prefix="/documents", tags=["Documents — Module 1"])


async def process_document_background(document_id: int, file_path: str, file_type: str, db_session_factory):
    """Background task: extract text → chunk → embed → analyze with LLM."""
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return

        # 1. Read file
        with open(file_path, "rb") as f:
            file_bytes = f.read()

        # 2. Extract text
        text = extract_text(file_bytes, file_type)
        text = clean_text(text)

        if not text or len(text) < 30:
            doc.status = "error"
            db.commit()
            return

        # 3. Chunk text
        chunks = chunk_text(text, chunk_size=800, chunk_overlap=150)

        # 4. Add to ChromaDB
        collection_name = document_collection_name(document_id, doc.user_id)
        count = add_chunks_to_collection(
            collection_name=collection_name,
            chunks=chunks,
            source_name=doc.original_filename,
            document_id=document_id,
        )

        # 5. Analyze with LLM
        analysis = analyze_document(text)

        # 6. Update document record
        doc.status = "ready"
        doc.summary = analysis.get("summary", "")
        doc.risk_score = float(analysis.get("risk_score", 5.0))
        doc.risk_level = analysis.get("risk_level", "MEDIUM")
        doc.flagged_clauses = analysis.get("flagged_clauses", [])
        doc.key_terms = analysis.get("key_terms", [])
        doc.important_dates = analysis.get("important_dates", [])
        doc.missing_information = analysis.get("missing_information", [])
        doc.suggestions = analysis.get("suggestions", [])
        doc.document_type = analysis.get("document_type", "other")
        doc.chroma_collection_id = collection_name
        doc.chunk_count = count
        db.commit()
    except Exception as e:
        print(f"Document processing error: {e}")
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.status = "error"
            db.commit()
    finally:
        db.close()


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a document for AI analysis. Processing happens in background."""
    file_bytes = await file.read()
    validate_file(file.filename, len(file_bytes))

    unique_name = generate_unique_filename(file.filename)
    file_path = save_upload(file_bytes, unique_name)
    file_type = get_file_type(file.filename)

    doc = Document(
        user_id=current_user.id,
        filename=unique_name,
        original_filename=file.filename,
        file_path=file_path,
        file_type=file_type,
        file_size=len(file_bytes),
        status="processing",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Process in background
    background_tasks.add_task(
        process_document_background,
        document_id=doc.id,
        file_path=file_path,
        file_type=file_type,
        db_session_factory=None,
    )

    return doc


@router.get("/", response_model=List[DocumentListResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all documents belonging to the current user."""
    docs = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )
    return docs


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get full analysis details for a document."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a document and its vector embeddings."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete from ChromaDB
    if doc.chroma_collection_id:
        delete_collection(doc.chroma_collection_id)
    
    # Delete file from disk
    if doc.file_path and os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    
    db.delete(doc)
    db.commit()
