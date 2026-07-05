import json
import logging
from sqlalchemy.orm import Session
from app.models.document import Document
from app.services.rag_engine import query_collection, document_collection_name, LEGAL_CORPUS_COLLECTION
from app.services.llm_service import chat_completion
from app.config import settings

logger = logging.getLogger(__name__)

AGENT_SYSTEM_PROMPT = """You are VeriLex's Autonomous AI Legal Agent.
Your task is to conduct a comprehensive legal audit on the provided document text.

You must perform these 4 actions:
1. Identify any risky, unfair, or hidden clauses.
2. Query and link relevant Indian legislations/acts/sections (e.g. Consumer Protection Act 2019, Indian Contract Act 1872, Real Estate Regulation Act, Industrial Disputes Act, IT Act, etc.) that govern this type of contract.
3. Recommend concrete, practical steps/actions the user should take (e.g., negotiate a specific liability cap, reject upfront deposit, request mutual termination).
4. Auto-draft a structured dispute complaint template that the user can immediately use if they face an issue under this contract.

You MUST respond strictly in valid JSON format. Do not write markdown blocks or text wrapper outside the JSON object.
The JSON structure must match this exact format:
{
  "summary": "Plain English audit overview of the document",
  "risk_level": "LOW", // MUST be one of: SAFE, LOW, MEDIUM, HIGH, CRITICAL
  "risk_score": 2.5, // Float from 0.0 to 10.0
  "recommended_actions": [
    "Negotiate section 4 to make the termination clause mutual.",
    "Verify the lock-in period penalty amount."
  ],
  "relevant_laws": [
    {
      "act": "Indian Contract Act, 1872",
      "section": "Section 28",
      "description": "Agreements in restraint of legal proceedings are void."
    }
  ],
  "complaint_template": "FORMAL DISPUTE LETTER\\n\\nTo:\\n[Party Name]\\n\\nSubject: Notice of Dispute under Clause...\\n\\nDear Sir/Madam..."
}
"""

def run_legal_agent(db: Session, document_id: int, user_id: int) -> dict:
    """Runs the autonomous Legal Agent reasoning loop over a document."""
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == user_id).first()
    if not doc:
        raise ValueError("Document not found")
        
    logger.info(f"Running AI Legal Agent on Doc ID {document_id}")
    
    # 1. Fetch document context (from DB raw text or from RAG collection)
    doc_text = doc.summary or ""
    # Query local chunks for deeper context
    coll_name = document_collection_name(document_id, user_id)
    doc_chunks = query_collection(coll_name, "clauses obligations liability termination", n_results=10)
    chunk_context = "\n".join([c["content"] for c in doc_chunks])
    
    # Fallback to general file details
    full_context = chunk_context if chunk_context else doc_text
    if not full_context:
        full_context = f"Document Name: {doc.original_filename}\nType: {doc.document_type or 'Contract'}"

    # 2. Query Legal Knowledge Base (RAG) to find matching law context
    query_topic = f"{doc.document_type or 'contract'} legal rights, liabilities, dispute resolution, contract regulations"
    laws_found = query_collection(LEGAL_CORPUS_COLLECTION, query_topic, n_results=5)
    law_context = "\n\n".join([f"Source: {l['source']}\nContent: {l['content']}" for l in laws_found])

    # 3. Build prompts
    user_prompt = f"""DOCUMENT UNDER AUDIT:
---------------------------
{full_context[:6000]}

RELEVANT INDIAN LAWS & CONTEXT FOUND:
---------------------------
{law_context[:4000]}

Please run your complete autonomous legal audit and return the JSON response.
"""

    # 4. Invoke LLM
    try:
        raw_response = chat_completion(
            system_prompt=AGENT_SYSTEM_PROMPT,
            user_message=user_prompt,
            temperature=0.2
        )
        
        # Clean any markdown wrapper if present
        clean_text = raw_response.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()
        
        report_data = json.loads(clean_text)
        
        # Verify schema validity and backfill missing fields
        report_data["summary"] = report_data.get("summary", "Document audit complete.")
        report_data["risk_level"] = report_data.get("risk_level", doc.risk_level or "MEDIUM")
        report_data["risk_score"] = float(report_data.get("risk_score", doc.risk_score or 5.0))
        report_data["recommended_actions"] = report_data.get("recommended_actions", [])
        report_data["relevant_laws"] = report_data.get("relevant_laws", [])
        report_data["complaint_template"] = report_data.get("complaint_template", "Draft Template not generated.")
        
        # Cache results in DB
        doc.agent_report = report_data
        db.commit()
        db.refresh(doc)
        
        return report_data
        
    except Exception as e:
        logger.error(f"Error running legal agent: {e}")
        db.rollback()
        raise e
