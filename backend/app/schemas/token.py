"""
Token-related Pydantic schemas for JWT authentication.
"""

from typing import Optional, Any
from pydantic import BaseModel, Field


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiry time in seconds")
    user: Optional[Any] = Field(None, description="User object")  # Added user field
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800
            }
        }
        # Allow arbitrary types for user object
        arbitrary_types_allowed = True


class TokenData(BaseModel):
    """Schema for JWT token payload data."""
    user_id: int
    phone_number: str
    role: str
    token_type: str = Field(default="access", description="access or refresh")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "phone_number": "+919876543210",
                "role": "contractor",
                "token_type": "access"
            }
        }


class RefreshToken(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str = Field(..., description="Refresh token to get new access token")
    
    class Config:
        json_schema_extra = {
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }


class TokenRefreshResponse(BaseModel):
    """Schema for token refresh response."""
    access_token: str = Field(..., description="New JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiry time in seconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800
            }
        }
