# ⚖️ VeriLex — AI-Powered Legal & Civic Assistance Platform

> **Final Year Project** | ML/AI + Full-Stack Engineering | Python • FastAPI • React • ChromaDB • Groq LLM

VeriLex is a full-stack, production-grade AI platform that helps Indian citizens navigate legal documents, file complaints, detect scams, and ask legal questions — all powered by RAG (Retrieval-Augmented Generation) + LLM.

---

## 🌟 Live Modules

| Module | Description | Tech |
|--------|-------------|------|
| 📄 **Document Intelligence** | Upload legal docs → AI flags risky clauses, explains in plain English | OCR + RAG + LLM |
| ✍️ **Complaint Drafter** | Describe issue → get formal complaint letter with legal references | LLM + Prompting |
| 🛡️ **Scam Detector** | Paste suspicious offer → risk score + red flag analysis | LLM Classification |
| 💬 **Legal RAG Chatbot** | Ask legal Q&A → cited answers from Indian law corpus | ChromaDB + RAG |

---

## 🛠️ Tech Stack

**Backend**
- FastAPI (async REST API)
- SQLAlchemy + SQLite (PostgreSQL-ready)
- ChromaDB (vector store for RAG)
- Groq API — `llama-3.1-8b-instant` (free, fast LLM)
- `sentence-transformers/all-MiniLM-L6-v2` (local embeddings — zero cost)
- PyPDF2 + python-docx + Tesseract OCR
- JWT Authentication (bcrypt + python-jose)

**Frontend**
- React 18 + Vite
- React Router v6
- Axios (API client)
- Lucide React (icons)
- React Hot Toast
- Vanilla CSS with Glassmorphism design system

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Groq API key](https://console.groq.com) (free)

### Step 1 — Backend Setup

```bash
cd backend

# Option A: Use the setup script (Windows)
setup.bat

# Option B: Manual
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
```

### Step 2 — Configure API Key

Edit `backend/.env` and add your Groq API key:
```
GROQ_API_KEY=your-key-here
```
Get a free key at → https://console.groq.com

### Step 3 — Start Backend

```bash
# Windows
start_backend.bat

# Manual
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Step 4 — Frontend Setup & Run

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:5173

---

## 📁 Project Structure

```
verilex/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── config.py            # Settings
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── models/              # DB models (User, Document, Chat, Complaint, ScamCheck)
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── routers/             # API endpoints (auth, documents, chat, complaints, scam)
│   │   ├── services/
│   │   │   ├── llm_service.py   # Groq LLM wrapper + all module prompts
│   │   │   ├── rag_engine.py    # ChromaDB vector store + retrieval
│   │   │   ├── doc_processor.py # PDF/DOCX text extraction + chunking
│   │   │   └── ocr_service.py   # Tesseract OCR for scanned docs
│   │   └── utils/
│   │       ├── auth.py          # JWT + bcrypt
│   │       └── file_utils.py    # File handling
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── App.jsx              # Router + layout
    │   ├── pages/               # Landing, Login, Register, Dashboard, all 4 modules
    │   ├── components/          # Sidebar, RiskBadge, LoadingSpinner
    │   ├── context/             # AuthContext
    │   └── services/api.js      # Axios API client
    └── package.json
```

---

## 🔑 API Endpoints

```
POST   /api/v1/auth/register         Register new user
POST   /api/v1/auth/login            Login + get JWT
GET    /api/v1/auth/me               Get current user

POST   /api/v1/documents/upload      Upload document (Module 1)
GET    /api/v1/documents/            List user documents
GET    /api/v1/documents/{id}        Get analysis results

POST   /api/v1/chat/sessions         Create chat session (Module 4)
POST   /api/v1/chat/sessions/{id}/ask  Ask a legal question
GET    /api/v1/chat/sessions         List sessions

POST   /api/v1/complaints/draft      Draft formal complaint (Module 2)
GET    /api/v1/complaints/           List user complaints

POST   /api/v1/scam-check/analyze    Analyze for scam (Module 3)
GET    /api/v1/scam-check/history    Get scam check history
```

---

## 💡 Key Features (Resume Bullets)

- Built a full-stack AI legal platform with **4 integrated NLP modules** using FastAPI + React + ChromaDB
- Implemented a **RAG pipeline** using ChromaDB vector store + sentence-transformers embeddings + Groq LLM for grounded legal Q&A
- Built an **OCR pipeline** (Tesseract) for scanned document text extraction with intelligent PDF parsing
- Designed a **document analysis engine** that extracts, chunks, embeds, and LLM-analyzes legal documents for risky clauses
- Implemented **JWT authentication** with bcrypt password hashing and SQLAlchemy ORM
- Built a **scam detection system** that scores fraud risk and generates structured red-flag explanations using prompt engineering
- Designed a **glassmorphism dark-mode UI** with custom CSS design system, responsive layout, and micro-animations

---

## 📝 License

MIT License — Free to use for educational and personal projects.

---

*Built with ❤️ for final year CSE submission | AI + Full-Stack Engineering*
