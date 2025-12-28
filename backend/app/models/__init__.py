"""
Database models package.

Import all models here to ensure they are registered with SQLAlchemy Base.
"""

from app.models.user import User
from app.models.otp import OTP

__all__ = ["User", "OTP"]
