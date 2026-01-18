# Quick Command Reference

Quick reference for common development commands.

## Backend Commands

### Environment Setup
```powershell
# Navigate to backend
cd D:\Code\workspace\ContractorConnect\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Running the Server
```powershell
# Development mode (auto-reload)
python app/main.py

# Or using uvicorn directly
uvicorn app.main:app --reload

# Different port
uvicorn app.main:app --reload --port 8001

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Database Commands
```powershell
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history

# Current version
alembic current
```

### Testing
```powershell
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_auth_service.py

# Verbose output
pytest -v

# Stop on first failure
pytest -x
```

### Code Quality
```powershell
# Format code
black app/

# Sort imports
isort app/

# Lint code
flake8 app/

# Type checking
mypy app/

# All at once
black app/ && isort app/ && flake8 app/
```

## PostgreSQL Commands

### Database Management
```powershell
# Connect to PostgreSQL
psql -U postgres

# Connect to specific database
psql -U contractor_user -d contractorconnect_dev

# In psql:
\l              # List databases
\c dbname       # Connect to database
\dt             # List tables
\d tablename    # Describe table
\q              # Quit
```


## Useful URLs

- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **Root**: http://localhost:8000/

## Environment Variables

Check `.env` file for configuration. Key variables:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
SECRET_KEY=your-secret-key
DEBUG=True
```

## Troubleshooting Commands

### Check if Port is in Use
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <process_id> /F
```


### Database Connection Test
```powershell
# Test PostgreSQL connection
psql -U contractor_user -d contractorconnect_dev -c "SELECT version();"
```

## Quick Start (Full Setup)

```powershell
# 1. Navigate to project
cd D:\Code\workspace\ContractorConnect\backend

# 2. Create and activate venv
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env
# Edit .env file

# 5. Run migrations
alembic upgrade head

# 6. Start server
python app/main.py

# 7. Test
curl http://localhost:8000/health
```

## Helpful Tips

### Keep Terminal Open
Add this to end of scripts to keep window open:
```powershell
Read-Host "Press Enter to continue..."
```

### Virtual Environment Issues
If activation fails:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Clear Python Cache
```powershell
# Remove all __pycache__ directories
Get-ChildItem -Recurse -Filter __pycache__ | Remove-Item -Recurse -Force
```

---
*Keep this file handy for quick reference during development!*
