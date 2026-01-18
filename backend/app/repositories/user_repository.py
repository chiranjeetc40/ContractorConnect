"""
User repository for database operations.
"""

from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.user import User, UserRole, UserStatus


class UserRepository:
    """Repository for User database operations."""
    
    def __init__(self, db: Session):
        """Initialize repository with database session."""
        self.db = db
    
    def create(self, user_data: dict) -> User:
        """
        Create a new user.
        
        Args:
            user_data: Dictionary with user data
            
        Returns:
            Created User object
        """
        user = User(**user_data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """
        Get user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User object or None
        """
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_by_phone(self, phone_number: str) -> Optional[User]:
        """
        Get user by phone number.
        
        Args:
            phone_number: Phone number
            
        Returns:
            User object or None
        """
        return self.db.query(User).filter(User.phone_number == phone_number).first()
    
    def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email.
        
        Args:
            email: Email address
            
        Returns:
            User object or None
        """
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_phone_or_email(self, phone_number: str, email: Optional[str] = None) -> Optional[User]:
        """
        Get user by phone number or email.
        
        Args:
            phone_number: Phone number
            email: Email address (optional)
            
        Returns:
            User object or None
        """
        query = self.db.query(User).filter(User.phone_number == phone_number)
        if email:
            query = query.filter(or_(User.phone_number == phone_number, User.email == email))
        return query.first()
    
    def update(self, user: User, update_data: dict) -> User:
        """
        Update user with new data.
        
        Args:
            user: User object to update
            update_data: Dictionary with fields to update
            
        Returns:
            Updated User object
        """
        for key, value in update_data.items():
            if value is not None and hasattr(user, key):
                setattr(user, key, value)
        
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update_last_login(self, user: User) -> User:
        """
        Update user's last login timestamp.
        
        Args:
            user: User object
            
        Returns:
            Updated User object
        """
        user.last_login_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def verify_user(self, user: User) -> User:
        """
        Mark user as verified.
        
        Args:
            user: User object
            
        Returns:
            Updated User object
        """
        user.is_verified = True
        user.status = UserStatus.ACTIVE
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def deactivate(self, user: User) -> User:
        """
        Deactivate user account.
        
        Args:
            user: User object
            
        Returns:
            Updated User object
        """
        user.is_active = False
        user.status = UserStatus.INACTIVE
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def activate(self, user: User) -> User:
        """
        Activate user account.
        
        Args:
            user: User object
            
        Returns:
            Updated User object
        """
        user.is_active = True
        user.status = UserStatus.ACTIVE
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def delete(self, user: User) -> bool:
        """
        Delete user (soft delete by deactivating).
        
        Args:
            user: User object
            
        Returns:
            True if successful
        """
        self.deactivate(user)
        return True
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        """
        Get all users with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of User objects
        """
        return self.db.query(User).offset(skip).limit(limit).all()
    
    def get_by_role(self, role: UserRole, skip: int = 0, limit: int = 100) -> List[User]:
        """
        Get users by role.
        
        Args:
            role: User role
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of User objects
        """
        return self.db.query(User).filter(User.role == role).offset(skip).limit(limit).all()
    
    def count_by_role(self, role: UserRole) -> int:
        """
        Count users by role.
        
        Args:
            role: User role
            
        Returns:
            Number of users
        """
        return self.db.query(User).filter(User.role == role).count()
    
    def exists_by_phone(self, phone_number: str) -> bool:
        """
        Check if user exists by phone number.
        
        Args:
            phone_number: Phone number
            
        Returns:
            True if exists
        """
        return self.db.query(User).filter(User.phone_number == phone_number).count() > 0
    
    def exists_by_email(self, email: str) -> bool:
        """
        Check if user exists by email.
        
        Args:
            email: Email address
            
        Returns:
            True if exists
        """
        return self.db.query(User).filter(User.email == email).count() > 0

    def list(self, skip: int = 0, limit: int = 100) -> List[User]:
        """
        List all users with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of User objects
        """
        return self.db.query(User).offset(skip).limit(limit).all()