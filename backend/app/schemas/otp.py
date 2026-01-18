"""
OTP-related Pydantic schemas for request/response validation.
"""

from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator
import re


class OTPRequest(BaseModel):
    """Schema for requesting OTP (phone number only for login)."""
    phone_number: str = Field(..., min_length=10, description="Phone number")
    purpose: str = Field(default="login", description="Purpose: login, registration, verification")
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        """Validate phone number format."""
        # Phone validation
        cleaned = re.sub(r'[^\d+]', '', v)
        if not re.match(r'^\+?[1-9]\d{9,14}$', cleaned):
            raise ValueError('Invalid phone number format. Use format: +1234567890')
        return cleaned
    
    @field_validator('purpose')
    @classmethod
    def validate_purpose(cls, v):
        """Validate OTP purpose."""
        allowed = ['login', 'registration', 'verification']
        if v not in allowed:
            raise ValueError(f'Purpose must be one of: {", ".join(allowed)}')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "identifier": "+919876543210",
                "purpose": "login"
            }
        }


class OTPVerify(BaseModel):
    """Schema for verifying OTP (phone number only)."""
    phone_number: str = Field(..., min_length=10, description="Phone number")
    otp_code: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        """Validate phone number format."""
        # Phone validation
        cleaned = re.sub(r'[^\d+]', '', v)
        if not re.match(r'^\+?[1-9]\d{9,14}$', cleaned):
            raise ValueError('Invalid phone number format')
        return cleaned
    
    @field_validator('otp_code')
    @classmethod
    def validate_otp(cls, v):
        """Validate OTP code format."""
        if not re.match(r'^\d{6}$', v):
            raise ValueError('OTP must be exactly 6 digits')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "identifier": "+919876543210",
                "otp_code": "123456"
            }
        }


class OTPResponse(BaseModel):
    """Schema for OTP response."""
    message: str
    phone_number: str
    expires_in_minutes: int = Field(default=10, description="OTP validity in minutes")
    requires_verification: bool = Field(default=True, description="Whether OTP verification is required")
    user_id: Optional[int] = Field(None, description="User ID if user was created")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "OTP sent successfully",
                "phone_number": "+919876543210",
                "expires_in_minutes": 10,
                "requires_verification": True
            }
        }
