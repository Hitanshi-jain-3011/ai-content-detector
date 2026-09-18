from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base


class Analysis(Base):
    """
    Analysis database model for recording content detection scans.
    Stores metadata, probabilities, and linguistic metrics without persisting full user texts.
    """
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_type = Column(String(50), nullable=False, default="text")
    filename = Column(String(255), nullable=True)
    text_preview = Column(String(500), nullable=True)
    ai_probability = Column(Float, nullable=False)
    human_probability = Column(Float, nullable=False)
    word_count = Column(Integer, nullable=False)
    sentence_count = Column(Integer, nullable=False)
    average_sentence_length = Column(Float, nullable=False)
    vocabulary_diversity = Column(Float, nullable=False)
    repetition_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
