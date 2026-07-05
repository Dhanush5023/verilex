import os
import uuid
from pathlib import Path
from app.config import settings


ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt", ".png", ".jpg", ".jpeg", ".tiff"}


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def validate_file(filename: str, file_size: int) -> None:
    ext = get_file_extension(filename)
    if ext not in ALLOWED_EXTENSIONS:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB"
        )


def generate_unique_filename(original_filename: str) -> str:
    ext = get_file_extension(original_filename)
    unique_id = uuid.uuid4().hex
    return f"{unique_id}{ext}"


def get_file_type(filename: str) -> str:
    ext = get_file_extension(filename)
    mapping = {
        ".pdf": "pdf",
        ".docx": "docx",
        ".doc": "docx",
        ".txt": "txt",
        ".png": "image",
        ".jpg": "image",
        ".jpeg": "image",
        ".tiff": "image",
    }
    return mapping.get(ext, "unknown")


def save_upload(file_bytes: bytes, filename: str) -> str:
    """Save file bytes to upload directory, return file path."""
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    return file_path
