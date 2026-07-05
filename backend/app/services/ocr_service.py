"""
OCR Service — Extract text from scanned documents and images using Tesseract.
Falls back gracefully if Tesseract is not installed.
"""
import io
from typing import Optional

try:
    import pytesseract
    from PIL import Image
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False


def extract_text_from_image(image_bytes: bytes) -> str:
    """Extract text from image bytes using Tesseract OCR."""
    if not TESSERACT_AVAILABLE:
        return "[OCR not available: install Tesseract and pytesseract]"
    try:
        image = Image.open(io.BytesIO(image_bytes))
        # Convert to RGB if needed (for TIFF, etc.)
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        text = pytesseract.image_to_string(image, lang="eng")
        return text.strip()
    except Exception as e:
        return f"[OCR error: {str(e)}]"


def extract_text_from_pdf_images(pdf_bytes: bytes) -> str:
    """Extract text from PDF using OCR (for scanned PDFs without text layer)."""
    if not TESSERACT_AVAILABLE:
        return "[OCR not available]"
    try:
        from pdf2image import convert_from_bytes
        images = convert_from_bytes(pdf_bytes, dpi=200)
        texts = []
        for img in images:
            text = pytesseract.image_to_string(img, lang="eng")
            if text.strip():
                texts.append(text.strip())
        return "\n\n".join(texts)
    except Exception as e:
        return f"[PDF OCR error: {str(e)}]"
