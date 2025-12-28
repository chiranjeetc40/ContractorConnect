"""
OTP service for generating and managing OTPs.
"""

import random
import string
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.repositories.otp_repository import OTPRepository
from app.core.config import settings


class OTPService:
    """Service for OTP operations."""
    
    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db
        self.otp_repo = OTPRepository(db)
    
    def generate_otp_code(self, length: int = 6) -> str:
        """
        Generate a random OTP code.
        
        Args:
            length: Length of OTP (default 6)
            
        Returns:
            OTP code as string
        """
        return ''.join(random.choices(string.digits, k=length))
    
    def create_otp(
        self,
        phone_number: str,
        purpose: str = "login",
        user_id: Optional[int] = None
    ) -> tuple[str, datetime]:
        """
        Create and send OTP to phone number.
        
        Args:
            phone_number: Phone number to send OTP
            purpose: Purpose of OTP (login, registration, verification)
            user_id: Optional user ID for existing users
            
        Returns:
            Tuple of (OTP code, expiry time)
        """
        # Check rate limiting
        recent_count = self.otp_repo.count_recent_attempts(phone_number, minutes=5)
        if recent_count >= 3:
            raise ValueError("Too many OTP requests. Please try again after 5 minutes.")
        
        # Invalidate previous OTPs
        self.otp_repo.invalidate_previous_otps(phone_number, purpose)
        
        # Generate new OTP
        otp_code = self.generate_otp_code(length=settings.otp_length)
        expires_at = datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes)
        
        # Save to database
        otp_data = {
            "phone_number": phone_number,
            "otp_code": otp_code,
            "purpose": purpose,
            "user_id": user_id,
            "expires_at": expires_at,
        }
        self.otp_repo.create(otp_data)
        
        # TODO: Send OTP via SMS provider (Twilio, etc.)
        # For now, just log it (in production, send via SMS)
        print(f"📱 OTP for {phone_number}: {otp_code} (expires in {settings.otp_expire_minutes} min)")
        
        return otp_code, expires_at
    
    def verify_otp(
        self,
        phone_number: str,
        otp_code: str,
        purpose: str = "login"
    ) -> bool:
        """
        Verify OTP code.
        
        Args:
            phone_number: Phone number
            otp_code: OTP code to verify
            purpose: Purpose of OTP
            
        Returns:
            True if valid, raises ValueError if invalid
        """
        # Get valid OTP
        otp = self.otp_repo.get_valid_otp(phone_number, otp_code, purpose)
        
        if not otp:
            raise ValueError("Invalid or expired OTP code")
        
        # Mark as used
        self.otp_repo.mark_as_used(otp)
        
        return True
    
    def resend_otp(self, phone_number: str, purpose: str = "login") -> tuple[str, datetime]:
        """
        Resend OTP (same as creating new one).
        
        Args:
            phone_number: Phone number
            purpose: Purpose of OTP
            
        Returns:
            Tuple of (OTP code, expiry time)
        """
        return self.create_otp(phone_number, purpose)
    
    def cleanup_expired_otps(self, days_old: int = 7) -> int:
        """
        Delete old expired OTPs.
        
        Args:
            days_old: Delete OTPs older than this many days
            
        Returns:
            Number of OTPs deleted
        """
        return self.otp_repo.delete_expired(days_old)
