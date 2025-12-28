"""
Request management API endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.request import RequestStatus, RequestCategory
from app.repositories.request_repository import RequestRepository
from app.repositories.user_repository import UserRepository
from app.services.request_service import RequestService
from app.schemas.request import (
    RequestCreate,
    RequestUpdate,
    RequestStatusUpdate,
    RequestResponse,
    RequestListResponse,
    RequestSearchFilters
)


router = APIRouter(prefix="/requests", tags=["Requests"])


def get_request_service(db: Session = Depends(get_db)) -> RequestService:
    """Dependency to get RequestService instance."""
    request_repo = RequestRepository(db)
    user_repo = UserRepository(db)
    return RequestService(request_repo, user_repo)


@router.post(
    "/",
    response_model=RequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new request",
    description="""
    Create a new civil work request. Only societies can create requests.
    
    **Required fields:**
    - title: Clear and descriptive title
    - description: Detailed description of work needed
    - category: Type of work (construction, renovation, plumbing, etc.)
    - location details: address, city, state, pincode
    
    **Optional fields:**
    - budget_min, budget_max: Budget range
    - required_skills: Comma-separated skills needed
    - expected_start_date, expected_completion_date: Timeline
    - images: Comma-separated image URLs
    """,
    responses={
        201: {"description": "Request created successfully"},
        403: {"description": "User is not a society"},
        401: {"description": "Not authenticated"}
    }
)
async def create_request(
    request_data: RequestCreate,
    current_user: User = Depends(get_current_user),
    service: RequestService = Depends(get_request_service)
) -> RequestResponse:
    """Create a new request (society only)."""
    request = service.create_request(request_data, current_user.id)
    return RequestResponse.model_validate(request)


@router.get(
    "/",
    response_model=RequestListResponse,
    summary="List all requests",
    description="""
    Get a paginated list of requests with optional filters.
    
    **Filters:**
    - status: Filter by request status
    - category: Filter by work category
    - city: Filter by city
    - state: Filter by state
    
    **Pagination:**
    - skip: Number of records to skip (default: 0)
    - limit: Number of records to return (default: 20, max: 100)
    
    Public endpoint - no authentication required for browsing.
    """
)
async def list_requests(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum records to return"),
    status: Optional[RequestStatus] = Query(None, description="Filter by status"),
    category: Optional[RequestCategory] = Query(None, description="Filter by category"),
    city: Optional[str] = Query(None, description="Filter by city"),
    state: Optional[str] = Query(None, description="Filter by state"),
    service: RequestService = Depends(get_request_service)
) -> RequestListResponse:
    """List requests with pagination and filters."""
    return service.list_requests(
        skip=skip,
        limit=limit,
        status=status,
        category=category,
        city=city,
        state=state
    )


@router.get(
    "/search",
    response_model=RequestListResponse,
    summary="Search requests",
    description="""
    Advanced search for requests with multiple filters.
    
    **Search:**
    - search_query: Search in title, description, and required skills
    
    **Filters:**
    - category: Work category
    - status: Request status
    - city, state: Location filters
    - budget_min, budget_max: Budget range filters
    
    **Pagination:**
    - skip, limit: Standard pagination parameters
    """
)
async def search_requests(
    search_query: Optional[str] = Query(None, description="Search in title and description"),
    category: Optional[RequestCategory] = Query(None, description="Filter by category"),
    status: Optional[RequestStatus] = Query(None, description="Filter by status"),
    city: Optional[str] = Query(None, description="Filter by city"),
    state: Optional[str] = Query(None, description="Filter by state"),
    budget_min: Optional[float] = Query(None, ge=0, description="Minimum budget"),
    budget_max: Optional[float] = Query(None, ge=0, description="Maximum budget"),
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Records to return"),
    service: RequestService = Depends(get_request_service)
) -> RequestListResponse:
    """Search requests with advanced filters."""
    filters = RequestSearchFilters(
        search_query=search_query,
        category=category,
        status=status,
        city=city,
        state=state,
        budget_min=budget_min,
        budget_max=budget_max,
        skip=skip,
        limit=limit
    )
    return service.search_requests(filters)


@router.get(
    "/my-requests",
    response_model=RequestListResponse,
    summary="Get my requests",
    description="""
    Get all requests posted by the current society user.
    
    Returns an empty list for contractor and admin users.
    
    **Authentication required.**
    """,
    responses={
        200: {"description": "List of user's requests"},
        401: {"description": "Not authenticated"}
    }
)
async def get_my_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: RequestService = Depends(get_request_service)
) -> RequestListResponse:
    """Get requests posted by current user."""
    return service.get_my_requests(current_user.id, skip, limit)


@router.get(
    "/assigned-to-me",
    response_model=RequestListResponse,
    summary="Get assigned requests",
    description="""
    Get all requests assigned to the current contractor user.
    
    Returns an empty list for society and admin users.
    
    **Authentication required.**
    """,
    responses={
        200: {"description": "List of assigned requests"},
        401: {"description": "Not authenticated"}
    }
)
async def get_assigned_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: RequestService = Depends(get_request_service)
) -> RequestListResponse:
    """Get requests assigned to current contractor."""
    return service.get_assigned_requests(current_user.id, skip, limit)


@router.get(
    "/{request_id}",
    response_model=RequestResponse,
    summary="Get request details",
    description="""
    Get detailed information about a specific request.
    
    Returns complete request data including:
    - Basic info (title, description, category)
    - Location details
    - Budget range
    - Status and timeline
    - Society and contractor info (if assigned)
    
    Public endpoint - no authentication required.
    """,
    responses={
        200: {"description": "Request details"},
        404: {"description": "Request not found"}
    }
)
async def get_request(
    request_id: int,
    service: RequestService = Depends(get_request_service)
) -> RequestResponse:
    """Get request by ID."""
    request = service.get_request(request_id)
    return RequestResponse.model_validate(request)


@router.put(
    "/{request_id}",
    response_model=RequestResponse,
    summary="Update request",
    description="""
    Update request details. Only the society that posted the request or an admin can update it.
    
    **Updatable fields:**
    - title, description
    - category
    - location details
    - budget range
    - required skills
    - expected dates
    - images
    
    Cannot update: status, society_id, assigned_contractor_id (use status update endpoint)
    
    **Authentication required.**
    """,
    responses={
        200: {"description": "Request updated successfully"},
        403: {"description": "Not authorized to update this request"},
        404: {"description": "Request not found"},
        401: {"description": "Not authenticated"}
    }
)
async def update_request(
    request_id: int,
    update_data: RequestUpdate,
    current_user: User = Depends(get_current_user),
    service: RequestService = Depends(get_request_service)
) -> RequestResponse:
    """Update request (owner or admin only)."""
    request = service.update_request(request_id, update_data, current_user.id)
    return RequestResponse.model_validate(request)


@router.patch(
    "/{request_id}/status",
    response_model=RequestResponse,
    summary="Update request status",
    description="""
    Update the status of a request.
    
    **Valid status transitions:**
    - OPEN → IN_PROGRESS (when contractor accepts)
    - OPEN → CANCELLED (by society)
    - IN_PROGRESS → COMPLETED (when work is done)
    - IN_PROGRESS → ON_HOLD (temporary pause)
    - IN_PROGRESS → CANCELLED (by society or contractor)
    - ON_HOLD → IN_PROGRESS (resume work)
    - ON_HOLD → CANCELLED
    
    **Authorization:**
    - Society owner can update their own requests
    - Assigned contractor can update status
    - Admin can update any request
    
    **Authentication required.**
    """,
    responses={
        200: {"description": "Status updated successfully"},
        400: {"description": "Invalid status transition"},
        403: {"description": "Not authorized to update status"},
        404: {"description": "Request not found"},
        401: {"description": "Not authenticated"}
    }
)
async def update_request_status(
    request_id: int,
    status_data: RequestStatusUpdate,
    current_user: User = Depends(get_current_user),
    service: RequestService = Depends(get_request_service)
) -> RequestResponse:
    """Update request status."""
    request = service.update_request_status(request_id, status_data, current_user.id)
    return RequestResponse.model_validate(request)


@router.delete(
    "/{request_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete request",
    description="""
    Delete a request. Only the society that posted the request or an admin can delete it.
    
    **Restrictions:**
    - Cannot delete requests with status IN_PROGRESS
    - Cannot delete requests with status COMPLETED
    
    Can only delete requests with status: OPEN, CANCELLED, ON_HOLD
    
    **Authentication required.**
    """,
    responses={
        204: {"description": "Request deleted successfully"},
        400: {"description": "Cannot delete request with current status"},
        403: {"description": "Not authorized to delete this request"},
        404: {"description": "Request not found"},
        401: {"description": "Not authenticated"}
    }
)
async def delete_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    service: RequestService = Depends(get_request_service)
):
    """Delete request (owner or admin only)."""
    service.delete_request(request_id, current_user.id)
    return None
