# ContractorConnect Backend API

FastAPI-based backend for ContractorConnect application.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── core/                   # Core functionality
│   │   ├── __init__.py
│   │   ├── config.py           # Configuration management
│   │   ├── security.py         # Security utilities (JWT, passwords)
│   │   └── database.py         # Database connection setup
│   ├── api/                    # API layer
│   │   ├── __init__.py
│   │   ├── v1/                 # API version 1
│   │   │   ├── __init__.py
│   │   │   ├── router.py       # Main router
│   │   │   ├── endpoints/      # API endpoints
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   ├── requests.py
│   │   │   │   └── notifications.py
│   │   │   └── dependencies.py # Route dependencies
│   │   └── middleware/         # Custom middleware
│   │       └── __init__.py
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── request.py
│   │   ├── notification.py
│   │   └── otp.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── request.py
│   │   ├── auth.py
│   │   └── common.py
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── request_service.py
│   │   └── notification_service.py
│   └── repositories/           # Data access layer
│       ├── __init__.py
│       ├── base.py
│       ├── user_repository.py
│       └── request_repository.py
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── tests/                      # Tests
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   └── integration/
├── alembic.ini                 # Alembic configuration
├── requirements.txt            # Python dependencies
├── requirements-dev.txt        # Development dependencies
├── .env.example                # Environment variables example
├── pytest.ini                  # Pytest configuration
└── README.md                   # This file
```

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows CMD:**
```cmd
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

For development (includes testing tools):
```bash
pip install -r requirements-dev.txt
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/contractorconnect

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis
REDIS_URL=redis://localhost:6379/0

# SMS/OTP (configure based on provider)
SMS_PROVIDER=twilio
SMS_API_KEY=your-api-key
```

### 5. Run Database Migrations

```bash
alembic upgrade head
```

### 6. Run the Application

**Development mode (with auto-reload):**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production mode:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 7. Access API Documentation

Once running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_auth_service.py

# Run with verbose output
pytest -v
```

## Database Management

### Create a new migration

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations

```bash
alembic upgrade head
```

### Rollback migration

```bash
alembic downgrade -1
```

### View migration history

```bash
alembic history
```

## Development Workflow

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make changes and write tests
3. Run tests: `pytest`
4. Check code style: `black app/ && isort app/`
5. Commit changes: `git commit -m "feat: your feature"`
6. Push and create PR

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh access token

### Users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update current user

### Requests
- `POST /api/v1/requests` - Create request
- `GET /api/v1/requests` - List requests
- `GET /api/v1/requests/{id}` - Get request details

See [API Documentation](../docs/07-API-SPECIFICATION.md) for complete reference.

## Project Status

✅ Project structure created  
⏳ Core configuration (in progress)  
⏳ Database models  
⏳ API endpoints  

---
*Last Updated: December 28, 2025*
