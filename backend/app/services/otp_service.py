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
from app.services.providers import get_otp_provider, get_fallback_provider


class OTPService:
    """Service for OTP operations."""
    
    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db
        self.otp_repo = OTPRepository(db)
        self.primary_provider = None
        self.fallback_provider = None
    
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
        identifier: str,  # Can be phone or email
        purpose: str = "login",
        user_id: Optional[int] = None,
        delivery_method: str = "sms"  # "sms" or "email"
    ) -> tuple[str, datetime]:
        """
        Create and send OTP to phone number or email.
        
        Args:
            identifier: Phone number or email address
            purpose: Purpose of OTP (login, registration, verification)
            user_id: Optional user ID for existing users
            delivery_method: "sms" or "email"
            
        Returns:
            Tuple of (OTP code, expiry time)
        """
        print(f"🔍 create_otp called with:")
        print(f"   identifier: {identifier}")
        print(f"   purpose: {purpose}")
        print(f"   user_id: {user_id}")
        print(f"   delivery_method: {delivery_method}")
        
        # Check rate limiting
        recent_count = self.otp_repo.count_recent_attempts(identifier, minutes=5)
        if recent_count >= 3:
            raise ValueError("Too many OTP requests. Please try again after 5 minutes.")
        
        # Invalidate previous OTPs
        self.otp_repo.invalidate_previous_otps(identifier, purpose)
        
        # Generate new OTP
        otp_code = self.generate_otp_code(length=settings.otp_length)
        expires_at = datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes)
        
        # Save to database with appropriate field
        otp_data = {
            "otp_code": otp_code,
            "purpose": purpose,
            "user_id": user_id,
            "expires_at": expires_at,
            "delivery_method": delivery_method,
        }
        
        # Set phone or email based on delivery method
        if delivery_method == "email":
            otp_data["email"] = identifier
            otp_data["phone_number"] = None
        else:
            otp_data["phone_number"] = identifier
            otp_data["email"] = None
            
        self.otp_repo.create(otp_data)
        
        # Send OTP via configured provider
        try:
            # Send OTP based on delivery method (dynamically select provider)
            if delivery_method == "email":
                # Check if SMTP is enabled
                if not settings.smtp_enabled:
                    print(f"⚠️  SMTP is disabled (SMTP_ENABLED=false). Skipping email OTP.")
                    print(f"💡 OTP saved in database but not sent: {otp_code}")
                    return otp_code, expires_at
                
                # Use email provider
                print(f"📧 Sending OTP to email: {identifier}")
                from app.services.providers.email import EmailProvider
                email_provider = EmailProvider()
                print(f"📦 Using Email provider: {email_provider.get_provider_name()}")
                result = email_provider.send_otp(identifier, otp_code, purpose)
                print(f"✅ OTP sent via Email to {identifier}")
                
            else:  # SMS delivery
                # Initialize SMS provider if not already done
                if not self.primary_provider:
                    # Get SMS provider from settings (sms_twilio, sms_msg91, etc.)
                    from app.services.providers import get_otp_provider
                    self.primary_provider = get_otp_provider()
                
                print(f"📱 Sending OTP via SMS to: {identifier}")
                print(f"📦 Using SMS provider: {self.primary_provider.get_provider_name()}")
                result = self.primary_provider.send_otp(identifier, otp_code, purpose)
                print(f"✅ OTP sent via {self.primary_provider.get_provider_name()}")
            
            return otp_code, expires_at
            
        except Exception as primary_error:
            # Log primary provider failure
            print(f"❌ Primary OTP provider failed: {str(primary_error)}")
            
            # Try fallback provider if configured (only for SMS)
            if delivery_method == "sms":
                if not self.fallback_provider:
                    self.fallback_provider = get_fallback_provider()
                
                if self.fallback_provider:
                    try:
                        print(f"🔄 Trying fallback provider: {self.fallback_provider.get_provider_name()}")
                        result = self.fallback_provider.send_otp(identifier, otp_code, purpose)
                        print(f"✅ OTP sent via fallback: {self.fallback_provider.get_provider_name()}")
                        return otp_code, expires_at
                    except Exception as fallback_error:
                        print(f"❌ Fallback OTP provider also failed: {str(fallback_error)}")
            
            # If both fail, still return OTP (it's in database) but log error
            print(f"⚠️ OTP created but not sent. Code: {otp_code}")
            return otp_code, expires_at
    
    def verify_otp(
        self,
        identifier: str,  # Phone or email
        otp_code: str,
        purpose: str = "login"
    ) -> bool:
        """
        Verify OTP code. Supports both phone and email.
        
        Args:
            identifier: Phone number or email
            otp_code: OTP code to verify
            purpose: Purpose of OTP
            
        Returns:
            True if valid, raises ValueError if invalid
        """
        # Get valid OTP (repository handles phone vs email)
        otp = self.otp_repo.get_valid_otp(identifier, otp_code, purpose)
        
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
