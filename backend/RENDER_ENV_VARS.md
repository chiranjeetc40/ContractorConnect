# =================================================================
# RENDER ENVIRONMENT VARIABLES
# =================================================================
# Copy these to your Render service Environment Variables

# Application
ENVIRONMENT=production
DEBUG=false

# Twilio SMS Configuration (REQUIRED for OTP)
TWILIO_ACCOUNT_SID=AC0c53df5b93da48272911f45048a0ddf9
TWILIO_AUTH_TOKEN=98d19db658d4bc68f8b632a46951dd44
TWILIO_PHONE_NUMBER=+19787248480

# OTP Configuration
OTP_DELIVERY_METHOD=sms_twilio
OTP_FALLBACK_METHOD=console
OTP_EXPIRE_MINUTES=10
OTP_LENGTH=6

# Email Configuration - DISABLED on Render
SMTP_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_FROM=noreply@contractorconnect.com
SMTP_FROM_NAME=ContractorConnect

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

# Database (Render will auto-populate this)
DATABASE_URL=postgres://user:pass@host:5432/dbname

# CORS (Add your frontend URLs)
CORS_ORIGINS=["https://your-app.com", "https://contractorconnect.onrender.com"]

# Server
HOST=0.0.0.0
PORT=10000
