"""
Bid repository for database operations.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.bid import Bid, BidStatus


class BidRepository:
    """Repository for Bid database operations."""
    
    def __init__(self, db: Session):
        """Initialize repository with database session."""
        self.db = db
    
    def create(self, bid_data: dict) -> Bid:
        """
        Create a new bid.
        
        Args:
            bid_data: Dictionary with bid data
            
        Returns:
            Created Bid object
        """
        bid = Bid(**bid_data)
        self.db.add(bid)
        self.db.commit()
        self.db.refresh(bid)
        return bid
    
    def get_by_id(self, bid_id: int) -> Optional[Bid]:
        """
        Get bid by ID.
        
        Args:
            bid_id: Bid ID
            
        Returns:
            Bid object or None
        """
        return self.db.query(Bid).filter(Bid.id == bid_id).first()
    
    def get_by_request(
        self,
        request_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[BidStatus] = None
    ) -> tuple[List[Bid], int]:
        """
        Get all bids for a specific request.
        
        Args:
            request_id: Request ID
            skip: Number of records to skip
            limit: Maximum records to return
            status: Filter by bid status
            
        Returns:
            Tuple of (list of bids, total count)
        """
        query = self.db.query(Bid).filter(Bid.request_id == request_id)
        
        if status:
            query = query.filter(Bid.status == status)
        
        total = query.count()
        bids = query.order_by(Bid.created_at.desc()).offset(skip).limit(limit).all()
        
        return bids, total
    
    def get_by_contractor(
        self,
        contractor_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[BidStatus] = None
    ) -> tuple[List[Bid], int]:
        """
        Get all bids submitted by a contractor.
        
        Args:
            contractor_id: Contractor user ID
            skip: Pagination offset
            limit: Page size
            status: Filter by status
            
        Returns:
            Tuple of (list of bids, total count)
        """
        query = self.db.query(Bid).filter(Bid.contractor_id == contractor_id)
        
        if status:
            query = query.filter(Bid.status == status)
        
        total = query.count()
        bids = query.order_by(Bid.created_at.desc()).offset(skip).limit(limit).all()
        
        return bids, total
    
    def get_existing_bid(self, request_id: int, contractor_id: int) -> Optional[Bid]:
        """
        Check if contractor already bid on this request.
        
        Args:
            request_id: Request ID
            contractor_id: Contractor ID
            
        Returns:
            Existing Bid object or None
        """
        return self.db.query(Bid).filter(
            and_(
                Bid.request_id == request_id,
                Bid.contractor_id == contractor_id,
                Bid.status.in_([BidStatus.PENDING, BidStatus.ACCEPTED])
            )
        ).first()
    
    def update(self, bid: Bid, update_data: dict) -> Bid:
        """
        Update bid with new data.
        
        Args:
            bid: Bid object to update
            update_data: Dictionary with fields to update
            
        Returns:
            Updated Bid object
        """
        for key, value in update_data.items():
            if value is not None and hasattr(bid, key):
                setattr(bid, key, value)
        
        self.db.commit()
        self.db.refresh(bid)
        return bid
    
    def update_status(self, bid: Bid, status: BidStatus) -> Bid:
        """
        Update bid status.
        
        Args:
            bid: Bid object
            status: New status
            
        Returns:
            Updated Bid object
        """
        bid.status = status
        self.db.commit()
        self.db.refresh(bid)
        return bid
    
    def delete(self, bid: Bid) -> bool:
        """
        Delete bid.
        
        Args:
            bid: Bid object to delete
            
        Returns:
            True if successful
        """
        self.db.delete(bid)
        self.db.commit()
        return True
    
    def count_by_request(self, request_id: int, status: Optional[BidStatus] = None) -> int:
        """
        Count bids for a request.
        
        Args:
            request_id: Request ID
            status: Optional status filter
            
        Returns:
            Number of bids
        """
        query = self.db.query(Bid).filter(Bid.request_id == request_id)
        
        if status:
            query = query.filter(Bid.status == status)
        
        return query.count()
    
    def count_by_contractor(self, contractor_id: int, status: Optional[BidStatus] = None) -> int:
        """
        Count bids by contractor.
        
        Args:
            contractor_id: Contractor user ID
            status: Optional status filter
            
        Returns:
            Number of bids
        """
        query = self.db.query(Bid).filter(Bid.contractor_id == contractor_id)
        
        if status:
            query = query.filter(Bid.status == status)
        
        return query.count()
    
    def get_statistics(self, request_id: int) -> Dict[str, Any]:
        """
        Get bid statistics for a request.
        
        Args:
            request_id: Request ID
            
        Returns:
            Dictionary with statistics
        """
        query = self.db.query(Bid).filter(Bid.request_id == request_id)
        
        total = query.count()
        pending = query.filter(Bid.status == BidStatus.PENDING).count()
        accepted = query.filter(Bid.status == BidStatus.ACCEPTED).count()
        rejected = query.filter(Bid.status == BidStatus.REJECTED).count()
        withdrawn = query.filter(Bid.status == BidStatus.WITHDRAWN).count()
        
        # Calculate amount statistics
        amounts_query = query.filter(Bid.status == BidStatus.PENDING)
        avg_amount = amounts_query.with_entities(func.avg(Bid.amount)).scalar()
        min_amount = amounts_query.with_entities(func.min(Bid.amount)).scalar()
        max_amount = amounts_query.with_entities(func.max(Bid.amount)).scalar()
        
        return {
            "total_bids": total,
            "pending_bids": pending,
            "accepted_bids": accepted,
            "rejected_bids": rejected,
            "withdrawn_bids": withdrawn,
            "average_bid_amount": float(avg_amount) if avg_amount else None,
            "lowest_bid": float(min_amount) if min_amount else None,
            "highest_bid": float(max_amount) if max_amount else None,
        }
    
    def reject_other_bids(self, request_id: int, accepted_bid_id: int) -> int:
        """
        Reject all other pending bids when one is accepted.
        
        Args:
            request_id: Request ID
            accepted_bid_id: ID of the accepted bid
            
        Returns:
            Number of bids rejected
        """
        result = self.db.query(Bid).filter(
            and_(
                Bid.request_id == request_id,
                Bid.id != accepted_bid_id,
                Bid.status == BidStatus.PENDING
            )
        ).update({"status": BidStatus.REJECTED})
        
        self.db.commit()
        return result
