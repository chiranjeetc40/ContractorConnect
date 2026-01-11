# Backend Deployment Preparation Script
# Run this before deploying to production

Write-Host "🚀 ContractorConnect - Backend Deployment Preparation" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the backend directory
if (!(Test-Path "app/main.py")) {
    Write-Host "❌ Error: Please run this script from the backend directory" -ForegroundColor Red
    Write-Host "   cd D:\Code\workspace\ContractorConnect\backend" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ In correct directory" -ForegroundColor Green
Write-Host ""

# 1. Check Python version
Write-Host "📌 Checking Python version..." -ForegroundColor Yellow
python --version
Write-Host ""

# 2. Check if virtual environment is activated
Write-Host "📌 Checking virtual environment..." -ForegroundColor Yellow
if ($env:VIRTUAL_ENV) {
    Write-Host "✅ Virtual environment is activated: $env:VIRTUAL_ENV" -ForegroundColor Green
} else {
    Write-Host "⚠️  Virtual environment not activated" -ForegroundColor Yellow
    Write-Host "   Activate with: .\.venv\Scripts\Activate.ps1" -ForegroundColor Yellow
}
Write-Host ""

# 3. Install dependencies
Write-Host "📌 Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# 4. Check environment variables
Write-Host "📌 Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    
    # Check important variables
    $envContent = Get-Content .env
    
    $hasDatabase = $envContent | Select-String -Pattern "DATABASE_URL"
    $hasSecret = $envContent | Select-String -Pattern "SECRET_KEY"
    $hasOTP = $envContent | Select-String -Pattern "OTP_DELIVERY_METHOD"
    
    if ($hasDatabase) {
        Write-Host "  ✅ DATABASE_URL configured" -ForegroundColor Green
    } else {
        Write-Host "  ❌ DATABASE_URL missing" -ForegroundColor Red
    }
    
    if ($hasSecret) {
        Write-Host "  ✅ SECRET_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "  ❌ SECRET_KEY missing" -ForegroundColor Red
    }
    
    if ($hasOTP) {
        Write-Host "  ✅ OTP_DELIVERY_METHOD configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  OTP_DELIVERY_METHOD not set (will use console)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    Write-Host "   Copy from .env.example: cp .env.example .env" -ForegroundColor Yellow
}
Write-Host ""

# 5. Check database connection
Write-Host "📌 Checking database connection..." -ForegroundColor Yellow
Write-Host "   Testing connection to database..." -ForegroundColor Gray
python -c "from app.core.database import engine; engine.connect(); print('✅ Database connection successful')" 2>&1
Write-Host ""

# 6. Check migrations
Write-Host "📌 Checking database migrations..." -ForegroundColor Yellow
alembic current
Write-Host ""
Write-Host "   Latest available migration:" -ForegroundColor Gray
alembic heads
Write-Host ""

# 7. Run tests (if available)
Write-Host "📌 Running tests (if available)..." -ForegroundColor Yellow
if (Test-Path "tests") {
    pytest tests/ -v
} else {
    Write-Host "  ⚠️  No tests directory found" -ForegroundColor Yellow
}
Write-Host ""

# 8. Check for security issues
Write-Host "📌 Security checklist:" -ForegroundColor Yellow
$envContent = Get-Content .env -ErrorAction SilentlyContinue

if ($envContent | Select-String -Pattern 'SECRET_KEY=your-secret-key-change-this') {
    Write-Host "  ❌ Using default SECRET_KEY - CHANGE THIS!" -ForegroundColor Red
} else {
    Write-Host "  ✅ SECRET_KEY appears to be customized" -ForegroundColor Green
}

if ($envContent | Select-String -Pattern 'DEBUG=True') {
    Write-Host "  ⚠️  DEBUG is True - set to False for production" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ DEBUG is not True" -ForegroundColor Green
}

if ($envContent | Select-String -Pattern 'CORS_ORIGINS=\["\*"\]') {
    Write-Host "  ⚠️  CORS allows all origins - restrict for production" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ CORS appears to be restricted" -ForegroundColor Green
}
Write-Host ""

# 9. Generate production requirements
Write-Host "📌 Generating production requirements.txt..." -ForegroundColor Yellow
if (Test-Path "requirements-prod.txt") {
    Write-Host "  ℹ️  requirements-prod.txt already exists" -ForegroundColor Cyan
} else {
    Copy-Item requirements.txt requirements-prod.txt
    Write-Host "  ✅ Created requirements-prod.txt" -ForegroundColor Green
}
Write-Host ""

# 10. Summary
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "📋 Deployment Checklist Summary" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Before deploying to Render/Railway/AWS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. ✅ Ensure all environment variables are set" -ForegroundColor White
Write-Host "2. ✅ Change SECRET_KEY to a secure random string" -ForegroundColor White
Write-Host "3. ✅ Set DEBUG=False for production" -ForegroundColor White
Write-Host "4. ✅ Configure CORS_ORIGINS with actual domain" -ForegroundColor White
Write-Host "5. ✅ Set up production database (PostgreSQL on Render)" -ForegroundColor White
Write-Host "6. ✅ Configure OTP provider (email/SMS)" -ForegroundColor White
Write-Host "7. ✅ Run migrations: alembic upgrade head" -ForegroundColor White
Write-Host "8. ✅ Test API endpoints with Postman" -ForegroundColor White
Write-Host "9. ✅ Set up error logging (optional: Sentry)" -ForegroundColor White
Write-Host "10. ✅ Enable database backups" -ForegroundColor White
Write-Host ""

# 11. Generate deployment command
Write-Host "📌 Render Deployment Command:" -ForegroundColor Yellow
Write-Host "   pip install -r requirements.txt && alembic upgrade head" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 Start Command:" -ForegroundColor Yellow
Write-Host "   uvicorn app.main:app --host 0.0.0.0 --port `$PORT" -ForegroundColor Cyan
Write-Host ""

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "✅ Preparation complete! Ready to deploy." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Commit and push to GitHub" -ForegroundColor White
Write-Host "2. Connect repository to Render" -ForegroundColor White
Write-Host "3. Add environment variables in Render dashboard" -ForegroundColor White
Write-Host "4. Deploy and monitor logs" -ForegroundColor White
Write-Host ""
