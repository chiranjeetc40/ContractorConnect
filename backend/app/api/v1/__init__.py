"""
API v1 router - combines all v1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1 import auth, users, requests, bids

# Create main API v1 router
api_router = APIRouter()

# Include sub-routers with prefixes and tags
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)

api_router.include_router(
    requests.router,
    prefix="/requests",
    tags=["Requests"],
)

api_router.include_router(
    bids.router,
    prefix="/bids",
    tags=["Bids"],
)
