from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite Database URL
# Stored locally inside the backend directory as content_detector.db
SQLALCHEMY_DATABASE_URL = "sqlite:///./content_detector.db"

# Create SQLite engine
# check_same_thread=False is required for SQLite to allow multiple threads in FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base model
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session per request
    and ensures it is properly closed when the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
