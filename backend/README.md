# AI Content Detector — FastAPI Backend

A lightweight, beginner-friendly **FastAPI** backend service with **SQLite** and **SQLAlchemy** database integration, supporting text analysis and document extraction (PDF, DOCX, TXT).

---

## Folder Structure

```
backend/
├── main.py               # FastAPI app routes (health, text/file analysis, history CRUD), CORS
├── document_extractor.py # Text extraction module for PDF, DOCX, and TXT files
├── database.py           # SQLite engine, session maker, get_db dependency
├── models.py             # SQLAlchemy Analysis database model
├── schemas.py            # Pydantic request and response schemas
├── detector.py           # Rule-based linguistic metrics & AI probability estimator
├── content_detector.db   # SQLite database file (created automatically on startup)
├── requirements.txt      # Python dependencies
└── README.md             # Backend documentation and testing guide
```

---

## 1. Prerequisites & Dependencies

Make sure you have **Python 3.9+** installed.

Install all backend dependencies:
```powershell
cd C:\Users\hitan\.gemini\antigravity\scratch\ai-content-detector\backend
pip install -r requirements.txt
```

Added dependencies:
- `pypdf>=5.0.0` (for parsing PDF pages and text streams)
- `python-docx>=1.1.0` (for parsing DOCX paragraphs and tables)

---

## 2. Starting the FastAPI Server

Run Uvicorn with auto-reload:
```powershell
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- **Base URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`

---

## 3. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/analyze/text` | Analyze raw text and save summary to SQLite |
| `POST` | `/api/analyze/file` | Multipart upload for PDF, DOCX, or TXT document analysis |
| `GET` | `/api/analyses` | Get all past analyses (newest first) |
| `GET` | `/api/analyses/{id}` | Get one specific analysis record |
| `DELETE` | `/api/analyses/{id}` | Delete an analysis record |

---

## 4. Testing Document Uploads

### A. TXT Upload:
```powershell
curl.exe -X POST "http://127.0.0.1:8000/api/analyze/file" -F "file=@sample.txt"
```

### B. PDF Upload:
```powershell
curl.exe -X POST "http://127.0.0.1:8000/api/analyze/file" -F "file=@document.pdf"
```

### C. DOCX Upload:
```powershell
curl.exe -X POST "http://127.0.0.1:8000/api/analyze/file" -F "file=@paper.docx"
```

### D. Validation Rules
- Supported extensions: `.pdf`, `.docx`, `.txt`
- Maximum file size: `10 MB`
- Rejects empty files (0 bytes) or documents without readable text
- Corrupted files return descriptive HTTP 400 errors
