"""
Database configuration and session management.
"""

from typing import AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Create base class for declarative models
Base = declarative_base()

# Create synchronous engine for migrations and sync operations
sync_engine = create_engine(
    settings.database_url,
    echo=settings.database_echo,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Create session factory for synchronous operations
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine
)


def get_db():
    """
    Dependency for getting database session.
    Use this in FastAPI route dependencies.
    
    Example:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    Note: In production, use Alembic migrations instead.
    """
    # Import all models here to ensure they are registered
    from app.models import user, request, notification, otp  # noqa
    
    Base.metadata.create_all(bind=sync_engine)
