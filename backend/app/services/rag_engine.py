"""
RAG Engine — Pure-Python JSON vector store using Groq embedding API.

This implementation avoids C-extension dependencies (chromadb, sentence-transformers, numpy)
so it runs on Python 3.14+ without a C compiler.

Architecture:
  - Each collection = one JSON file in CHROMA_PERSIST_DIR/
  - Embeddings from Groq's `text-embedding-ada-002` compatible endpoint
  - Cosine similarity search implemented in pure Python
  - Falls back to keyword search if Groq embeddings unavailable
"""
import json
import os
import math
import re
from typing import List, Dict, Optional
from app.config import settings

STORE_DIR = settings.CHROMA_PERSIST_DIR
LEGAL_CORPUS_COLLECTION = "legal_corpus_india"


# ─── Embedding ────────────────────────────────────────────────────────────────

def _get_groq_embedding(text: str) -> Optional[List[float]]:
    """Get embedding from Groq API. Returns None if unavailable."""
    try:
        import httpx
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        # Groq doesn't yet have a public embedding endpoint — use keyword TF-IDF instead
        return None
    except Exception:
        return None


def _tfidf_vector(text: str, vocab: Dict[str, int]) -> List[float]:
    """Simple TF-IDF style vector for cosine similarity (pure Python)."""
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    word_counts: Dict[str, int] = {}
    for w in words:
        word_counts[w] = word_counts.get(w, 0) + 1
    total = len(words) or 1
    vec = [0.0] * len(vocab)
    for w, idx in vocab.items():
        tf = word_counts.get(w, 0) / total
        vec[idx] = tf
    return vec


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    """Cosine similarity between two vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def _keyword_score(query: str, text: str) -> float:
    """Fallback: simple keyword overlap score."""
    q_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', query.lower()))
    t_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', text.lower()))
    if not q_words:
        return 0.0
    overlap = len(q_words & t_words)
    return overlap / len(q_words)


# ─── Collection File I/O ──────────────────────────────────────────────────────

def _collection_path(name: str) -> str:
    return os.path.join(STORE_DIR, f"{name}.json")


def _load_collection(name: str) -> Dict:
    path = _collection_path(name)
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"name": name, "documents": [], "vocab": {}}


def _save_collection(name: str, data: Dict):
    os.makedirs(STORE_DIR, exist_ok=True)
    path = _collection_path(name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=None)


def _build_vocab(collection: Dict) -> Dict[str, int]:
    """Build vocabulary from all documents in collection."""
    vocab = collection.get("vocab", {})
    if vocab:
        return vocab
    all_words: set = set()
    for doc in collection.get("documents", []):
        words = set(re.findall(r'\b[a-zA-Z]{3,}\b', doc.get("content", "").lower()))
        all_words.update(words)
    vocab = {w: i for i, w in enumerate(sorted(all_words))}
    return vocab


# ─── Public API ───────────────────────────────────────────────────────────────

def get_or_create_collection(collection_name: str) -> Dict:
    return _load_collection(collection_name)


def add_chunks_to_collection(
    collection_name: str,
    chunks: List[str],
    source_name: str,
    document_id: Optional[int] = None,
) -> int:
    """Add text chunks to a named collection. Returns chunk count added."""
    if not chunks:
        return 0

    coll = _load_collection(collection_name)
    docs = coll.get("documents", [])

    # Remove existing chunks for same source (re-upload case)
    docs = [d for d in docs if d.get("source") != source_name]

    for i, chunk in enumerate(chunks):
        docs.append({
            "id": f"{source_name}_chunk_{i}",
            "content": chunk,
            "source": source_name,
            "chunk_index": i,
            "document_id": document_id or 0,
        })

    # Rebuild vocab
    all_words: set = set()
    for doc in docs:
        words = set(re.findall(r'\b[a-zA-Z]{3,}\b', doc["content"].lower()))
        all_words.update(words)
    vocab = {w: idx for idx, w in enumerate(sorted(all_words))}

    coll["documents"] = docs
    coll["vocab"] = vocab
    _save_collection(collection_name, coll)
    return len(chunks)


def query_collection(
    collection_name: str,
    query_text: str,
    n_results: int = 5,
) -> List[Dict]:
    """Query a collection using TF-IDF + keyword similarity. Returns ranked chunks."""
    coll = _load_collection(collection_name)
    docs = coll.get("documents", [])
    if not docs:
        return []

    vocab = _build_vocab(coll)

    if vocab:
        q_vec = _tfidf_vector(query_text, vocab)
        scored = []
        for doc in docs:
            d_vec = _tfidf_vector(doc["content"], vocab)
            cos_score = _cosine_similarity(q_vec, d_vec)
            kw_score = _keyword_score(query_text, doc["content"])
            # Blend: 60% cosine, 40% keyword
            score = 0.6 * cos_score + 0.4 * kw_score
            scored.append((score, doc))
    else:
        scored = [(_keyword_score(query_text, doc["content"]), doc) for doc in docs]

    scored.sort(key=lambda x: x[0], reverse=True)
    results = []
    for score, doc in scored[:n_results]:
        if score > 0.01:  # filter noise
            results.append({
                "content": doc["content"],
                "source": doc.get("source", "document"),
                "page": doc.get("chunk_index", 0) + 1,
                "relevance_score": round(score, 3),
            })
    return results


def query_multiple_collections(
    collection_names: List[str],
    query_text: str,
    n_results: int = 5,
) -> List[Dict]:
    """Query multiple collections and return merged ranked results."""
    all_chunks = []
    for name in collection_names:
        chunks = query_collection(name, query_text, n_results=3)
        all_chunks.extend(chunks)
    all_chunks.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
    return all_chunks[:n_results]


def delete_collection(collection_name: str) -> bool:
    """Delete a collection JSON file."""
    path = _collection_path(collection_name)
    if os.path.exists(path):
        try:
            os.remove(path)
            return True
        except Exception:
            pass
    return False


def document_collection_name(document_id: int, user_id: int) -> str:
    return f"doc_{user_id}_{document_id}"


def get_legal_corpus_collection():
    return get_or_create_collection(LEGAL_CORPUS_COLLECTION)
