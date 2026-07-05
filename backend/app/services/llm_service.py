"""
LLM Service — Groq API wrapper with structured prompting for all modules.
Uses llama-3.1-8b-instant (free, fast) via Groq.
Falls back to a mock response if API key is not set (for testing).
"""
import json
import re
from typing import Optional
from groq import Groq
from app.config import settings

_client: Optional[Groq] = None


def get_client() -> Optional[Groq]:
    global _client
    if _client is None and settings.GROQ_API_KEY:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def chat_completion(system_prompt: str, user_message: str, temperature: float = 0.3) -> str:
    """Call Groq LLM and return text response."""
    client = get_client()
    if not client:
        return "⚠️ LLM not configured. Please set GROQ_API_KEY in your .env file."
    
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=temperature,
        max_tokens=4096,
    )
    return response.choices[0].message.content


def extract_json_from_response(text: str) -> dict:
    """Extract JSON from LLM response that may have markdown code blocks."""
    # Try to find JSON in code block
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass
    # Try to parse entire response as JSON
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    # Try to find a JSON object within the text
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return {}


# ─── Module 1: Document Analysis ─────────────────────────────────────────────

DOCUMENT_ANALYSIS_SYSTEM = """You are VeriLex's Document Intelligence Engine — an expert legal analyst specializing in Indian law.

Your task: Analyze legal documents and return ONLY a JSON response (no other text).

Analyze for:
1. Document type (rental, loan, employment, insurance, affidavit, other)
2. Summary in plain English (3-5 sentences, layman-friendly)
3. Risk score (0.0-10.0) and risk level (LOW/MEDIUM/HIGH/CRITICAL)
4. Flagged clauses — unfair, hidden, or risky terms
5. Key terms — important dates, amounts, parties, obligations

Return exactly this JSON structure:
{
  "document_type": "rental|loan|employment|insurance|affidavit|other",
  "summary": "plain English summary",
  "risk_score": 4.5,
  "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "flagged_clauses": [
    {"clause": "exact text or paraphrase", "reason": "why it's risky", "severity": "LOW|MEDIUM|HIGH"}
  ],
  "key_terms": ["term1", "term2", "..."]
}"""


def analyze_document(text_content: str) -> dict:
    """Analyze a legal document and return structured results."""
    # Truncate to avoid token limits
    truncated = text_content[:6000] if len(text_content) > 6000 else text_content
    response = chat_completion(
        system_prompt=DOCUMENT_ANALYSIS_SYSTEM,
        user_message=f"Analyze this document:\n\n{truncated}",
        temperature=0.2,
    )
    result = extract_json_from_response(response)
    # Ensure required fields
    result.setdefault("document_type", "other")
    result.setdefault("summary", response[:500] if not result else "Document analyzed.")
    result.setdefault("risk_score", 5.0)
    result.setdefault("risk_level", "MEDIUM")
    result.setdefault("flagged_clauses", [])
    result.setdefault("key_terms", [])
    return result


# ─── Module 2: Complaint Drafter ──────────────────────────────────────────────

COMPLAINT_SYSTEM = """You are VeriLex's Complaint Drafter — an expert in Indian consumer rights, tenant law, employment law, and digital fraud.

Your task: Draft a formal complaint letter based on the user's issue description.

Categories: consumer, tenant, employment, digital_fraud, banking, telecom, government, other

Return ONLY this JSON structure:
{
  "category": "consumer|tenant|employment|digital_fraud|banking|telecom|government|other",
  "complaint_title": "Brief formal title",
  "formal_complaint": "Full formal complaint letter text",
  "filing_authority": "Name of the authority to file with",
  "filing_portal": "URL or office address",
  "legal_references": ["Consumer Protection Act 2019 Section X", "..."]
}"""


def draft_complaint(issue_description: str, category_hint: str = None) -> dict:
    """Generate a formal complaint from a user's description."""
    context = f"Category hint: {category_hint}\n" if category_hint else ""
    response = chat_completion(
        system_prompt=COMPLAINT_SYSTEM,
        user_message=f"{context}Issue: {issue_description}",
        temperature=0.3,
    )
    result = extract_json_from_response(response)
    result.setdefault("category", "other")
    result.setdefault("complaint_title", "Formal Complaint")
    result.setdefault("formal_complaint", response)
    result.setdefault("filing_authority", "Consumer Disputes Redressal Commission")
    result.setdefault("filing_portal", "https://consumerhelpline.gov.in")
    result.setdefault("legal_references", [])
    return result


# ─── Module 3: Scam Detector ──────────────────────────────────────────────────

SCAM_SYSTEM = """You are VeriLex's Scam & Fraud Risk Detector — an expert in identifying fraudulent job offers, loan scams, investment fraud, and online deception targeting Indians.

Your task: Analyze the provided text and return a structured risk assessment.

Risk levels: SAFE (0-20), LOW (21-40), MEDIUM (41-60), HIGH (61-80), CRITICAL (81-100)

Common red flags:
- Upfront payment/registration fees
- Unsolicited offers with unrealistic returns/salary
- Urgency and pressure tactics
- Vague company details
- Requests for OTP/banking details

Return ONLY this JSON structure:
{
  "check_type": "job_offer|loan_offer|investment|message|other",
  "risk_score": 75.0,
  "risk_level": "SAFE|LOW|MEDIUM|HIGH|CRITICAL",
  "verdict": "One sentence verdict",
  "red_flags": [
    {"flag": "flag name", "explanation": "why this is suspicious", "severity": "LOW|MEDIUM|HIGH|CRITICAL"}
  ],
  "safe_signals": ["positive indicator 1", "..."],
  "recommendation": "What the user should do next"
}"""


def detect_scam(input_text: str, check_type: str = "auto") -> dict:
    """Analyze text for scam/fraud indicators."""
    context = f"Type hint: {check_type}\n" if check_type and check_type != "auto" else ""
    response = chat_completion(
        system_prompt=SCAM_SYSTEM,
        user_message=f"{context}Analyze this:\n\n{input_text}",
        temperature=0.2,
    )
    result = extract_json_from_response(response)
    result.setdefault("check_type", "other")
    result.setdefault("risk_score", 50.0)
    result.setdefault("risk_level", "MEDIUM")
    result.setdefault("verdict", "Could not determine risk level.")
    result.setdefault("red_flags", [])
    result.setdefault("safe_signals", [])
    result.setdefault("recommendation", "Exercise caution.")
    return result


# ─── Module 4: Legal Q&A ──────────────────────────────────────────────────────

LEGAL_QA_SYSTEM = """You are VeriLex — an AI legal assistant specializing in Indian law for common citizens.

Rules:
1. Answer ONLY based on provided context (retrieved legal documents). Do NOT hallucinate laws.
2. If context is insufficient, say so clearly and advise consulting a lawyer.
3. Always cite the specific Act, Section, or Rule you're referring to.
4. Use simple, plain language. Avoid jargon.
5. Add disclaimer: "This is informational only, not legal advice."

Context will be provided in [CONTEXT] blocks."""


def answer_legal_question(question: str, context_chunks: list) -> str:
    """Answer a legal question using retrieved context chunks."""
    if context_chunks:
        context_text = "\n\n".join([
            f"[CONTEXT from {c.get('source', 'document')}]:\n{c.get('content', '')}"
            for c in context_chunks
        ])
        user_msg = f"Context:\n{context_text}\n\nQuestion: {question}"
    else:
        user_msg = f"Question: {question}\n\nNote: No specific document context available. Answer from general knowledge of Indian law only."
    
    return chat_completion(
        system_prompt=LEGAL_QA_SYSTEM,
        user_message=user_msg,
        temperature=0.3,
    )
