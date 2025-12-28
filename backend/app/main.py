"""
Main FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
    ## ContractorConnect API
    
    Backend API for ContractorConnect - Connecting building societies with civil work contractors.
    
    ### Features
    
    * **Authentication**: OTP-based login for contractors and societies
    * **Request Management**: Post, browse, and manage civil work requests
    * **Bidding System**: Contractors can bid on requests
    * **Profile Management**: Manage user profiles and work history
    * **File Upload**: Upload images and documents
    
    ### Authentication
    
    Most endpoints require JWT authentication. Get your token from:
    - `/api/v1/auth/register` - Register new user
    - `/api/v1/auth/login` - Login with phone/OTP
    
    Then include the token in requests:
    ```
    Authorization: Bearer <your_token>
    ```
    
    ### Documentation
    
    * **Swagger UI**: Interactive API documentation (this page)
    * **ReDoc**: Alternative documentation at `/redoc`
    * **OpenAPI Schema**: Raw schema at `/openapi.json`
    """,
    docs_url="/docs",  # Always enabled for easy testing
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "Root", "description": "Root and health check endpoints"},
        {"name": "Authentication", "description": "User registration, login, and OTP verification"},
        {"name": "Users", "description": "User profile management"},
        {"name": "Requests", "description": "Civil work request management"},
        {"name": "Bids", "description": "Bidding on requests"},
        {"name": "Admin", "description": "Admin operations"},
    ],
    contact={
        "name": "ContractorConnect Support",
        "email": "support@contractorconnect.com",
    },
    license_info={
        "name": "Proprietary",
    },
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    # In production, use Alembic migrations instead
    if settings.is_development:
        # init_db()  # Uncomment when models are ready
        pass


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    pass


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - Health check."""
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "environment": settings.environment,
        "docs_url": "/docs" if settings.debug else "disabled"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": "2025-12-28T00:00:00Z"
    }


# Include API routers
# from app.api.v1.router import api_router
# app.include_router(api_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
