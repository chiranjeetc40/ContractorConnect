"""
Authentication service for user login, registration, and token management.
"""

from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.services.otp_service import OTPService
from app.services.user_service import UserService
from app.core.security import create_access_token, create_refresh_token
from app.core.config import settings
from app.schemas.user import UserCreate
from app.models.user import User, UserStatus


class AuthService:
    """Service for authentication operations."""
    
    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db
        self.user_repo = UserRepository(db)
        self.otp_service = OTPService(db)
        self.user_service = UserService(db)
    
    def register(self, user_data: UserCreate) -> Dict[str, Any]:
        """
        Register a new user and send OTP for verification.
        
        Args:
            user_data: User registration data
            
        Returns:
            Dictionary with message and OTP info
        """
        # Check if user exists
        existing_user = self.user_repo.get_by_phone(user_data.phone_number)
        if existing_user:
            if existing_user.is_verified:
                raise ValueError("User already registered with this phone number")
            # User exists but not verified, resend OTP
            otp_code, expires_at = self.otp_service.create_otp(
                user_data.phone_number,
                purpose="registration",
                user_id=existing_user.id
            )
            return {
                "message": "OTP resent for verification",
                "phone_number": user_data.phone_number,
                "expires_in_minutes": settings.otp_expire_minutes,
                "user_id": existing_user.id
            }
        
        # Create new user (not verified yet)
        user = self.user_service.create_user(user_data)
        
        # Send OTP for verification
        otp_code, expires_at = self.otp_service.create_otp(
            user_data.phone_number,
            purpose="registration",
            user_id=user.id
        )
        
        return {
            "message": "User registered successfully. OTP sent for verification.",
            "phone_number": user_data.phone_number,
            "expires_in_minutes": settings.otp_expire_minutes,
            "user_id": user.id
        }
    
    def request_login_otp(self, phone_number: str) -> Dict[str, Any]:
        """
        Request OTP for login.
        
        Args:
            phone_number: Phone number to send OTP
            
        Returns:
            Dictionary with message and OTP info
        """
        # Check if user exists
        user = self.user_repo.get_by_phone(phone_number)
        if not user:
            raise ValueError("User not found. Please register first.")
        
        if not user.is_active:
            raise ValueError("Account is deactivated. Please contact support.")
        
        # Send OTP
        user_id = user.id if user else None
        otp_code, expires_at = self.otp_service.create_otp(
            phone_number,
            purpose="login",
            user_id=user_id
        )
        
        return {
            "message": "OTP sent successfully",
            "phone_number": phone_number,
            "expires_in_minutes": settings.otp_expire_minutes
        }
    
    def verify_otp_and_login(
        self,
        phone_number: str,
        otp_code: str,
        purpose: str = "login"
    ) -> Dict[str, Any]:
        """
        Verify OTP and return access token.
        
        Args:
            phone_number: Phone number
            otp_code: OTP code to verify
            purpose: Purpose of OTP (login or registration)
            
        Returns:
            Dictionary with tokens and user info
        """
        # Verify OTP
        self.otp_service.verify_otp(phone_number, otp_code, purpose)
        
        # Get user
        user = self.user_repo.get_by_phone(phone_number)
        if not user:
            raise ValueError("User not found")
        
        # Verify user if registering
        if purpose == "registration" and not user.is_verified:
            user = self.user_service.verify_user(user.id)
        
        # Check if user is active
        if not user.is_active:
            raise ValueError("Account is deactivated")
        
        # Update last login
        self.user_service.update_last_login(user.id)
        
        # Generate tokens
        access_token = create_access_token(
            data={
                "user_id": user.id,
                "phone_number": user.phone_number,
                "role": user.role.value
            }
        )
        
        refresh_token = create_refresh_token(
            data={
                "user_id": user.id,
                "phone_number": user.phone_number,
                "role": user.role.value
            }
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.access_token_expire_minutes * 60,  # in seconds
            "user": user
        }
    
    def refresh_access_token(self, user_id: int) -> Dict[str, Any]:
        """
        Generate new access token using refresh token.
        
        Args:
            user_id: User ID from validated refresh token
            
        Returns:
            Dictionary with new access token
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        if not user.is_active:
            raise ValueError("Account is deactivated")
        
        # Generate new access token
        access_token = create_access_token(
            data={
                "user_id": user.id,
                "phone_number": user.phone_number,
                "role": user.role.value
            }
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.access_token_expire_minutes * 60
        }
