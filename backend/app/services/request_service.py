"""
Request service for business logic.
"""

from typing import Optional, List
from fastapi import HTTPException, status

from app.models.request import Request, RequestStatus, RequestCategory
from app.models.user import User, UserRole
from app.repositories.request_repository import RequestRepository
from app.repositories.user_repository import UserRepository
from app.schemas.request import (
    RequestCreate,
    RequestUpdate,
    RequestStatusUpdate,
    RequestResponse,
    RequestListResponse,
    RequestSearchFilters
)


class RequestService:
    """Service for request business logic."""
    
    def __init__(self, request_repo: RequestRepository, user_repo: UserRepository):
        """Initialize service with repositories."""
        self.request_repo = request_repo
        self.user_repo = user_repo
    
    def create_request(self, request_data: RequestCreate, society_id: int) -> Request:
        """
        Create a new request.
        
        Args:
            request_data: Request creation data
            society_id: ID of society posting the request
            
        Returns:
            Created Request object
            
        Raises:
            HTTPException: If user is not a society or validation fails
        """
        # Verify user is a society
        society = self.user_repo.get_by_id(society_id)
        print(f"🔐 DEBUG create_request - Role: {society.role if society else None} (type: {type(society.role).__name__ if society else None})")
        print(f"🔐 DEBUG create_request - UserRole.SOCIETY: {UserRole.SOCIETY} (type: {type(UserRole.SOCIETY).__name__})")
        print(f"🔐 DEBUG create_request - Comparison: {society.role if society else None} != {UserRole.SOCIETY} = {society.role != UserRole.SOCIETY if society else None}")
        
        if not society or society.role != UserRole.SOCIETY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Only societies can post requests. User role: {society.role if society else 'None'}"
            )
        
        # Prepare request data
        data = request_data.model_dump(exclude_unset=True)
        data["society_id"] = society_id
        data["status"] = RequestStatus.OPEN
        
        # Create request
        request = self.request_repo.create(data)
        return request
    
    def get_request(self, request_id: int) -> Request:
        """
        Get request by ID.
        
        Args:
            request_id: Request ID
            
        Returns:
            Request object
            
        Raises:
            HTTPException: If request not found
        """
        request = self.request_repo.get_by_id(request_id)
        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Request with ID {request_id} not found"
            )
        return request
    
    def list_requests(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[RequestStatus] = None,
        category: Optional[RequestCategory] = None,
        city: Optional[str] = None,
        state: Optional[str] = None
    ) -> RequestListResponse:
        """
        List requests with pagination and filters.
        
        Args:
            skip: Number of records to skip
            limit: Maximum records to return
            status: Filter by status
            category: Filter by category
            city: Filter by city
            state: Filter by state
            
        Returns:
            RequestListResponse with paginated data
        """
        requests, total = self.request_repo.get_all(
            skip=skip,
            limit=limit,
            status=status,
            category=category,
            city=city,
            state=state
        )
        
        return RequestListResponse(
            requests=requests,
            total=total,
            page=skip // limit + 1,
            page_size=limit,
            total_pages=(total + limit - 1) // limit
        )
    
    def search_requests(self, filters: RequestSearchFilters) -> RequestListResponse:
        """
        Search requests with advanced filters.
        
        Args:
            filters: Search filters
            
        Returns:
            RequestListResponse with search results
        """
        requests, total = self.request_repo.search(
            search_query=filters.search_query,
            category=filters.category,
            status=filters.status,
            city=filters.city,
            state=filters.state,
            budget_min=filters.budget_min,
            budget_max=filters.budget_max,
            skip=filters.skip,
            limit=filters.limit
        )
        
        return RequestListResponse(
            requests=requests,
            total=total,
            page=filters.skip // filters.limit + 1,
            page_size=filters.limit,
            total_pages=(total + filters.limit - 1) // filters.limit
        )
    
    def get_my_requests(self, user_id: int, skip: int = 0, limit: int = 20) -> RequestListResponse:
        """
        Get requests posted by current society.
        
        Args:
            user_id: Society user ID
            skip: Pagination offset
            limit: Page size
            
        Returns:
            RequestListResponse with user's requests
        """
        user = self.user_repo.get_by_id(user_id)
        print(f"🔐 DEBUG get_my_requests - User ID: {user_id}")
        print(f"🔐 DEBUG get_my_requests - User found: {user is not None}")
        if user:
            print(f"🔐 DEBUG get_my_requests - User role: {user.role} (type: {type(user.role).__name__})")
        
        requests, total = self.request_repo.get_by_society(user_id, skip, limit)
        
        return RequestListResponse(
            requests=requests,
            total=total,
            page=skip // limit + 1,
            page_size=limit,
            total_pages=(total + limit - 1) // limit
        )
    
    def get_assigned_requests(
        self,
        contractor_id: int,
        skip: int = 0,
        limit: int = 20
    ) -> RequestListResponse:
        """
        Get requests assigned to contractor.
        
        Args:
            contractor_id: Contractor user ID
            skip: Pagination offset
            limit: Page size
            
        Returns:
            RequestListResponse with assigned requests
        """
        requests, total = self.request_repo.get_by_contractor(contractor_id, skip, limit)
        
        return RequestListResponse(
            requests=requests,
            total=total,
            page=skip // limit + 1,
            page_size=limit,
            total_pages=(total + limit - 1) // limit
        )
    
    def update_request(
        self,
        request_id: int,
        update_data: RequestUpdate,
        user_id: int
    ) -> Request:
        """
        Update request details.
        
        Args:
            request_id: Request ID
            update_data: Update data
            user_id: ID of user making the update
            
        Returns:
            Updated Request object
            
        Raises:
            HTTPException: If request not found or unauthorized
        """
        # Get request
        request = self.get_request(request_id)
        
        # Check authorization
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Only society owner or admin can update
        if request.society_id != user_id and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this request"
            )
        
        # Update request
        data = update_data.model_dump(exclude_unset=True)
        updated_request = self.request_repo.update(request, data)
        return updated_request
    
    def update_request_status(
        self,
        request_id: int,
        status_data: RequestStatusUpdate,
        user_id: int
    ) -> Request:
        """
        Update request status.
        
        Args:
            request_id: Request ID
            status_data: Status update data
            user_id: ID of user making the update
            
        Returns:
            Updated Request object
            
        Raises:
            HTTPException: If unauthorized or invalid status transition
        """
        # Get request
        request = self.get_request(request_id)
        
        # Check authorization
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Authorization rules:
        # - Society owner can update their own requests
        # - Assigned contractor can update status
        # - Admin can update any request
        is_owner = request.society_id == user_id
        is_assigned_contractor = request.assigned_contractor_id == user_id
        is_admin = user.role == UserRole.ADMIN
        
        if not (is_owner or is_assigned_contractor or is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this request status"
            )
        
        # Validate status transitions
        current_status = request.status
        new_status = status_data.status
        
        # Define valid transitions
        valid_transitions = {
            RequestStatus.OPEN: [RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
            RequestStatus.IN_PROGRESS: [RequestStatus.COMPLETED, RequestStatus.ON_HOLD, RequestStatus.CANCELLED],
            RequestStatus.ON_HOLD: [RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
            RequestStatus.COMPLETED: [],  # Completed is final
            RequestStatus.CANCELLED: []   # Cancelled is final
        }
        
        if new_status not in valid_transitions.get(current_status, []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot transition from {current_status} to {new_status}"
            )
        
        # Update status
        updated_request = self.request_repo.update_status(
            request,
            new_status,
            status_data.contractor_id
        )
        return updated_request
    
    def delete_request(self, request_id: int, user_id: int) -> bool:
        """
        Delete a request.
        
        Args:
            request_id: Request ID
            user_id: ID of user deleting the request
            
        Returns:
            True if successful
            
        Raises:
            HTTPException: If unauthorized
        """
        # Get request
        request = self.get_request(request_id)
        
        # Check authorization
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Only society owner or admin can delete
        if request.society_id != user_id and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this request"
            )
        
        # Cannot delete if work is in progress or completed
        if request.status in [RequestStatus.IN_PROGRESS, RequestStatus.COMPLETED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete request with status {request.status}"
            )
        
        # Delete request
        return self.request_repo.delete(request)
