"""
Authentication service for user login, registration, and token management.
"""

from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.services.otp_service import OTPService
from app.services.user_service import UserService
from app.core.security import create_access_token, create_refresh_token, verify_password
from app.core.config import settings
from app.schemas.user import UserCreate, UserResponse
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
        Register a new user and send OTP for verification to both phone and email.
        
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
            # Send OTP to both phone and email
            otp_code_phone, expires_at_phone = self.otp_service.create_otp(
                user_data.phone_number,
                purpose="registration",
                user_id=existing_user.id,
                delivery_method="sms"
            )
            otp_code_email, expires_at_email = self.otp_service.create_otp(
                existing_user.email,
                purpose="registration",
                user_id=existing_user.id,
                delivery_method="email"
            )
            return {
                "message": "OTP resent for verification to both phone and email",
                "phone_number": user_data.phone_number,
                "email": existing_user.email,
                "expires_in_minutes": settings.otp_expire_minutes,
                "requires_verification": True,
                "user_id": existing_user.id
            }
        
        # Create new user (not verified yet)
        user = self.user_service.create_user(user_data)
        
        # Send OTP to both phone and email for verification
        otp_code_phone, expires_at_phone = self.otp_service.create_otp(
            user_data.phone_number,
            purpose="registration",
            user_id=user.id,
            delivery_method="sms"
        )
        otp_code_email, expires_at_email = self.otp_service.create_otp(
            user.email,
            purpose="registration",
            user_id=user.id,
            delivery_method="email"
        )
        
        return {
            "message": "User registered successfully. OTP sent to both phone and email for verification.",
            "phone_number": user_data.phone_number,
            "email": user.email,
            "expires_in_minutes": settings.otp_expire_minutes,
            "requires_verification": True,
            "user_id": user.id
        }
    
    def request_login_otp(self, identifier: str) -> Dict[str, Any]:
        """
        Request OTP for login. User provides phone number, OTP sent to both phone and email.
        
        Args:
            identifier: Phone number (email will be fetched from database)
            
        Returns:
            Dictionary with message and OTP info
        """
        # Always treat identifier as phone number for login
        user = self.user_repo.get_by_phone(identifier)
        if not user:
            raise ValueError("No account found with this phone number. Please register first.")
        
        if not user.is_active:
            raise ValueError("Account is deactivated. Please contact support.")
        
        if not user.email:
            raise ValueError("No email associated with this account. Please contact support.")
        
        # Send OTP to both phone and email
        otp_code_phone, expires_at_phone = self.otp_service.create_otp(
            user.phone_number,
            purpose="login",
            user_id=user.id,
            delivery_method="sms"
        )
        otp_code_email, expires_at_email = self.otp_service.create_otp(
            user.email,
            purpose="login",
            user_id=user.id,
            delivery_method="email"
        )
        
        return {
            "message": "OTP sent to both your phone and email",
            "phone_number": user.phone_number,
            "email": user.email,
            "expires_in_minutes": settings.otp_expire_minutes
        }
    
    def verify_otp_and_login(
        self,
        identifier: str,  # Phone number for login
        otp_code: str,
        purpose: str = "login"
    ) -> Dict[str, Any]:
        """
        Verify OTP and return access token. For login, identifier is phone number.
        OTP can be entered from either phone or email.
        
        Args:
            identifier: Phone number
            otp_code: OTP code to verify
            purpose: Purpose of OTP (login or registration)
            
        Returns:
            Dictionary with tokens and user info
        """
        # Get user by phone
        user = self.user_repo.get_by_phone(identifier)
        if not user:
            raise ValueError("User not found")
        
        # Verify OTP - check both phone and email OTPs
        # Try verifying with phone number first
        try:
            self.otp_service.verify_otp(user.phone_number, otp_code, purpose)
        except:
            # If phone OTP fails, try email OTP
            if user.email:
                self.otp_service.verify_otp(user.email, otp_code, purpose)
            else:
                raise ValueError("Invalid or expired OTP")
        
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
            "user": UserResponse.model_validate(user).model_dump()  # Properly serialize user
        }
    
    def login_with_password(self, phone_number: str, password: str) -> Dict[str, Any]:
        """
        Login user with phone number and password.
        
        Args:
            phone_number: User's phone number
            password: User's password
            
        Returns:
            Dictionary with tokens and user info
            
        Raises:
            ValueError: If credentials are invalid
        """
        # Get user
        user = self.user_repo.get_by_phone(phone_number)
        if not user:
            raise ValueError("Invalid phone number or password")
        
        # Check if user has password set
        if not user.password_hash:
            raise ValueError("Password login not available. Please use OTP login.")
        
        # Verify password
        if not verify_password(password, user.password_hash):
            raise ValueError("Invalid phone number or password")
        
        # Check if user is verified
        if not user.is_verified:
            raise ValueError("Account not verified. Please verify your phone number first.")
        
        # Check if user is active
        if not user.is_active:
            raise ValueError("Account is deactivated. Please contact support.")
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        self.db.commit()
        
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
            "expires_in": settings.access_token_expire_minutes * 60,
            "user": UserResponse.model_validate(user).model_dump()  # Properly serialize user
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
