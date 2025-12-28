"""
User model for authentication and profile management.
"""

from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""
    CONTRACTOR = "contractor"
    SOCIETY = "society"
    ADMIN = "admin"


class UserStatus(str, enum.Enum):
    """User status enumeration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class User(Base):
    """
    User model for contractors and building societies.
    
    Attributes:
        id: Primary key
        phone_number: Unique phone number (primary identifier)
        email: Optional email address
        role: User role (contractor, society, admin)
        status: Account status
        name: Full name
        profile_image: URL/path to profile image
        address: Physical address
        city: City
        state: State/province
        pincode: Postal code
        is_verified: Whether phone is verified
        is_active: Whether account is active
        created_at: Account creation timestamp
        updated_at: Last update timestamp
        last_login_at: Last login timestamp
    """
    
    __tablename__ = "users"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Authentication & Contact
    phone_number = Column(String(15), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    
    # Role & Status
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CONTRACTOR)
    status = Column(Enum(UserStatus), nullable=False, default=UserStatus.PENDING)
    
    # Profile Information
    name = Column(String(255), nullable=True)
    profile_image = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)  # For contractors: skills, experience
    
    # Address
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    
    # Verification & Status Flags
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    
    # Relationships
    contractor_bids = relationship("Bid", foreign_keys="Bid.contractor_id", back_populates="contractor", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, phone={self.phone_number}, role={self.role})>"
    
    @property
    def is_contractor(self) -> bool:
        """Check if user is a contractor."""
        return self.role == UserRole.CONTRACTOR
    
    @property
    def is_society(self) -> bool:
        """Check if user is a building society."""
        return self.role == UserRole.SOCIETY
    
    @property
    def is_admin(self) -> bool:
        """Check if user is an admin."""
        return self.role == UserRole.ADMIN
