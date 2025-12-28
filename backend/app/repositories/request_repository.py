"""
Request repository for database operations.
"""

from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models.request import Request, RequestStatus, RequestCategory


class RequestRepository:
    """Repository for Request database operations."""
    
    def __init__(self, db: Session):
        """Initialize repository with database session."""
        self.db = db
    
    def create(self, request_data: dict) -> Request:
        """
        Create a new request.
        
        Args:
            request_data: Dictionary with request data
            
        Returns:
            Created Request object
        """
        request = Request(**request_data)
        self.db.add(request)
        self.db.commit()
        self.db.refresh(request)
        return request
    
    def get_by_id(self, request_id: int) -> Optional[Request]:
        """
        Get request by ID.
        
        Args:
            request_id: Request ID
            
        Returns:
            Request object or None
        """
        return self.db.query(Request).filter(Request.id == request_id).first()
    
    def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[RequestStatus] = None,
        category: Optional[RequestCategory] = None,
        city: Optional[str] = None,
        state: Optional[str] = None
    ) -> tuple[List[Request], int]:
        """
        Get all requests with optional filters and pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            status: Filter by status
            category: Filter by category
            city: Filter by city
            state: Filter by state
            
        Returns:
            Tuple of (list of requests, total count)
        """
        query = self.db.query(Request)
        
        # Apply filters
        if status:
            query = query.filter(Request.status == status)
        if category:
            query = query.filter(Request.category == category)
        if city:
            query = query.filter(Request.city.ilike(f"%{city}%"))
        if state:
            query = query.filter(Request.state.ilike(f"%{state}%"))
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        requests = query.order_by(Request.created_at.desc()).offset(skip).limit(limit).all()
        
        return requests, total
    
    def search(
        self,
        search_query: Optional[str] = None,
        category: Optional[RequestCategory] = None,
        status: Optional[RequestStatus] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        budget_min: Optional[float] = None,
        budget_max: Optional[float] = None,
        skip: int = 0,
        limit: int = 20
    ) -> tuple[List[Request], int]:
        """
        Search requests with multiple filters.
        
        Args:
            search_query: Search in title and description
            category: Filter by category
            status: Filter by status
            city: Filter by city
            state: Filter by state
            budget_min: Minimum budget filter
            budget_max: Maximum budget filter
            skip: Pagination offset
            limit: Page size
            
        Returns:
            Tuple of (list of requests, total count)
        """
        query = self.db.query(Request)
        
        # Text search
        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                or_(
                    Request.title.ilike(search_pattern),
                    Request.description.ilike(search_pattern),
                    Request.required_skills.ilike(search_pattern)
                )
            )
        
        # Category filter
        if category:
            query = query.filter(Request.category == category)
        
        # Status filter
        if status:
            query = query.filter(Request.status == status)
        
        # Location filters
        if city:
            query = query.filter(Request.city.ilike(f"%{city}%"))
        if state:
            query = query.filter(Request.state.ilike(f"%{state}%"))
        
        # Budget filters
        if budget_min is not None:
            query = query.filter(
                or_(
                    Request.budget_max >= budget_min,
                    Request.budget_max.is_(None)
                )
            )
        if budget_max is not None:
            query = query.filter(
                or_(
                    Request.budget_min <= budget_max,
                    Request.budget_min.is_(None)
                )
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        requests = query.order_by(Request.created_at.desc()).offset(skip).limit(limit).all()
        
        return requests, total
    
    def get_by_society(
        self,
        society_id: int,
        skip: int = 0,
        limit: int = 20
    ) -> tuple[List[Request], int]:
        """
        Get requests posted by a specific society.
        
        Args:
            society_id: Society user ID
            skip: Pagination offset
            limit: Page size
            
        Returns:
            Tuple of (list of requests, total count)
        """
        query = self.db.query(Request).filter(Request.society_id == society_id)
        total = query.count()
        requests = query.order_by(Request.created_at.desc()).offset(skip).limit(limit).all()
        return requests, total
    
    def get_by_contractor(
        self,
        contractor_id: int,
        skip: int = 0,
        limit: int = 20
    ) -> tuple[List[Request], int]:
        """
        Get requests assigned to a specific contractor.
        
        Args:
            contractor_id: Contractor user ID
            skip: Pagination offset
            limit: Page size
            
        Returns:
            Tuple of (list of requests, total count)
        """
        query = self.db.query(Request).filter(Request.assigned_contractor_id == contractor_id)
        total = query.count()
        requests = query.order_by(Request.created_at.desc()).offset(skip).limit(limit).all()
        return requests, total
    
    def update(self, request: Request, update_data: dict) -> Request:
        """
        Update request with new data.
        
        Args:
            request: Request object to update
            update_data: Dictionary with fields to update
            
        Returns:
            Updated Request object
        """
        for key, value in update_data.items():
            if value is not None and hasattr(request, key):
                setattr(request, key, value)
        
        request.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(request)
        return request
    
    def update_status(
        self,
        request: Request,
        status: RequestStatus,
        contractor_id: Optional[int] = None
    ) -> Request:
        """
        Update request status.
        
        Args:
            request: Request object
            status: New status
            contractor_id: Contractor ID if assigning work
            
        Returns:
            Updated Request object
        """
        request.status = status
        
        if status == RequestStatus.IN_PROGRESS:
            request.started_at = datetime.utcnow()
            if contractor_id:
                request.assigned_contractor_id = contractor_id
        elif status == RequestStatus.COMPLETED:
            request.completed_at = datetime.utcnow()
        
        request.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(request)
        return request
    
    def delete(self, request: Request) -> bool:
        """
        Delete request.
        
        Args:
            request: Request object to delete
            
        Returns:
            True if successful
        """
        self.db.delete(request)
        self.db.commit()
        return True
    
    def count_by_status(self, status: RequestStatus) -> int:
        """
        Count requests by status.
        
        Args:
            status: Request status
            
        Returns:
            Number of requests
        """
        return self.db.query(Request).filter(Request.status == status).count()
    
    def count_by_society(self, society_id: int) -> int:
        """
        Count requests posted by society.
        
        Args:
            society_id: Society user ID
            
        Returns:
            Number of requests
        """
        return self.db.query(Request).filter(Request.society_id == society_id).count()
    
    def count_by_contractor(self, contractor_id: int) -> int:
        """
        Count requests assigned to contractor.
        
        Args:
            contractor_id: Contractor user ID
            
        Returns:
            Number of requests
        """
        return self.db.query(Request).filter(Request.assigned_contractor_id == contractor_id).count()
