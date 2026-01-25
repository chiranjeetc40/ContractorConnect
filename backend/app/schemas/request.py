"""
Request-related Pydantic schemas for validation.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator

from app.models.request import RequestCategory, RequestStatus


class RequestBase(BaseModel):
    """Base request schema."""
    title: str = Field(..., min_length=5, max_length=255, description="Request title")
    description: str = Field(..., min_length=20, description="Detailed description of work")
    category: RequestCategory = Field(..., description="Category of work")
    city: str = Field(..., min_length=2, max_length=100, description="City where work is needed")
    state: str = Field(..., min_length=2, max_length=100, description="State")
    
    @validator('title')
    def validate_title(cls, v):
        """Validate title."""
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()
    
    @validator('description')
    def validate_description(cls, v):
        """Validate description."""
        if not v.strip():
            raise ValueError('Description cannot be empty')
        if len(v.strip()) < 20:
            raise ValueError('Description must be at least 20 characters')
        return v.strip()


class RequestCreate(RequestBase):
    """Schema for creating a new request."""
    location: Optional[str] = Field(None, description="Detailed location/address")
    pincode: Optional[str] = Field(None, max_length=10, description="Postal code")
    estimated_duration_days: Optional[int] = Field(None, ge=1, description="Estimated work duration in days")
    required_skills: Optional[str] = Field(None, description="Required skills (comma-separated)")
    preferred_start_date: Optional[datetime] = Field(None, description="Preferred start date")
    images: Optional[str] = Field(None, description="Image URLs (comma-separated)")
    
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Bathroom Renovation Required",
                "description": "Need complete bathroom renovation including tiling, plumbing fixtures, and waterproofing. Area is approximately 80 sq ft.",
                "category": "renovation",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001",
                "location": "Building A, Wing 2, Flat 301",
                "estimated_duration_days": 15,
                "required_skills": "tiling, plumbing, waterproofing",
                "preferred_start_date": "2025-01-15T00:00:00"
            }
        }


class RequestUpdate(BaseModel):
    """Schema for updating a request."""
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = Field(None, min_length=20)
    category: Optional[RequestCategory] = None
    location: Optional[str] = None
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    state: Optional[str] = Field(None, min_length=2, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)
    estimated_duration_days: Optional[int] = Field(None, ge=1)
    required_skills: Optional[str] = None
    preferred_start_date: Optional[datetime] = None
    images: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated: Bathroom Renovation",
                "estimated_duration_days": 20
            }
        }


class RequestStatusUpdate(BaseModel):
    """Schema for updating request status."""
    status: RequestStatus = Field(..., description="New status")
    assigned_contractor_id: Optional[int] = Field(None, description="Contractor ID when assigning work")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "in_progress",
                "assigned_contractor_id": 5
            }
        }


class RequestResponse(BaseModel):
    """Schema for request response."""
    id: int
    society_id: int
    assigned_contractor_id: Optional[int]
    title: str
    description: str
    category: RequestCategory
    status: RequestStatus
    location: Optional[str]
    city: str
    state: str
    pincode: Optional[str]
    estimated_duration_days: Optional[int]
    required_skills: Optional[str]
    preferred_start_date: Optional[datetime]
    images: Optional[str]
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    # Computed fields
    image_list: Optional[List[str]] = None
    skill_list: Optional[List[str]] = None
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "society_id": 2,
                "assigned_contractor_id": None,
                "title": "Bathroom Renovation Required",
                "description": "Need complete bathroom renovation...",
                "category": "renovation",
                "status": "open",
                "city": "Mumbai",
                "state": "Maharashtra",
                "created_at": "2025-12-28T10:00:00"
            }
        }


class RequestListResponse(BaseModel):
    """Schema for list of requests with pagination."""
    total: int
    page: int
    page_size: int
    requests: List[RequestResponse]
    
    class Config:
        json_schema_extra = {
            "example": {
                "total": 25,
                "page": 1,
                "page_size": 10,
                "requests": []
            }
        }


class RequestSearchFilters(BaseModel):
    """Schema for request search filters."""
    category: Optional[RequestCategory] = None
    status: Optional[RequestStatus] = None
    city: Optional[str] = None
    state: Optional[str] = None
    search_query: Optional[str] = Field(None, description="Search in title and description")
    
    class Config:
        json_schema_extra = {
            "example": {
                "category": "renovation",
                "status": "open",
                "city": "Mumbai",
            }
        }
