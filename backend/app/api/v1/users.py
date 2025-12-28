"""
User management API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.user_service import UserService
from app.api.dependencies import get_current_active_user, get_current_verified_user
from app.schemas.user import UserUpdate, UserProfile, UserResponse
from app.models.user import User

router = APIRouter()


@router.get(
    "/profile",
    response_model=UserProfile,
    summary="Get User Profile",
    description="""
    Get the complete profile of currently authenticated user.
    
    **Authentication Required:**
    Valid JWT access token in Authorization header.
    
    **Returns:**
    - Complete user profile with all fields
    - Personal information
    - Contact details
    - Address information
    - Verification status
    - Account timestamps
    """,
    responses={
        200: {
            "description": "Profile retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "phone_number": "+919876543210",
                        "email": "contractor@example.com",
                        "name": "John Doe",
                        "role": "contractor",
                        "status": "active",
                        "profile_image": "https://example.com/image.jpg",
                        "description": "Experienced civil contractor",
                        "address": "123 Main St",
                        "city": "Mumbai",
                        "state": "Maharashtra",
                        "pincode": "400001",
                        "is_verified": True,
                        "is_active": True,
                        "created_at": "2025-12-28T10:00:00",
                        "updated_at": "2025-12-28T15:30:00",
                        "last_login_at": "2025-12-28T15:30:00"
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        403: {"description": "Account not active"}
    }
)
async def get_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's complete profile."""
    return current_user


@router.put(
    "/profile",
    response_model=UserProfile,
    summary="Update User Profile",
    description="""
    Update the profile of currently authenticated user.
    
    **Authentication Required:**
    Valid JWT access token in Authorization header.
    
    **Updatable Fields:**
    - name: Full name
    - email: Email address (must be unique)
    - address: Physical address
    - city, state, pincode: Location details
    - description: Skills, experience (for contractors)
    - profile_image: Profile picture URL
    
    **Note:**
    - Phone number cannot be changed
    - Role cannot be changed
    - All fields are optional
    
    **Returns:**
    Updated user profile with all fields.
    """,
    responses={
        200: {
            "description": "Profile updated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "phone_number": "+919876543210",
                        "email": "newemail@example.com",
                        "name": "John Doe Updated",
                        "role": "contractor",
                        "status": "active",
                        "city": "Delhi",
                        "is_verified": True,
                        "is_active": True
                    }
                }
            }
        },
        400: {"description": "Email already in use or invalid data"},
        401: {"description": "Not authenticated"},
        422: {"description": "Validation error"}
    }
)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile."""
    try:
        user_service = UserService(db)
        updated_user = user_service.update_user(current_user.id, update_data)
        return updated_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get User by ID",
    description="""
    Get public profile of any user by their ID.
    
    **Authentication Required:**
    Valid JWT access token in Authorization header.
    
    **Returns:**
    Public user information (limited fields for privacy):
    - Basic info (name, role, city)
    - Profile image
    - Public description
    - Verification status
    
    **Note:** Sensitive information (email, phone, address) is not included.
    """,
    responses={
        200: {
            "description": "User profile retrieved",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "phone_number": "+91**********",
                        "name": "John Doe",
                        "role": "contractor",
                        "status": "active",
                        "city": "Mumbai",
                        "state": "Maharashtra",
                        "is_verified": True
                    }
                }
            }
        },
        404: {"description": "User not found"},
        401: {"description": "Not authenticated"}
    }
)
async def get_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Get public profile of a user by ID."""
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.delete(
    "/account",
    status_code=status.HTTP_200_OK,
    summary="Deactivate Account",
    description="""
    Deactivate (soft delete) current user's account.
    
    **Authentication Required:**
    Valid JWT access token in Authorization header.
    
    **Process:**
    1. User account is marked as inactive
    2. User can no longer login
    3. Data is preserved (not deleted)
    4. Can be reactivated by contacting support
    
    **Note:** This is a soft delete. To permanently delete account,
    contact support.
    """,
    responses={
        200: {
            "description": "Account deactivated",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Account deactivated successfully"
                    }
                }
            }
        },
        401: {"description": "Not authenticated"}
    }
)
async def deactivate_account(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deactivate current user's account."""
    try:
        user_service = UserService(db)
        user_service.deactivate_user(current_user.id)
        return {"message": "Account deactivated successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
