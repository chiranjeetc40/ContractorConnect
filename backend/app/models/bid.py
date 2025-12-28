"""
Bid model for contractor bids on requests.
"""

from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base


class BidStatus(str, PyEnum):
    """Enum for bid status."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Bid(Base):
    """
    Bid model - represents contractor bids on work requests.
    
    A contractor submits a bid on an open request with their proposed
    amount and work proposal. The society can accept, reject, or ignore bids.
    """
    
    __tablename__ = "bids"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys
    request_id = Column(Integer, ForeignKey("requests.id", ondelete="CASCADE"), nullable=False, index=True)
    contractor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Bid details
    amount = Column(Float, nullable=False)
    proposal = Column(Text, nullable=False)
    status = Column(Enum(BidStatus), default=BidStatus.PENDING, nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    request = relationship("Request", back_populates="bids")
    contractor = relationship("User", foreign_keys=[contractor_id], back_populates="contractor_bids")
    
    def __repr__(self) -> str:
        """String representation."""
        return f"<Bid(id={self.id}, request_id={self.request_id}, contractor_id={self.contractor_id}, amount={self.amount}, status={self.status})>"
    
    @property
    def is_pending(self) -> bool:
        """Check if bid is pending."""
        return self.status == BidStatus.PENDING
    
    @property
    def is_accepted(self) -> bool:
        """Check if bid is accepted."""
        return self.status == BidStatus.ACCEPTED
    
    @property
    def is_rejected(self) -> bool:
        """Check if bid is rejected."""
        return self.status == BidStatus.REJECTED
    
    @property
    def is_withdrawn(self) -> bool:
        """Check if bid is withdrawn."""
        return self.status == BidStatus.WITHDRAWN
