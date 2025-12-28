"""
Bid schemas for API request/response validation.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

from app.models.bid import BidStatus


class BidCreate(BaseModel):
    """Schema for creating a bid."""
    
    request_id: int = Field(..., description="ID of the request to bid on", gt=0)
    amount: float = Field(..., description="Bid amount in currency", gt=0)
    proposal: str = Field(
        ...,
        min_length=50,
        max_length=2000,
        description="Detailed work proposal",
        examples=["I have 10 years of experience in plumbing work..."]
    )
    
    @field_validator("proposal")
    @classmethod
    def validate_proposal(cls, v: str) -> str:
        """Validate proposal is not just whitespace."""
        if not v.strip():
            raise ValueError("Proposal cannot be empty")
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "request_id": 1,
                "amount": 45000.00,
                "proposal": "I am an experienced plumber with 10+ years in residential and commercial plumbing. I have successfully completed similar projects in your area. I can start immediately and complete the work within the expected timeline. My work includes quality materials and a 1-year warranty."
            }
        }


class BidUpdate(BaseModel):
    """Schema for updating a bid."""
    
    amount: Optional[float] = Field(None, description="Updated bid amount", gt=0)
    proposal: Optional[str] = Field(
        None,
        min_length=50,
        max_length=2000,
        description="Updated work proposal"
    )
    
    @field_validator("proposal")
    @classmethod
    def validate_proposal(cls, v: Optional[str]) -> Optional[str]:
        """Validate proposal is not just whitespace."""
        if v is not None and not v.strip():
            raise ValueError("Proposal cannot be empty")
        return v.strip() if v else None
    
    class Config:
        json_schema_extra = {
            "example": {
                "amount": 42000.00,
                "proposal": "Updated proposal with better pricing and faster timeline..."
            }
        }


class BidStatusUpdate(BaseModel):
    """Schema for updating bid status."""
    
    status: BidStatus = Field(..., description="New bid status")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "accepted"
            }
        }


class BidResponse(BaseModel):
    """Schema for bid response."""
    
    id: int
    request_id: int
    contractor_id: int
    amount: float
    proposal: str
    status: BidStatus
    created_at: datetime
    updated_at: datetime
    
    # Nested contractor info
    contractor: Optional[dict] = None
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "request_id": 1,
                "contractor_id": 2,
                "amount": 45000.00,
                "proposal": "Detailed work proposal...",
                "status": "pending",
                "created_at": "2025-12-28T10:00:00",
                "updated_at": "2025-12-28T10:00:00",
                "contractor": {
                    "id": 2,
                    "full_name": "John Contractor",
                    "phone_number": "9876543210",
                    "city": "Mumbai",
                    "rating": 4.5
                }
            }
        }


class BidListResponse(BaseModel):
    """Schema for paginated bid list response."""
    
    bids: list[BidResponse]
    total: int = Field(..., description="Total number of bids")
    page: int = Field(..., description="Current page number", ge=1)
    page_size: int = Field(..., description="Number of items per page", ge=1, le=100)
    total_pages: int = Field(..., description="Total number of pages", ge=0)
    
    class Config:
        json_schema_extra = {
            "example": {
                "bids": [
                    {
                        "id": 1,
                        "request_id": 1,
                        "contractor_id": 2,
                        "amount": 45000.00,
                        "proposal": "Detailed work proposal...",
                        "status": "pending",
                        "created_at": "2025-12-28T10:00:00",
                        "updated_at": "2025-12-28T10:00:00"
                    }
                ],
                "total": 5,
                "page": 1,
                "page_size": 20,
                "total_pages": 1
            }
        }


class BidStatistics(BaseModel):
    """Schema for bid statistics."""
    
    total_bids: int = Field(..., description="Total number of bids")
    pending_bids: int = Field(..., description="Number of pending bids")
    accepted_bids: int = Field(..., description="Number of accepted bids")
    rejected_bids: int = Field(..., description="Number of rejected bids")
    withdrawn_bids: int = Field(..., description="Number of withdrawn bids")
    average_bid_amount: Optional[float] = Field(None, description="Average bid amount")
    lowest_bid: Optional[float] = Field(None, description="Lowest bid amount")
    highest_bid: Optional[float] = Field(None, description="Highest bid amount")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_bids": 5,
                "pending_bids": 3,
                "accepted_bids": 1,
                "rejected_bids": 1,
                "withdrawn_bids": 0,
                "average_bid_amount": 42000.00,
                "lowest_bid": 38000.00,
                "highest_bid": 48000.00
            }
        }
