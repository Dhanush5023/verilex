"""
Document Processor — Extract text from PDF/DOCX/TXT/images and split into chunks for embedding.
"""
import io
import re
from typing import List


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using PyPDF2."""
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        texts = []
        for page in reader.pages:
            text = page.extract_text()
            if text and text.strip():
                texts.append(text.strip())
        extracted = "\n\n".join(texts)
        
        # If PDF appears to be scanned (very little text), try OCR
        if len(extracted) < 100:
            from app.services.ocr_service import extract_text_from_pdf_images
            ocr_text = extract_text_from_pdf_images(file_bytes)
            if len(ocr_text) > len(extracted):
                return ocr_text
        return extracted
    except Exception as e:
        return f"[PDF extraction error: {str(e)}]"


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX file."""
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n\n".join(paragraphs)
    except Exception as e:
        return f"[DOCX extraction error: {str(e)}]"


def extract_text_from_image_file(file_bytes: bytes) -> str:
    """Extract text from image using OCR."""
    from app.services.ocr_service import extract_text_from_image
    return extract_text_from_image(file_bytes)


def extract_text(file_bytes: bytes, file_type: str) -> str:
    """Dispatch text extraction based on file type."""
    if file_type == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif file_type == "docx":
        return extract_text_from_docx(file_bytes)
    elif file_type == "txt":
        return file_bytes.decode("utf-8", errors="replace")
    elif file_type == "image":
        return extract_text_from_image_file(file_bytes)
    else:
        try:
            return file_bytes.decode("utf-8", errors="replace")
        except Exception:
            return "[Cannot extract text from this file type]"


def clean_text(text: str) -> str:
    """Basic text cleaning."""
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove non-printable chars
    text = re.sub(r'[^\x20-\x7E\n]', ' ', text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = 800, chunk_overlap: int = 150) -> List[str]:
    """
    Split text into overlapping chunks for vector embedding.
    Prefers splitting on sentence/paragraph boundaries.
    """
    if not text or len(text.strip()) < 50:
        return []

    # Split on paragraphs first
    paragraphs = [p.strip() for p in re.split(r'\n{2,}', text) if p.strip()]
    
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        # If paragraph alone exceeds chunk size, split by sentences
        if len(para) > chunk_size:
            sentences = re.split(r'(?<=[.!?])\s+', para)
            for sentence in sentences:
                if len(current_chunk) + len(sentence) < chunk_size:
                    current_chunk += " " + sentence
                else:
                    if current_chunk.strip():
                        chunks.append(current_chunk.strip())
                    current_chunk = sentence
        else:
            if len(current_chunk) + len(para) < chunk_size:
                current_chunk += "\n" + para
            else:
                if current_chunk.strip():
                    chunks.append(current_chunk.strip())
                current_chunk = para

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # Add overlap: prepend end of previous chunk to each chunk
    overlapped_chunks = []
    for i, chunk in enumerate(chunks):
        if i > 0 and chunk_overlap > 0:
            prev_end = chunks[i - 1][-chunk_overlap:]
            overlapped_chunks.append(prev_end + " " + chunk)
        else:
            overlapped_chunks.append(chunk)
    
    return overlapped_chunks
