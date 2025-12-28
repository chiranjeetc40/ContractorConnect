"""
User-related Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, validator
import re

from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    """Base user schema with common fields."""
    phone_number: str = Field(..., min_length=10, max_length=15, description="Phone number with country code")
    email: Optional[str] = Field(None, max_length=255, description="Email address")
    name: Optional[str] = Field(None, max_length=255, description="Full name")
    role: UserRole = Field(default=UserRole.CONTRACTOR, description="User role")
    
    @validator('phone_number')
    def validate_phone(cls, v):
        """Validate phone number format."""
        # Remove spaces and special characters
        cleaned = re.sub(r'[^\d+]', '', v)
        if not re.match(r'^\+?[1-9]\d{9,14}$', cleaned):
            raise ValueError('Invalid phone number format. Use format: +1234567890')
        return cleaned
    
    @validator('email')
    def validate_email(cls, v):
        """Validate email format."""
        if v is not None:
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, v):
                raise ValueError('Invalid email format')
        return v


class UserCreate(UserBase):
    """Schema for user registration."""
    address: Optional[str] = Field(None, description="Physical address")
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)
    description: Optional[str] = Field(None, description="Skills, experience for contractors")
    
    class Config:
        json_schema_extra = {
            "example": {
                "phone_number": "+919876543210",
                "email": "contractor@example.com",
                "name": "John Doe",
                "role": "contractor",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001",
                "description": "Experienced civil contractor with 10+ years"
            }
        }


class UserLogin(BaseModel):
    """Schema for user login request."""
    phone_number: str = Field(..., min_length=10, max_length=15, description="Phone number")
    
    @validator('phone_number')
    def validate_phone(cls, v):
        """Validate phone number format."""
        cleaned = re.sub(r'[^\d+]', '', v)
        if not re.match(r'^\+?[1-9]\d{9,14}$', cleaned):
            raise ValueError('Invalid phone number format')
        return cleaned
    
    class Config:
        json_schema_extra = {
            "example": {
                "phone_number": "+919876543210"
            }
        }


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)
    description: Optional[str] = None
    profile_image: Optional[str] = Field(None, max_length=500, description="Profile image URL")
    
    @validator('email')
    def validate_email(cls, v):
        """Validate email format."""
        if v is not None:
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, v):
                raise ValueError('Invalid email format')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe Updated",
                "email": "newemail@example.com",
                "city": "Delhi",
                "description": "Updated experience details"
            }
        }


class UserResponse(BaseModel):
    """Schema for user response (public data)."""
    id: int
    phone_number: str
    email: Optional[str]
    name: Optional[str]
    role: UserRole
    status: UserStatus
    profile_image: Optional[str]
    description: Optional[str]
    city: Optional[str]
    state: Optional[str]
    is_verified: bool
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime]
    
    class Config:
        from_attributes = True  # Pydantic v2 (was orm_mode in v1)
        json_schema_extra = {
            "example": {
                "id": 1,
                "phone_number": "+919876543210",
                "email": "contractor@example.com",
                "name": "John Doe",
                "role": "contractor",
                "status": "active",
                "profile_image": None,
                "description": "Experienced contractor",
                "city": "Mumbai",
                "state": "Maharashtra",
                "is_verified": True,
                "is_active": True,
                "created_at": "2025-12-28T10:00:00",
                "last_login_at": "2025-12-28T15:30:00"
            }
        }


class UserProfile(BaseModel):
    """Schema for detailed user profile."""
    id: int
    phone_number: str
    email: Optional[str]
    name: Optional[str]
    role: UserRole
    status: UserStatus
    profile_image: Optional[str]
    description: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime]
    
    class Config:
        from_attributes = True
