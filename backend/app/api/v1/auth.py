"""
Authentication API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.auth_service import AuthService
from app.api.dependencies import get_current_user, get_current_active_user
from app.schemas.user import UserCreate, UserResponse, UserProfile
from app.schemas.otp import OTPRequest, OTPVerify, OTPResponse
from app.schemas.token import Token, RefreshToken, TokenRefreshResponse
from app.models.user import User

router = APIRouter()


@router.post(
    "/register",
    response_model=OTPResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User",
    description="""
    Register a new user account.
    
    **Process:**
    1. User provides phone number and basic details
    2. System creates user account (status: pending)
    3. OTP is sent to phone number for verification
    4. User must verify OTP to complete registration
    
    **Required Fields:**
    - phone_number: Must be unique, format: +[country_code][number]
    - role: 'contractor' or 'society'
    
    **Optional Fields:**
    - email, name, city, state, pincode, description
    
    **Returns:**
    - Message confirming OTP sent
    - Phone number
    - OTP expiry time (10 minutes)
    """,
    responses={
        201: {
            "description": "User registered, OTP sent",
            "content": {
                "application/json": {
                    "example": {
                        "message": "User registered successfully. OTP sent for verification.",
                        "phone_number": "+919876543210",
                        "expires_in_minutes": 10
                    }
                }
            }
        },
        400: {"description": "User already exists or invalid data"},
        422: {"description": "Validation error"}
    }
)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user and send OTP for verification."""
    try:
        auth_service = AuthService(db)
        result = auth_service.register(user_data)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post(
    "/login",
    response_model=OTPResponse,
    summary="Request Login OTP",
    description="""
    Request OTP for login.
    
    **Process:**
    1. User provides phone number
    2. System verifies user exists and is active
    3. OTP is sent to phone number
    4. User has 10 minutes to verify OTP
    
    **Rate Limiting:**
    - Maximum 3 OTP requests per 5 minutes per phone number
    
    **Returns:**
    - Message confirming OTP sent
    - Phone number
    - OTP expiry time
    """,
    responses={
        200: {
            "description": "OTP sent successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "OTP sent successfully",
                        "phone_number": "+919876543210",
                        "expires_in_minutes": 10
                    }
                }
            }
        },
        400: {"description": "User not found or too many requests"},
        422: {"description": "Validation error"}
    }
)
async def login(
    otp_request: OTPRequest,
    db: Session = Depends(get_db)
):
    """Request OTP for login."""
    try:
        auth_service = AuthService(db)
        result = auth_service.request_login_otp(otp_request.phone_number)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post(
    "/verify-otp",
    response_model=Token,
    summary="Verify OTP and Login",
    description="""
    Verify OTP and receive authentication tokens.
    
    **Process:**
    1. User provides phone number and OTP code
    2. System validates OTP (not expired, not used)
    3. User account is verified (if registration)
    4. JWT tokens are generated and returned
    
    **Returns:**
    - access_token: Short-lived token (30 minutes)
    - refresh_token: Long-lived token (30 days)
    - token_type: "bearer"
    - expires_in: Access token expiry in seconds
    
    **Usage:**
    Use the access_token in Authorization header:
    ```
    Authorization: Bearer <access_token>
    ```
    """,
    responses={
        200: {
            "description": "OTP verified, tokens issued",
            "content": {
                "application/json": {
                    "example": {
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "token_type": "bearer",
                        "expires_in": 1800
                    }
                }
            }
        },
        400: {"description": "Invalid or expired OTP"},
        422: {"description": "Validation error"}
    }
)
async def verify_otp(
    otp_verify: OTPVerify,
    db: Session = Depends(get_db)
):
    """Verify OTP and return JWT tokens."""
    try:
        auth_service = AuthService(db)
        
        # Try login first, then registration
        purpose = "login"
        try:
            result = auth_service.verify_otp_and_login(
                otp_verify.phone_number,
                otp_verify.otp_code,
                purpose="login"
            )
        except:
            # If login fails, try registration
            result = auth_service.verify_otp_and_login(
                otp_verify.phone_number,
                otp_verify.otp_code,
                purpose="registration"
            )
        
        # Don't return user object, only tokens
        return {
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "token_type": result["token_type"],
            "expires_in": result["expires_in"]
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post(
    "/refresh",
    response_model=TokenRefreshResponse,
    summary="Refresh Access Token",
    description="""
    Get a new access token using refresh token.
    
    **Process:**
    1. User provides refresh token
    2. System validates refresh token
    3. New access token is generated
    
    **Use Case:**
    When access token expires (after 30 minutes), use this endpoint
    to get a new one without requiring OTP again.
    
    **Returns:**
    - New access_token
    - token_type: "bearer"
    - expires_in: Token expiry in seconds
    """,
    responses={
        200: {
            "description": "New access token issued",
            "content": {
                "application/json": {
                    "example": {
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "token_type": "bearer",
                        "expires_in": 1800
                    }
                }
            }
        },
        401: {"description": "Invalid refresh token"},
        422: {"description": "Validation error"}
    }
)
async def refresh_token(
    refresh_data: RefreshToken,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token."""
    try:
        from app.core.security import decode_token
        
        # Decode refresh token
        payload = decode_token(refresh_data.refresh_token)
        if payload is None or payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")
        
        user_id = payload.get("user_id")
        if user_id is None:
            raise ValueError("Invalid refresh token")
        
        # Generate new access token
        auth_service = AuthService(db)
        result = auth_service.refresh_access_token(user_id)
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Get Current User Profile",
    description="""
    Get the profile of currently authenticated user.
    
    **Authentication Required:**
    Include JWT access token in Authorization header.
    
    **Returns:**
    Complete user profile with all fields including:
    - Personal info (name, phone, email)
    - Role and status
    - Address details
    - Verification status
    - Timestamps
    """,
    responses={
        200: {
            "description": "User profile retrieved",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "phone_number": "+919876543210",
                        "email": "contractor@example.com",
                        "name": "John Doe",
                        "role": "contractor",
                        "status": "active",
                        "is_verified": True,
                        "is_active": True,
                        "city": "Mumbai",
                        "state": "Maharashtra"
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized"}
    }
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current authenticated user's profile."""
    return current_user


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout (Client-side)",
    description="""
    Logout endpoint (informational only).
    
    **Note:** JWT tokens are stateless, so logout is handled client-side.
    
    **Client should:**
    1. Delete access_token from storage
    2. Delete refresh_token from storage
    3. Clear any user session data
    
    **Server-side logout (future):**
    - Token blacklisting can be implemented with Redis
    - Refresh token can be revoked in database
    """,
    responses={
        200: {
            "description": "Logout successful (client-side)",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Logged out successfully. Please delete tokens from client."
                    }
                }
            }
        }
    }
)
async def logout():
    """Logout endpoint (client-side token deletion)."""
    return {
        "message": "Logged out successfully. Please delete tokens from client storage."
    }
