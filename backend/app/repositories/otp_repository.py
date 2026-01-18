"""
OTP repository for database operations.
"""

from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.otp import OTP


class OTPRepository:
    """Repository for OTP database operations."""
    
    def __init__(self, db: Session):
        """Initialize repository with database session."""
        self.db = db
    
    def create(self, otp_data: dict) -> OTP:
        """
        Create a new OTP record.
        
        Args:
            otp_data: Dictionary with OTP data
            
        Returns:
            Created OTP object
        """
        otp = OTP(**otp_data)
        self.db.add(otp)
        self.db.commit()
        self.db.refresh(otp)
        return otp
    
    def get_by_id(self, otp_id: int) -> Optional[OTP]:
        """
        Get OTP by ID.
        
        Args:
            otp_id: OTP ID
            
        Returns:
            OTP object or None
        """
        return self.db.query(OTP).filter(OTP.id == otp_id).first()
    
    def get_latest_by_phone(self, phone_number: str, purpose: str = "login") -> Optional[OTP]:
        """
        Get the latest OTP for a phone number and purpose.
        
        Args:
            phone_number: Phone number
            purpose: OTP purpose (login, registration, verification)
            
        Returns:
            OTP object or None
        """
        return (
            self.db.query(OTP)
            .filter(OTP.phone_number == phone_number, OTP.purpose == purpose)
            .order_by(OTP.created_at.desc())
            .first()
        )
    
    def get_valid_otp(self, identifier: str, otp_code: str, purpose: str = "login") -> Optional[OTP]:
        """
        Get valid (not used, not expired) OTP for verification.
        Supports both phone number and email.
        
        Args:
            identifier: Phone number or email
            otp_code: OTP code
            purpose: OTP purpose
            
        Returns:
            OTP object or None
        """
        now = datetime.utcnow()
        
        # Check if identifier is email
        is_email = '@' in identifier
        
        if is_email:
            return (
                self.db.query(OTP)
                .filter(
                    OTP.email == identifier,
                    OTP.otp_code == otp_code,
                    OTP.purpose == purpose,
                    OTP.is_used == False,
                    OTP.expires_at > now
                )
                .first()
            )
        else:
            return (
                self.db.query(OTP)
                .filter(
                    OTP.phone_number == identifier,
                    OTP.otp_code == otp_code,
                    OTP.purpose == purpose,
                    OTP.is_used == False,
                    OTP.expires_at > now
                )
                .first()
            )
    
    def mark_as_used(self, otp: OTP) -> OTP:
        """
        Mark OTP as used.
        
        Args:
            otp: OTP object
            
        Returns:
            Updated OTP object
        """
        otp.is_used = True
        otp.is_verified = True
        otp.verified_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(otp)
        return otp
    
    def invalidate_previous_otps(self, identifier: str, purpose: str = "login") -> int:
        """
        Invalidate (mark as used) all previous OTPs for a phone number or email.
        
        Args:
            identifier: Phone number or email
            purpose: OTP purpose
            
        Returns:
            Number of OTPs invalidated
        """
        is_email = '@' in identifier
        
        if is_email:
            count = (
                self.db.query(OTP)
                .filter(
                    OTP.email == identifier,
                    OTP.purpose == purpose,
                    OTP.is_used == False
                )
                .update({"is_used": True})
            )
        else:
            count = (
                self.db.query(OTP)
                .filter(
                    OTP.phone_number == identifier,
                    OTP.purpose == purpose,
                    OTP.is_used == False
                )
                .update({"is_used": True})
            )
        self.db.commit()
        return count
    
    def delete_expired(self, days_old: int = 7) -> int:
        """
        Delete expired OTPs older than specified days.
        
        Args:
            days_old: Delete OTPs older than this many days
            
        Returns:
            Number of OTPs deleted
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        count = (
            self.db.query(OTP)
            .filter(OTP.created_at < cutoff_date)
            .delete()
        )
        self.db.commit()
        return count
    
    def get_recent_otps(self, phone_number: str, minutes: int = 5) -> List[OTP]:
        """
        Get OTPs sent to a phone number in recent minutes.
        Used for rate limiting.
        
        Args:
            phone_number: Phone number
            minutes: Recent minutes to check
            
        Returns:
            List of OTP objects
        """
        cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
        return (
            self.db.query(OTP)
            .filter(
                OTP.phone_number == phone_number,
                OTP.created_at > cutoff_time
            )
            .all()
        )
    
    def count_recent_attempts(self, identifier: str, minutes: int = 5) -> int:
        """
        Count OTP attempts for rate limiting. Supports phone and email.
        
        Args:
            identifier: Phone number or email
            minutes: Recent minutes to check
            
        Returns:
            Number of OTP attempts
        """
        cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
        is_email = '@' in identifier
        
        if is_email:
            return (
                self.db.query(OTP)
                .filter(
                    OTP.email == identifier,
                    OTP.created_at > cutoff_time
                )
                .count()
            )
        else:
            return (
                self.db.query(OTP)
                .filter(
                    OTP.phone_number == identifier,
                    OTP.created_at > cutoff_time
                )
                .count()
            )
    
    def get_by_user(self, user_id: int, skip: int = 0, limit: int = 10) -> List[OTP]:
        """
        Get OTPs by user ID.
        
        Args:
            user_id: User ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of OTP objects
        """
        return (
            self.db.query(OTP)
            .filter(OTP.user_id == user_id)
            .order_by(OTP.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
