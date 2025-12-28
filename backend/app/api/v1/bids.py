"""
Bid management API endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.bid import BidStatus
from app.repositories.bid_repository import BidRepository
from app.repositories.request_repository import RequestRepository
from app.repositories.user_repository import UserRepository
from app.services.bid_service import BidService
from app.schemas.bid import (
    BidCreate,
    BidUpdate,
    BidResponse,
    BidListResponse,
    BidStatistics
)


router = APIRouter(prefix="/bids", tags=["Bids"])


def get_bid_service(db: Session = Depends(get_db)) -> BidService:
    """Dependency to get BidService instance."""
    bid_repo = BidRepository(db)
    request_repo = RequestRepository(db)
    user_repo = UserRepository(db)
    return BidService(bid_repo, request_repo, user_repo)


@router.post(
    "/",
    response_model=BidResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a bid",
    description="""
    Submit a bid on an open request. Only contractors can submit bids.
    
    **Business Rules:**
    - Only contractors can submit bids
    - Can only bid on OPEN requests
    - Cannot bid on your own request
    - Cannot submit duplicate bids (one active bid per request)
    - Proposal must be at least 50 characters
    
    **Required fields:**
    - request_id: ID of the request to bid on
    - amount: Bid amount (must be positive)
    - proposal: Detailed work proposal (min 50 chars)
    
    After submission, bid status will be PENDING until society accepts or rejects it.
    """,
    responses={
        201: {"description": "Bid submitted successfully"},
        400: {"description": "Invalid bid (duplicate, closed request, etc.)"},
        403: {"description": "User is not a contractor"},
        404: {"description": "Request not found"},
        401: {"description": "Not authenticated"}
    }
)
async def submit_bid(
    bid_data: BidCreate,
    current_user: User = Depends(get_current_user),
    service: BidService = Depends(get_bid_service)
) -> BidResponse:
    """Submit a bid on a request (contractor only)."""
    bid = service.submit_bid(bid_data, current_user.id)
    return BidResponse.model_validate(bid)


@router.get(
    "/request/{request_id}",
    response_model=BidListResponse,
    summary="List bids for a request",
    description="""
    Get all bids for a specific request.
    
    **Authorization:**
    - Society owner: Can see all bids on their requests
    - Contractors: Can only see their own bid on the request
    - Admin: Can see all bids
    - Public users: Cannot access (authentication required)
    
    **Filters:**
    - status: Filter by bid status (pending, accepted, rejected, withdrawn)
    
    **Pagination:**
    - skip, limit: Standard pagination parameters
    """,
    responses={
        200: {"description": "List of bids"},
        404: {"description": "Request not found"},
        401: {"description": "Not authenticated"}
    }
)
async def list_bids_for_request(
    request_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[BidStatus] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_user),
    service: BidService = Depends(get_bid_service)
) -> BidListResponse:
    """List all bids for a request."""
    return service.list_bids_for_request(
        request_id=request_id,
        skip=skip,
        limit=limit,
        status=status,
        user_id=current_user.id
    )


@router.get(
    "/my-bids",
    response_model=BidListResponse,
    summary="Get my submitted bids",
    description="""
    Get all bids submitted by the current contractor user.
    
    Returns bids ordered by creation date (newest first).
    
    **Filters:**
    - status: Filter by bid status
    
    **Pagination:**
    - skip, limit: Standard pagination
    
    **Authentication required.**
    """,
    responses={
        200: {"description": "List of contractor's bids"},
        401: {"description": "Not authenticated"}
    }
)
async def get_my_bids(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[BidStatus] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_user),
    service: BidService = Depends(get_bid_service)
) -> BidListResponse:
    """Get bids submitted by current contractor."""
    return service.get_my_bids(
        contractor_id=current_user.id,
        skip=skip,
        limit=limit,
        status=status
    )


@router.get(
    "/{bid_id}",
    response_model=BidResponse,
    summary="Get bid details",
    description="""
    Get detailed information about a specific bid.
    
    **Authorization:**
    - Contractor who submitted: Can see their bid
    - Society owner of the request: Can see all bids on their request
    - Admin: Can see any bid
    
    **Authentication required.**
    """,
    responses={
        200: {"description": "Bid details"},
        404: {"description": "Bid not found"},
        401: {"description": "Not authenticated"}
    }
)
async def get_bid(
    bid_id: int,
    current_user: User = Depends(get_current_user),
    service: BidService = Depends(get_bid_service)
) -> BidResponse:
    """Get bid by ID."""
    bid = service.get_bid(bid_id)
    return BidResponse.model_validate(bid)


@router.put(
    "/{bid_id}",
    response_model=BidResponse,
    summary="Update bid",
    description="""
    Update bid details (amount and/or proposal).
    
    **Authorization:**
    - Only the contractor who submitted the bid can update it
    
    **Business Rules:**
    - Can only update PENDING bids
    - Cannot update accepted, rejected, or withdrawn bids
    - At least one field (amount or proposal) must be provided
    
    **Authentication required.**
    """,
    responses={
        200: {"description": "Bid updated successfully"},
        400: {"description": "Cannot update bid (wrong status)"},
        403: {"description": "Not authorized to update this bid"},
        404: {"description": "Bid not found"},
        401: {"description": "Not authenticated"}
    }
)
async def update_bid(
    bid_id: int,
    update_data: BidUpdate,
    current_user: User = Depends(get_current_user),
    service: BidService = Depends(get_bid_service)
) -> BidResponse:
    """Update bid (contractor only, pending bids only)."""
    bid = service.update_bid(bid_id, update_data, current_user.id)
    return BidResponse.model_validate(bid)


@router.patch(
    "/{bid_id}/accept",
    response_model=BidResponse,
    summary="Accept a bid",
    description="""
    Accept a bid on a request. This action:
    1. Sets bid status to ACCEPTED
    2. Rejects all other pending bids on the request
    3. Assigns the contractor to the request
    4. Changes request status to IN_PROGRESS
    
    **Authorization:**
    - Only the society that posted the request can accept bids
    - Admin can also accept bids
    
    **Business Rules:**
    - Can only accept PENDING bids
    - Request must still be OPEN
    - After acceptance, work is automatically assigned
    
    **Authentication required.**
    """,
    responses={
        200: {"description": "Bid accepted successfully"},
        400: {"description": "Cannot accept bid (wrong status)"},
        403: {"description": "Not authorized to accept bids"},
        404: {"description": "Bid not found"},
        401: {"description": "Not authenticated"}
    }
)
async def accept_bid(
    bid_id: int,
    current_user: User = Depends(get_current_user),
    service: BidService = Depends(get_bid_service)
) -> BidResponse:
    """Accept a bid (society owner or admin only)."""
    bid = service.accept_bid(bid_id, current_user.id)
    return BidResponse.model_validate(bid)


@router.patch(
    "/{bid_id}/withdraw",
    response_model=BidResponse,
    summary="Withdraw a bid",
    description="""
    Withdraw a submitted bid.
    
    **Authorization:**
    - Only the contractor who submitted the bid can withdraw it
    
    **Business Rules:**
    - Can only withdraw PENDING bids
    - Cannot withdraw accepted, rejected, or already withdrawn bids
    - Withdrawn bids cannot be reactivated
    
    **Authentication required.**
    """,
    responses={
        200: {"description": "Bid withdrawn successfully"},
        400: {"description": "Cannot withdraw bid (wrong status)"},
        403: {"description": "Not authorized to withdraw this bid"},
        404: {"description": "Bid not found"},
        401: {"description": "Not authenticated"}
    }
)
async def withdraw_bid(
    bid_id: int,
    current_user: User = Depends(get_current_user),
    service: BidService = Depends(get_bid_service)
) -> BidResponse:
    """Withdraw a bid (contractor only, pending bids only)."""
    bid = service.withdraw_bid(bid_id, current_user.id)
    return BidResponse.model_validate(bid)


@router.delete(
    "/{bid_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete bid",
    description="""
    Delete a bid permanently.
    
    **Authorization:**
    - Contractor who submitted the bid
    - Admin
    
    **Business Rules:**
    - Cannot delete ACCEPTED bids
    - Can delete pending, rejected, or withdrawn bids
    
    **Authentication required.**
    """,
    responses={
        204: {"description": "Bid deleted successfully"},
        400: {"description": "Cannot delete accepted bid"},
        403: {"description": "Not authorized to delete this bid"},
        404: {"description": "Bid not found"},
        401: {"description": "Not authenticated"}
    }
)
async def delete_bid(
    bid_id: int,
    current_user: User = Depends(get_current_user),
    service: BidService = Depends(get_bid_service)
):
    """Delete a bid (contractor or admin only)."""
    service.delete_bid(bid_id, current_user.id)
    return None


@router.get(
    "/request/{request_id}/statistics",
    response_model=BidStatistics,
    summary="Get bid statistics",
    description="""
    Get statistics about bids on a request.
    
    **Statistics include:**
    - Total number of bids
    - Count by status (pending, accepted, rejected, withdrawn)
    - Average bid amount (for pending bids)
    - Lowest and highest bid amounts
    
    **Authorization:**
    - Only society owner of the request
    - Admin
    
    **Authentication required.**
    """,
    responses={
        200: {"description": "Bid statistics"},
        403: {"description": "Not authorized to view statistics"},
        404: {"description": "Request not found"},
        401: {"description": "Not authenticated"}
    }
)
async def get_bid_statistics(
    request_id: int,
    current_user: User = Depends(get_current_user),
    service: BidService = Depends(get_bid_service)
) -> BidStatistics:
    """Get bid statistics for a request (society owner or admin only)."""
    return service.get_bid_statistics(request_id, current_user.id)
