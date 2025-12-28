# Backend Setup Guide

## Step-by-Step Setup Instructions

### Step 1: Prerequisites

Ensure you have the following installed:

- **Python 3.9 or higher**
  ```powershell
  python --version
  ```

- **PostgreSQL 13 or higher**
  - Download from: https://www.postgresql.org/download/windows/
  - During installation, remember your postgres password

- **Redis (optional for Phase 1, required for Phase 2)**
  - Download from: https://github.com/microsoftarchive/redis/releases
  - Or use Docker: `docker run -d -p 6379:6379 redis`

### Step 2: Database Setup

1. **Start PostgreSQL service**

2. **Create database and user:**

Open PowerShell and run:
```powershell
# Connect to PostgreSQL (enter password when prompted)
psql -U postgres

# In psql, run these commands:
CREATE DATABASE contractorconnect_dev;
CREATE USER contractor_user WITH PASSWORD 'contractor_pass';
GRANT ALL PRIVILEGES ON DATABASE contractorconnect_dev TO contractor_user;
\q
```

### Step 3: Backend Setup

1. **Navigate to backend directory:**
```powershell
cd D:\Code\workspace\ContractorConnect\backend
```

2. **Create virtual environment:**
```powershell
python -m venv venv
```

3. **Activate virtual environment:**
```powershell
.\venv\Scripts\Activate.ps1
```

If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

4. **Upgrade pip:**
```powershell
python -m pip install --upgrade pip
```

5. **Install dependencies:**
```powershell
pip install -r requirements.txt
```

For development (includes testing tools):
```powershell
pip install -r requirements-dev.txt
```

### Step 4: Configuration

1. **Copy environment file:**
```powershell
copy .env.example .env
```

2. **Edit .env file:**

Open `.env` in your editor and update:

```env
# Minimum required changes:
DATABASE_URL=postgresql://contractor_user:contractor_pass@localhost:5432/contractorconnect_dev

# Generate a secure secret key (use this command or generate your own):
# python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-generated-secret-key-here-at-least-32-characters-long
```

### Step 5: Database Migrations

1. **Initialize Alembic (first time only):**
```powershell
alembic init alembic
```

2. **Run migrations:**
```powershell
alembic upgrade head
```

### Step 6: Run the Application

**Development mode with auto-reload:**
```powershell
python app/main.py
```

Or using uvicorn directly:
```powershell
uvicorn app.main:app --reload
```

**Test the API:**
Open browser and navigate to:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Step 7: Verify Installation

Run this command to test:
```powershell
curl http://localhost:8000/health
```

Or open in browser: http://localhost:8000/health

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-28T00:00:00Z"
}
```

## Troubleshooting

### Issue: "Module not found"
**Solution:** Make sure virtual environment is activated and dependencies are installed:
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Issue: "Cannot connect to database"
**Solution:** 
1. Check PostgreSQL is running
2. Verify credentials in `.env` file
3. Test connection: `psql -U contractor_user -d contractorconnect_dev`

### Issue: "Port 8000 already in use"
**Solution:** Kill the process or use a different port:
```powershell
uvicorn app.main:app --reload --port 8001
```

### Issue: "Permission denied" when activating venv
**Solution:** Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Development Workflow

### Running Tests
```powershell
pytest
```

### Code Formatting
```powershell
black app/
isort app/
```

### Creating a Migration
```powershell
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Next Steps

Once backend is running:
1. ✅ Verify health endpoint works
2. ⏳ Create database models (Week 1-2)
3. ⏳ Implement authentication endpoints (Week 3-4)
4. ⏳ Add request management endpoints (Week 5-8)

## Current Status

✅ Backend structure created  
✅ Core configuration files ready  
⏳ Virtual environment setup  
⏳ Database models creation  
⏳ API endpoints implementation  

---
*Last Updated: December 28, 2025*
