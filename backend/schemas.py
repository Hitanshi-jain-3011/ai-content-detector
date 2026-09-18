from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class HealthResponse(BaseModel):
    """Schema for server health status check."""
    status: str = Field(default="ok", example="ok")
    message: str = Field(default="AI Content Detector API is running", example="AI Content Detector API is running")


class TextAnalysisRequest(BaseModel):
    """Schema for text analysis input."""
    text: str = Field(..., description="The raw text submitted by the user for AI pattern detection.")


class TextAnalysisDetails(BaseModel):
    """Detailed linguistic and structural metrics computed from the text."""
    word_count: int = Field(..., description="Total count of words in the text.")
    sentence_count: int = Field(..., description="Total count of sentences detected.")
    average_sentence_length: float = Field(..., description="Average number of words per sentence.")
    vocabulary_diversity: float = Field(..., description="Type-token ratio (unique words divided by total words).")
    repetition_score: float = Field(..., description="Estimated repetition rate across phrases and word frequencies.")


class TextAnalysisResponse(BaseModel):
    """Response containing estimated AI vs human probability, detailed metrics, and saved analysis ID."""
    id: Optional[int] = Field(default=None, description="Database record ID of the saved analysis.")
    ai_probability: float = Field(..., description="Estimated probability percentage that the content is AI-generated.")
    human_probability: float = Field(..., description="Estimated probability percentage that the content is human-written.")
    details: TextAnalysisDetails = Field(..., description="Breakdown of extracted statistical linguistic metrics.")


class FileAnalysisResponse(BaseModel):
    """Response containing analysis results for an uploaded document."""
    id: Optional[int] = Field(default=None, description="Database record ID of the saved analysis.")
    filename: str = Field(..., description="Original name of the analyzed document.")
    ai_probability: float = Field(..., description="Estimated probability percentage that the content is AI-generated.")
    human_probability: float = Field(..., description="Estimated probability percentage that the content is human-written.")
    details: TextAnalysisDetails = Field(..., description="Breakdown of extracted statistical linguistic metrics.")


class AnalysisRecordResponse(BaseModel):
    """Schema representing an analysis record retrieved from the database."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    analysis_type: str
    filename: Optional[str] = None
    text_preview: Optional[str] = None
    ai_probability: float
    human_probability: float
    word_count: int
    sentence_count: int
    average_sentence_length: float
    vocabulary_diversity: float
    repetition_score: float
    created_at: datetime


class DeleteResponse(BaseModel):
    """Response schema for delete operations."""
    status: str = "ok"
    message: str
