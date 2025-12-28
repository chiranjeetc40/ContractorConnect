"""
Request model for civil work requests posted by building societies.
"""

from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class RequestCategory(str, enum.Enum):
    """Request category enumeration."""
    CONSTRUCTION = "construction"
    RENOVATION = "renovation"
    PLUMBING = "plumbing"
    ELECTRICAL = "electrical"
    PAINTING = "painting"
    FLOORING = "flooring"
    ROOFING = "roofing"
    LANDSCAPING = "landscaping"
    INTERIOR_DESIGN = "interior_design"
    OTHER = "other"


class RequestStatus(str, enum.Enum):
    """Request status enumeration."""
    OPEN = "open"               # New request, accepting bids
    IN_PROGRESS = "in_progress" # Work started
    COMPLETED = "completed"     # Work completed
    CANCELLED = "cancelled"     # Request cancelled
    ON_HOLD = "on_hold"        # Temporarily paused


class Request(Base):
    """
    Request model for civil work requests.
    
    Attributes:
        id: Primary key
        society_id: Foreign key to users table (society who posted)
        assigned_contractor_id: Foreign key to users (assigned contractor)
        title: Request title
        description: Detailed description
        category: Type of work
        status: Current status
        location: Work location
        city: City
        state: State
        pincode: Postal code
        budget_min: Minimum budget
        budget_max: Maximum budget
        estimated_duration_days: Estimated work duration
        required_skills: Comma-separated skills needed
        preferred_start_date: When work should start
        images: Comma-separated image URLs/paths
        created_at: Request creation timestamp
        updated_at: Last update timestamp
        started_at: Work start timestamp
        completed_at: Work completion timestamp
    """
    
    __tablename__ = "requests"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    society_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_contractor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Request Details
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(Enum(RequestCategory), nullable=False, index=True)
    status = Column(Enum(RequestStatus), nullable=False, default=RequestStatus.OPEN, index=True)
    
    # Location
    location = Column(Text, nullable=True)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=True)
    
    # Budget
    budget_min = Column(Float, nullable=True)
    budget_max = Column(Float, nullable=True)
    
    # Additional Details
    estimated_duration_days = Column(Integer, nullable=True)
    required_skills = Column(Text, nullable=True)  # Comma-separated
    preferred_start_date = Column(DateTime, nullable=True)
    
    # Media
    images = Column(Text, nullable=True)  # Comma-separated URLs
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    society = relationship("User", foreign_keys=[society_id], backref="posted_requests")
    assigned_contractor = relationship("User", foreign_keys=[assigned_contractor_id], backref="assigned_requests")
    # bids = relationship("Bid", back_populates="request", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Request(id={self.id}, title={self.title}, status={self.status})>"
    
    @property
    def is_open(self) -> bool:
        """Check if request is open for bids."""
        return self.status == RequestStatus.OPEN
    
    @property
    def is_completed(self) -> bool:
        """Check if request is completed."""
        return self.status == RequestStatus.COMPLETED
    
    @property
    def has_assigned_contractor(self) -> bool:
        """Check if contractor is assigned."""
        return self.assigned_contractor_id is not None
    
    @property
    def budget_range_str(self) -> str:
        """Get budget range as string."""
        if self.budget_min and self.budget_max:
            return f"₹{self.budget_min:,.0f} - ₹{self.budget_max:,.0f}"
        elif self.budget_min:
            return f"₹{self.budget_min:,.0f}+"
        elif self.budget_max:
            return f"Up to ₹{self.budget_max:,.0f}"
        return "Budget not specified"
    
    @property
    def image_list(self) -> list:
        """Get list of image URLs."""
        if self.images:
            return [img.strip() for img in self.images.split(",") if img.strip()]
        return []
    
    @property
    def skill_list(self) -> list:
        """Get list of required skills."""
        if self.required_skills:
            return [skill.strip() for skill in self.required_skills.split(",") if skill.strip()]
        return []
