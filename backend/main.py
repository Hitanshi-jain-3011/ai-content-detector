import os
from typing import List
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
from schemas import (
    HealthResponse,
    TextAnalysisRequest,
    TextAnalysisResponse,
    FileAnalysisResponse,
    AnalysisRecordResponse,
    DeleteResponse,
)
from detector import analyze_text
from document_extractor import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_text_from_txt,
)

# Create database tables automatically upon startup
Base.metadata.create_all(bind=engine)

# Initialize FastAPI application
app = FastAPI(
    title="AI Content Detector API",
    description="Backend service providing text and document AI content detection, pattern analysis, and SQLite history persistence.",
    version="1.2.0",
)

# Configure Cross-Origin Resource Sharing (CORS)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants for document validation
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_FILE_EXTENSIONS = {".pdf", ".docx", ".txt"}


@app.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Health check endpoint",
)
def get_health() -> HealthResponse:
    """Returns the server health status and confirmation message."""
    return HealthResponse(
        status="ok",
        message="AI Content Detector API is running",
    )


@app.post(
    "/api/analyze/text",
    response_model=TextAnalysisResponse,
    tags=["Analysis"],
    summary="Analyze submitted text and save the record to the database",
)
def analyze_text_endpoint(
    payload: TextAnalysisRequest,
    db: Session = Depends(get_db)
) -> TextAnalysisResponse:
    """
    Analyzes raw text using rule-based linguistic metrics, estimates AI likelihood,
    and automatically persists a lightweight summary record into SQLite.
    """
    cleaned_text = payload.text.strip() if payload.text else ""
    if not cleaned_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty. Please provide text to analyze.",
        )

    try:
        result = analyze_text(cleaned_text)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during analysis: {str(err)}",
        )

    # Truncated preview for privacy and storage efficiency
    preview = cleaned_text[:140] + ("..." if len(cleaned_text) > 140 else "")

    record_id = None
    try:
        details = result["details"]
        analysis_record = models.Analysis(
            analysis_type="text",
            filename=None,
            text_preview=preview,
            ai_probability=result["ai_probability"],
            human_probability=result["human_probability"],
            word_count=details["word_count"],
            sentence_count=details["sentence_count"],
            average_sentence_length=details["average_sentence_length"],
            vocabulary_diversity=details["vocabulary_diversity"],
            repetition_score=details["repetition_score"],
        )
        db.add(analysis_record)
        db.commit()
        db.refresh(analysis_record)
        record_id = analysis_record.id
    except Exception as db_err:
        db.rollback()
        print(f"Warning: Failed to save analysis record to database: {db_err}")

    return TextAnalysisResponse(
        id=record_id,
        ai_probability=result["ai_probability"],
        human_probability=result["human_probability"],
        details=result["details"],
    )


@app.post(
    "/api/analyze/file",
    response_model=FileAnalysisResponse,
    tags=["Analysis"],
    summary="Upload and analyze a PDF, DOCX, or TXT document",
)
async def analyze_file_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> FileAnalysisResponse:
    """
    Accepts multipart document upload (PDF, DOCX, TXT), validates format and size,
    extracts textual content, applies the rule-based detector, and persists the record.
    """
    # 1. Validate filename and extension
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file has no filename.",
        )

    filename = file.filename
    _, ext = os.path.splitext(filename)
    ext = ext.lower()

    if ext not in ALLOWED_FILE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: PDF, DOCX, TXT.",
        )

    # 2. Read and validate binary content
    try:
        content = await file.read()
    except Exception as read_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(read_err)}",
        )

    # Check empty file
    if not content or len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )

    # Check maximum file size (10 MB)
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 10 MB.",
        )

    # 3. Extract text according to document type
    try:
        if ext == ".pdf":
            extracted_text = extract_text_from_pdf(content)
        elif ext == ".docx":
            extracted_text = extract_text_from_docx(content)
        elif ext == ".txt":
            extracted_text = extract_text_from_txt(content)
        else:
            raise ValueError(f"Unsupported format {ext}")
    except ValueError as parse_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(parse_err),
        )
    except Exception as general_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract text from document: {str(general_err)}",
        )

    # Validate that readable text was extracted
    if not extracted_text or not extracted_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No readable text could be extracted from the document. The file may be empty or contain only non-text images.",
        )

    # 4. Process extracted text through the existing detection function (reused)
    try:
        result = analyze_text(extracted_text)
    except ValueError as detector_val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(detector_val_err),
        )
    except Exception as detector_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during text analysis: {str(detector_err)}",
        )

    # 5. Create short text preview (never persist entire extracted text)
    preview = extracted_text[:140] + ("..." if len(extracted_text) > 140 else "")

    # 6. Save result to SQLite database as 'FILE' type
    record_id = None
    try:
        details = result["details"]
        analysis_record = models.Analysis(
            analysis_type="FILE",
            filename=filename,
            text_preview=preview,
            ai_probability=result["ai_probability"],
            human_probability=result["human_probability"],
            word_count=details["word_count"],
            sentence_count=details["sentence_count"],
            average_sentence_length=details["average_sentence_length"],
            vocabulary_diversity=details["vocabulary_diversity"],
            repetition_score=details["repetition_score"],
        )
        db.add(analysis_record)
        db.commit()
        db.refresh(analysis_record)
        record_id = analysis_record.id
    except Exception as db_err:
        db.rollback()
        print(f"Warning: Failed to save file analysis record to database: {db_err}")

    return FileAnalysisResponse(
        id=record_id,
        filename=filename,
        ai_probability=result["ai_probability"],
        human_probability=result["human_probability"],
        details=result["details"],
    )


@app.get(
    "/api/analyses",
    response_model=List[AnalysisRecordResponse],
    tags=["History"],
    summary="Retrieve all analysis records (newest first)",
)
def get_all_analyses(db: Session = Depends(get_db)) -> List[AnalysisRecordResponse]:
    """Returns all analysis records from SQLite ordered by newest first."""
    return (
        db.query(models.Analysis)
        .order_by(models.Analysis.created_at.desc(), models.Analysis.id.desc())
        .all()
    )


@app.get(
    "/api/analyses/{analysis_id}",
    response_model=AnalysisRecordResponse,
    tags=["History"],
    summary="Retrieve a specific analysis record by ID",
)
def get_analysis_by_id(
    analysis_id: int,
    db: Session = Depends(get_db)
) -> AnalysisRecordResponse:
    """Returns a single analysis record by its primary key ID."""
    record = db.query(models.Analysis).filter(models.Analysis.id == analysis_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis record with ID {analysis_id} not found.",
        )
    return record


@app.delete(
    "/api/analyses/{analysis_id}",
    response_model=DeleteResponse,
    tags=["History"],
    summary="Delete an analysis record by ID",
)
def delete_analysis_by_id(
    analysis_id: int,
    db: Session = Depends(get_db)
) -> DeleteResponse:
    """Deletes an analysis record from the database by its ID."""
    record = db.query(models.Analysis).filter(models.Analysis.id == analysis_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis record with ID {analysis_id} not found.",
        )
    db.delete(record)
    db.commit()
    return DeleteResponse(
        status="ok",
        message=f"Analysis record with ID {analysis_id} was deleted successfully.",
    )
