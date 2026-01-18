"""
User service for user management operations.
"""

from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password


class UserService:
    """Service for user operations."""
    
    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db
        self.user_repo = UserRepository(db)
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """
        Get user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User object or None
        """
        return self.user_repo.get_by_id(user_id)
    
    def get_user_by_phone(self, phone_number: str) -> Optional[User]:
        """
        Get user by phone number.
        
        Args:
            phone_number: Phone number
            
        Returns:
            User object or None
        """
        return self.user_repo.get_by_phone(phone_number)
    
    def create_user(self, user_data: UserCreate) -> User:
        """
        Create a new user.
        
        Args:
            user_data: User creation data
            
        Returns:
            Created User object
        """
        # Check if user already exists
        if self.user_repo.exists_by_phone(user_data.phone_number):
            raise ValueError("User with this phone number already exists")
        
        if user_data.email and self.user_repo.exists_by_email(user_data.email):
            raise ValueError("User with this email already exists")
        
        # Create user dictionary
        user_dict = user_data.model_dump(exclude_unset=True, exclude={'password'})
        
        # Hash password if provided
        if user_data.password:
            user_dict['password_hash'] = hash_password(user_data.password)
        
        # Create user
        user = self.user_repo.create(user_dict)
        
        return user
    
    def update_user(self, user_id: int, update_data: UserUpdate) -> User:
        """
        Update user profile.
        
        Args:
            user_id: User ID
            update_data: Data to update
            
        Returns:
            Updated User object
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        # Check email uniqueness if updating email
        if update_data.email and update_data.email != user.email:
            if self.user_repo.exists_by_email(update_data.email):
                raise ValueError("Email already in use")
        
        # Update user
        update_dict = update_data.model_dump(exclude_unset=True)
        updated_user = self.user_repo.update(user, update_dict)
        
        return updated_user
    
    def verify_user(self, user_id: int) -> User:
        """
        Mark user as verified.
        
        Args:
            user_id: User ID
            
        Returns:
            Updated User object
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        return self.user_repo.verify_user(user)
    
    def update_last_login(self, user_id: int) -> User:
        """
        Update user's last login timestamp.
        
        Args:
            user_id: User ID
            
        Returns:
            Updated User object
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        return self.user_repo.update_last_login(user)
    
    def deactivate_user(self, user_id: int) -> User:
        """
        Deactivate user account.
        
        Args:
            user_id: User ID
            
        Returns:
            Updated User object
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        return self.user_repo.deactivate(user)
    
    def activate_user(self, user_id: int) -> User:
        """
        Activate user account.
        
        Args:
            user_id: User ID
            
        Returns:
            Updated User object
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        return self.user_repo.activate(user)
    
    def get_contractors(self, skip: int = 0, limit: int = 100):
        """
        Get all contractors.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of contractor users
        """
        return self.user_repo.get_by_role(UserRole.CONTRACTOR, skip, limit)
    
    def get_societies(self, skip: int = 0, limit: int = 100):
        """
        Get all building societies.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of society users
        """
        return self.user_repo.get_by_role(UserRole.SOCIETY, skip, limit)

    def list_users(self, skip: int = 0, limit: int = 100):
        """
        List all users.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of user objects
        """
        return self.user_repo.list(skip=skip, limit=limit)