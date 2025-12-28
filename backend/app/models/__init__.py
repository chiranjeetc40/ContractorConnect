"""
Database models package.

Import all models here to ensure they are registered with SQLAlchemy Base.
"""

from app.models.user import User
from app.models.otp import OTP
from app.models.request import Request

__all__ = ["User", "OTP", "Request"]
