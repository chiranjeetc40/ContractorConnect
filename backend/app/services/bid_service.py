"""
Bid service for business logic.
"""

from typing import Optional
from fastapi import HTTPException, status

from app.models.bid import Bid, BidStatus
from app.models.request import Request, RequestStatus
from app.models.user import User, UserRole
from app.repositories.bid_repository import BidRepository
from app.repositories.request_repository import RequestRepository
from app.repositories.user_repository import UserRepository
from app.schemas.bid import (
    BidCreate,
    BidUpdate,
    BidStatusUpdate,
    BidResponse,
    BidListResponse,
    BidStatistics
)


class BidService:
    """Service for bid business logic."""
    
    def __init__(
        self,
        bid_repo: BidRepository,
        request_repo: RequestRepository,
        user_repo: UserRepository
    ):
        """Initialize service with repositories."""
        self.bid_repo = bid_repo
        self.request_repo = request_repo
        self.user_repo = user_repo
    
    def submit_bid(self, bid_data: BidCreate, contractor_id: int) -> Bid:
        """
        Submit a bid on a request.
        
        Args:
            bid_data: Bid creation data
            contractor_id: ID of contractor submitting bid
            
        Returns:
            Created Bid object
            
        Raises:
            HTTPException: If validation fails
        """
        # Verify user is a contractor
        contractor = self.user_repo.get_by_id(contractor_id)
        if not contractor or contractor.role != UserRole.CONTRACTOR:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only contractors can submit bids"
            )
        
        # Get the request
        request = self.request_repo.get_by_id(bid_data.request_id)
        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Request with ID {bid_data.request_id} not found"
            )
        
        # Check if request is open for bids
        if request.status != RequestStatus.OPEN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot bid on request with status {request.status}. Only OPEN requests accept bids."
            )
        
        # Check if contractor is bidding on their own request (if they're also a society)
        if request.society_id == contractor_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot bid on your own request"
            )
        
        # Check if contractor already has an active bid on this request
        existing_bid = self.bid_repo.get_existing_bid(bid_data.request_id, contractor_id)
        if existing_bid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an active bid on this request. Please update or withdraw your existing bid."
            )
        
        # Create the bid
        data = bid_data.model_dump()
        data["contractor_id"] = contractor_id
        data["status"] = BidStatus.PENDING
        
        bid = self.bid_repo.create(data)
        return bid
    
    def get_bid(self, bid_id: int) -> Bid:
        """
        Get bid by ID.
        
        Args:
            bid_id: Bid ID
            
        Returns:
            Bid object
            
        Raises:
            HTTPException: If bid not found
        """
        bid = self.bid_repo.get_by_id(bid_id)
        if not bid:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bid with ID {bid_id} not found"
            )
        return bid
    
    def list_bids_for_request(
        self,
        request_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[BidStatus] = None,
        user_id: Optional[int] = None
    ) -> BidListResponse:
        """
        List all bids for a request.
        
        Args:
            request_id: Request ID
            skip: Pagination offset
            limit: Page size
            status: Filter by status
            user_id: Optional user ID for authorization check
            
        Returns:
            BidListResponse with paginated bids
            
        Raises:
            HTTPException: If request not found or unauthorized
        """
        # Verify request exists
        request = self.request_repo.get_by_id(request_id)
        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Request with ID {request_id} not found"
            )
        
        # Authorization: Only society owner or admin can see all bids
        # Contractors can only see their own bid
        if user_id:
            user = self.user_repo.get_by_id(user_id)
            if user and user.role == UserRole.CONTRACTOR and request.society_id != user_id:
                # Contractor can only see their own bid
                bids, total = self.bid_repo.get_by_contractor(
                    contractor_id=user_id,
                    skip=0,
                    limit=1
                )
                # Filter for this specific request
                bids = [b for b in bids if b.request_id == request_id]
                total = len(bids)
                
                return BidListResponse(
                    bids=bids,
                    total=total,
                    page=1,
                    page_size=limit,
                    total_pages=1
                )
        
        # Get bids
        bids, total = self.bid_repo.get_by_request(request_id, skip, limit, status)
        
        return BidListResponse(
            bids=bids,
            total=total,
            page=skip // limit + 1,
            page_size=limit,
            total_pages=(total + limit - 1) // limit
        )
    
    def get_my_bids(
        self,
        contractor_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[BidStatus] = None
    ) -> BidListResponse:
        """
        Get bids submitted by contractor.
        
        Args:
            contractor_id: Contractor user ID
            skip: Pagination offset
            limit: Page size
            status: Filter by status
            
        Returns:
            BidListResponse with contractor's bids
        """
        bids, total = self.bid_repo.get_by_contractor(contractor_id, skip, limit, status)
        
        return BidListResponse(
            bids=bids,
            total=total,
            page=skip // limit + 1,
            page_size=limit,
            total_pages=(total + limit - 1) // limit
        )
    
    def update_bid(
        self,
        bid_id: int,
        update_data: BidUpdate,
        user_id: int
    ) -> Bid:
        """
        Update bid details.
        
        Args:
            bid_id: Bid ID
            update_data: Update data
            user_id: ID of user making the update
            
        Returns:
            Updated Bid object
            
        Raises:
            HTTPException: If unauthorized or invalid
        """
        # Get bid
        bid = self.get_bid(bid_id)
        
        # Only contractor who submitted the bid can update it
        if bid.contractor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own bids"
            )
        
        # Can only update pending bids
        if bid.status != BidStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot update bid with status {bid.status}. Only PENDING bids can be updated."
            )
        
        # Update bid
        data = update_data.model_dump(exclude_unset=True)
        updated_bid = self.bid_repo.update(bid, data)
        return updated_bid
    
    def accept_bid(self, bid_id: int, user_id: int) -> Bid:
        """
        Accept a bid (society only).
        
        Args:
            bid_id: Bid ID
            user_id: Society user ID
            
        Returns:
            Accepted Bid object
            
        Raises:
            HTTPException: If unauthorized or invalid
        """
        # Get bid
        bid = self.get_bid(bid_id)
        
        # Get request
        request = self.request_repo.get_by_id(bid.request_id)
        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found"
            )
        
        # Check authorization: only society owner or admin
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if request.society_id != user_id and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the society that posted the request can accept bids"
            )
        
        # Can only accept pending bids
        if bid.status != BidStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot accept bid with status {bid.status}"
            )
        
        # Check if request is still open
        if request.status != RequestStatus.OPEN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot accept bid on request with status {request.status}"
            )
        
        # Accept the bid
        accepted_bid = self.bid_repo.update_status(bid, BidStatus.ACCEPTED)
        
        # Reject all other pending bids
        self.bid_repo.reject_other_bids(request.id, bid.id)
        
        # Update request: assign contractor and set status to IN_PROGRESS
        self.request_repo.update_status(
            request,
            RequestStatus.IN_PROGRESS,
            contractor_id=bid.contractor_id
        )
        
        return accepted_bid
    
    def withdraw_bid(self, bid_id: int, user_id: int) -> Bid:
        """
        Withdraw a bid (contractor only).
        
        Args:
            bid_id: Bid ID
            user_id: Contractor user ID
            
        Returns:
            Withdrawn Bid object
            
        Raises:
            HTTPException: If unauthorized or invalid
        """
        # Get bid
        bid = self.get_bid(bid_id)
        
        # Only contractor who submitted can withdraw
        if bid.contractor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only withdraw your own bids"
            )
        
        # Can only withdraw pending bids
        if bid.status != BidStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot withdraw bid with status {bid.status}"
            )
        
        # Withdraw the bid
        withdrawn_bid = self.bid_repo.update_status(bid, BidStatus.WITHDRAWN)
        return withdrawn_bid
    
    def delete_bid(self, bid_id: int, user_id: int) -> bool:
        """
        Delete a bid.
        
        Args:
            bid_id: Bid ID
            user_id: User ID (contractor or admin)
            
        Returns:
            True if successful
            
        Raises:
            HTTPException: If unauthorized
        """
        # Get bid
        bid = self.get_bid(bid_id)
        
        # Get user
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Only contractor who submitted or admin can delete
        if bid.contractor_id != user_id and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own bids"
            )
        
        # Cannot delete accepted bids
        if bid.status == BidStatus.ACCEPTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete accepted bids"
            )
        
        # Delete bid
        return self.bid_repo.delete(bid)
    
    def get_bid_statistics(self, request_id: int, user_id: int) -> BidStatistics:
        """
        Get bid statistics for a request.
        
        Args:
            request_id: Request ID
            user_id: User ID for authorization
            
        Returns:
            BidStatistics object
            
        Raises:
            HTTPException: If unauthorized
        """
        # Verify request exists
        request = self.request_repo.get_by_id(request_id)
        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Request with ID {request_id} not found"
            )
        
        # Check authorization: only society owner or admin
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if request.society_id != user_id and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the society that posted the request can view bid statistics"
            )
        
        # Get statistics
        stats = self.bid_repo.get_statistics(request_id)
        return BidStatistics(**stats)
