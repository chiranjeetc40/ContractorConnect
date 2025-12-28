"""
OTP (One-Time Password) model for authentication.
"""

from datetime import datetime, timedelta
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base


class OTP(Base):
    """
    OTP model for phone number verification.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        phone_number: Phone number for OTP
        otp_code: The 6-digit OTP code
        purpose: Purpose of OTP (login, registration, verification)
        is_used: Whether OTP has been used
        expires_at: OTP expiration timestamp
        created_at: OTP creation timestamp
    """
    
    __tablename__ = "otps"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Key (optional - for existing users)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    # OTP Details
    phone_number = Column(String(15), index=True, nullable=False)
    otp_code = Column(String(6), nullable=False)
    purpose = Column(String(50), nullable=False, default="login")  # login, registration, verification
    
    # Status
    is_used = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    verified_at = Column(DateTime, nullable=True)
    
    # Relationships
    # user = relationship("User", back_populates="otps")
    
    def __repr__(self):
        return f"<OTP(id={self.id}, phone={self.phone_number}, purpose={self.purpose})>"
    
    @property
    def is_expired(self) -> bool:
        """Check if OTP has expired."""
        return datetime.utcnow() > self.expires_at
    
    @property
    def is_valid(self) -> bool:
        """Check if OTP is valid (not used, not expired)."""
        return not self.is_used and not self.is_expired
    
    @classmethod
    def create_expiry_time(cls, minutes: int = 10) -> datetime:
        """Create expiry time for OTP."""
        return datetime.utcnow() + timedelta(minutes=minutes)
