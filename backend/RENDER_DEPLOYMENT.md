# Render Deployment Guide

## Prerequisites

1. **Render Account**: Sign up at https://render.com
2. **GitHub Repository**: Push your code to GitHub (recommended for auto-deploy)
3. **PostgreSQL Database**: Already set up on Render

## Step 1: Prepare for Deployment

### 1.1 Ensure all files are ready

Check that these files exist in your backend folder:
- `requirements.txt` - Production dependencies
- `app/main.py` - FastAPI application
- `.env.example` - Environment template (for reference)

### 1.2 Verify requirements.txt

Make sure your `requirements.txt` includes:
```
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlalchemy>=2.0.25
psycopg2-binary>=2.9.9
alembic>=1.13.1
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
pydantic>=2.5.3
pydantic-settings>=2.1.0
python-multipart>=0.0.6
```

## Step 2: Create Web Service on Render

### 2.1 Create New Web Service

1. Go to Render Dashboard: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository or use "Public Git repository"

### 2.2 Configure Web Service

Fill in these details:

**Basic Settings:**
- **Name**: `contractorconnect-api` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Runtime**: `Python 3`

**Build Settings:**
- **Build Command**: 
  ```bash
  pip install uv && uv pip install -r requirements.txt
  ```

**Start Command:**
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

**Instance Type:**
- Start with **Free tier** for testing
- Upgrade to **Starter** ($7/month) for production

## Step 3: Configure Environment Variables

In Render Dashboard → Your Web Service → Environment:

Add these environment variables:

```bash
# Database (from your Render PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Security (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
SECRET_KEY=your-secure-secret-key-here
REFRESH_SECRET_KEY=your-secure-refresh-key-here

# Environment
ENVIRONMENT=production
DEBUG=False

# CORS (add your frontend URL when ready)
CORS_ORIGINS=["https://your-frontend-url.com"]

# JWT Settings
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# OTP Settings
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10

# SMS Provider (configure when ready)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Email Provider (configure when ready)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@your-domain.com
```

**Important:** 
- Copy your PostgreSQL DATABASE_URL from Render PostgreSQL dashboard
- Generate secure keys using the Python command shown above
- Never commit secrets to Git

## Step 4: Database Migration

### 4.1 Option A: Using Render Shell (After Deployment)

1. Go to your Web Service → Shell
2. Run:
```bash
alembic upgrade head
```

### 4.2 Option B: Using Build Hook

Add this to your Build Command:
```bash
pip install uv && uv pip install -r requirements.txt && alembic upgrade head
```

## Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies with uv
   - Run the start command
   - Deploy your application

3. Monitor deployment logs in real-time

## Step 6: Verify Deployment

Once deployed, your API will be available at:
```
https://your-app-name.onrender.com
```

**Test endpoints:**
- Health check: `https://your-app-name.onrender.com/health`
- API docs: `https://your-app-name.onrender.com/docs`
- ReDoc: `https://your-app-name.onrender.com/redoc`

## Step 7: Enable Auto-Deploy (Optional)

In Render Dashboard → Settings → Build & Deploy:

- **Auto-Deploy**: Enable
- **Branch**: `main`

Now every push to GitHub will automatically deploy!

## Troubleshooting

### Issue: Build fails
**Check:**
1. Requirements.txt is present and valid
2. Python version compatibility
3. Build logs for specific error

### Issue: Application crashes
**Check:**
1. Environment variables are set correctly
2. DATABASE_URL format is correct
3. Logs in Render Dashboard

### Issue: Database connection fails
**Check:**
1. PostgreSQL is running on Render
2. DATABASE_URL includes all parts: `postgresql://user:pass@host:port/db`
3. Database allows connections from Render services

### Issue: 502 Bad Gateway
**Check:**
1. Application is listening on `0.0.0.0:$PORT`
2. Health check endpoint responds
3. Start command is correct

## Monitoring

### View Logs
Render Dashboard → Your Service → Logs

### Metrics
Render Dashboard → Your Service → Metrics
- CPU usage
- Memory usage
- Request count
- Response times

## Scaling

### Vertical Scaling
Upgrade instance type in Settings

### Horizontal Scaling
Available on paid plans - add more instances

## Cost Optimization

**Free Tier Limitations:**
- Spins down after 15 minutes of inactivity
- 750 hours/month free
- 512 MB RAM

**Recommendations:**
- Use Starter plan ($7/mo) for production
- Enable auto-scaling for traffic spikes
- Monitor usage to optimize costs

## Security Checklist

- ✅ Environment variables configured (not hardcoded)
- ✅ Debug mode disabled in production
- ✅ Secure secret keys generated
- ✅ CORS configured properly
- ✅ Database credentials secured
- ✅ HTTPS enabled (automatic on Render)

## Next Steps After Deployment

1. ✅ Test all API endpoints
2. ⏳ Configure custom domain (optional)
3. ⏳ Set up monitoring/alerting
4. ⏳ Configure backup strategy
5. ⏳ Set up CI/CD pipeline
6. ⏳ Add Redis for caching (Phase 2)

---
*Last Updated: December 28, 2025*
