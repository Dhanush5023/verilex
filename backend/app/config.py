from pydantic_settings import BaseSettings
from functools import lru_cache
import os
import tempfile

# ─── Dynamic Cloud Writable Directory Fallbacks ──────────────────────────────
def get_writable_dir(dir_name: str, default_path: str) -> str:
    path = os.getenv(dir_name.upper(), default_path)
    try:
        os.makedirs(path, exist_ok=True)
        # Test write permission
        test_file = os.path.join(path, ".write_test")
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        return path
    except Exception:
        # Fallback to system temp folder (guaranteed writable on Render/Linux)
        fallback = os.path.join(tempfile.gettempdir(), f"verilex_{dir_name.lower()}")
        os.makedirs(fallback, exist_ok=True)
        return fallback

upload_dir = get_writable_dir("UPLOAD_DIR", "./uploads")
chroma_dir = get_writable_dir("CHROMA_PERSIST_DIR", "./chroma_db")

# Resolve SQLite DB file path
db_url = os.getenv("DATABASE_URL", "sqlite:///./verilex.db")
if db_url.startswith("sqlite:///."):
    # Try testing database file creation in the relative directory
    try:
        db_file = db_url.replace("sqlite:///", "")
        db_dir = os.path.dirname(db_file) or "."
        test_file = os.path.join(db_dir, ".db_write_test")
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
    except Exception:
        # Fallback to temp folder for the database file
        fallback_db = os.path.join(tempfile.gettempdir(), "verilex.db")
        db_url = f"sqlite:///{fallback_db}"

class Settings(BaseSettings):
    # Security
    SECRET_KEY: str = "change-me-in-production-super-long-secret-key-12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Groq LLM
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    # Database
    DATABASE_URL: str = db_url

    # File uploads
    UPLOAD_DIR: str = upload_dir
    MAX_FILE_SIZE_MB: int = 50

    # ChromaDB
    CHROMA_PERSIST_DIR: str = chroma_dir

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

# Ensure finalized directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
