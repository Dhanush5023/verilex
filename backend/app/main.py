from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.config import settings
from app.database import create_tables
from app.routers import auth, documents, chat, complaints, scam, agent
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print("🚀 VeriLex API starting up...")
    create_tables()
    print("✅ Database tables created/verified.")
    yield
    print("🛑 VeriLex API shutting down.")


app = FastAPI(
    title="VeriLex API",
    description="""
## VeriLex — AI-Powered Legal & Civic Assistance Platform

### Modules
- **Module 1**: Document Intelligence Engine — Upload & analyze legal documents
- **Module 2**: Complaint Drafter — Generate formal complaint letters
- **Module 3**: Scam Detector — Detect fraud in job/loan/investment offers
- **Module 4**: Legal RAG Chatbot — Ask legal questions with citations

### Authentication
Use the `/auth/register` endpoint to create an account, then `/auth/login` to get a JWT token.
Pass the token as `Authorization: Bearer <token>` header.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(complaints.router, prefix="/api/v1")
app.include_router(scam.router, prefix="/api/v1")
app.include_router(agent.router, prefix="/api/v1")


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "app": "VeriLex API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
