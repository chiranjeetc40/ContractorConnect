# Twilio SMS & Email Configuration Guide

## Overview

This guide explains how to configure SMS (via Twilio) and Email (via SMTP) for OTP delivery in different environments.

**Key Points:**
- ✅ **Local Development:** Both SMS and Email enabled
- ✅ **Render/Production:** SMS only (Email disabled due to network restrictions)
- ✅ **SMS Provider:** Twilio (reliable and works everywhere)
- ✅ **Email Provider:** Gmail SMTP (local only)

---

## Twilio SMS Configuration

### Your Twilio Credentials

```env
TWILIO_ACCOUNT_SID=AC0c53df5b93da48272911f45048a0ddf9
TWILIO_AUTH_TOKEN=98d19db658d4bc68f8b632a46951dd44
TWILIO_PHONE_NUMBER=+19787248480
```

### How It Works

```python
from twilio.rest import Client

client = Client(account_sid, auth_token)
message = client.messages.create(
    from_='+19787248480',
    body='Your ContractorConnect OTP is: 123456',
    to='+919876543210'
)
print(f"✅ SMS sent! SID: {message.sid}")
```

---

## Environment-Specific Configuration

### Local Development (.env file)

Create `backend/.env`:

```env
# Environment
ENVIRONMENT=development
DEBUG=true

# Twilio SMS (ENABLED)
TWILIO_ACCOUNT_SID=AC0c53df5b93da48272911f45048a0ddf9
TWILIO_AUTH_TOKEN=98d19db658d4bc68f8b632a46951dd44
TWILIO_PHONE_NUMBER=+19787248480
OTP_DELIVERY_METHOD=sms_twilio

# Email SMTP (ENABLED for local)
SMTP_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM=noreply@contractorconnect.com
SMTP_FROM_NAME=ContractorConnect

# Database
DATABASE_URL=postgresql://contractor_user:contractor_pass@localhost:5432/contractorconnect_dev

# Security
SECRET_KEY=dev-secret-key-change-in-production
```

### Render/Production Environment

Go to Render Dashboard → Your Service → Environment:

```env
# Environment
ENVIRONMENT=production
DEBUG=false

# Twilio SMS (ENABLED)
TWILIO_ACCOUNT_SID=AC0c53df5b93da48272911f45048a0ddf9
TWILIO_AUTH_TOKEN=98d19db658d4bc68f8b632a46951dd44
TWILIO_PHONE_NUMBER=+19787248480
OTP_DELIVERY_METHOD=sms_twilio

# Email SMTP (DISABLED on Render)
SMTP_ENABLED=false

# Database (Render auto-populates)
DATABASE_URL=postgres://user:pass@host:5432/dbname

# Security
SECRET_KEY=your-production-secret-key-generate-strong-one
```

---

## How Email Disabling Works

### In OTP Service

```python
# app/services/otp_service.py

if delivery_method == "email":
    # Check if SMTP is enabled
    from app.core.config import settings
    if not settings.smtp_enabled:
        print(f"⚠️  SMTP is disabled (SMTP_ENABLED=false). Skipping email OTP.")
        print(f"💡 OTP saved in database but not sent: {otp_code}")
        return otp_code, expires_at
    
    # Send email if enabled
    email_provider = EmailProvider()
    result = email_provider.send_otp(identifier, otp_code, purpose)
```

### Behavior by Environment

**Local (SMTP_ENABLED=true):**
```
Registration:
  1. SMS sent to phone ✅
  2. Email sent to email ✅
  3. User receives OTP on both

Login:
  1. SMS sent to phone ✅
  2. Email sent to email ✅
  3. User can verify with either
```

**Render (SMTP_ENABLED=false):**
```
Registration:
  1. SMS sent to phone ✅
  2. Email skipped (SMTP disabled) ⚠️
  3. OTP saved in DB for debugging
  4. User receives OTP via SMS only

Login:
  1. SMS sent to phone ✅
  2. Email skipped (SMTP disabled) ⚠️
  3. User verifies with SMS OTP
```

---

## Testing

### Test Twilio SMS Locally

Create `backend/scripts/test_twilio.py`:

```python
"""Test Twilio SMS sending."""

import os
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()

# Twilio credentials
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
from_number = os.getenv("TWILIO_PHONE_NUMBER")

# Test
to_number = input("Enter phone number to test (with country code, e.g., +919876543210): ")
test_otp = "123456"

print(f"\n📱 Sending test SMS...")
print(f"From: {from_number}")
print(f"To: {to_number}")
print(f"OTP: {test_otp}\n")

try:
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        from_=from_number,
        body=f"Your ContractorConnect OTP is: {test_otp}. Valid for 10 minutes.",
        to=to_number
    )
    
    print(f"✅ SMS sent successfully!")
    print(f"Message SID: {message.sid}")
    print(f"Status: {message.status}")
    print(f"\n✅ Check your phone for the SMS!")
    
except Exception as e:
    print(f"❌ Error: {e}")
```

Run:
```bash
cd backend
python scripts/test_twilio.py
```

### Test Full Registration Flow

```bash
# Local
POST http://localhost:8000/api/v1/auth/register
{
  "phone_number": "9876543210",
  "email": "test@example.com",
  "name": "Test User",
  "role": "contractor"
}

Expected Logs:
🔍 create_otp called with:
   identifier: +919876543210
   delivery_method: sms
📱 Sending SMS via Twilio to +919876543210
✅ SMS sent successfully! SID: SMxxxx

🔍 create_otp called with:
   identifier: test@example.com
   delivery_method: email
📧 Sending OTP to email: test@example.com
✅ Email sent via Email to test@example.com  (Local only)
```

```bash
# Render
POST https://contractorconnect.onrender.com/api/v1/auth/register
{
  "phone_number": "9876543210",
  "email": "test@example.com",
  "name": "Test User",
  "role": "contractor"
}

Expected Logs:
🔍 create_otp called with:
   identifier: +919876543210
   delivery_method: sms
📱 Sending SMS via Twilio to +919876543210
✅ SMS sent successfully! SID: SMxxxx

🔍 create_otp called with:
   identifier: test@example.com
   delivery_method: email
⚠️  SMTP is disabled (SMTP_ENABLED=false). Skipping email OTP.
💡 OTP saved in database but not sent: 123456
```

---

## Configuration Files Updated

### 1. `app/core/config.py`
```python
# Added SMTP_ENABLED flag
smtp_enabled: bool = Field(default=True, alias="SMTP_ENABLED")
smtp_port: int = Field(default=465, alias="SMTP_PORT")  # SSL port
```

### 2. `app/services/otp_service.py`
```python
# Check SMTP_ENABLED before sending email
if delivery_method == "email":
    if not settings.smtp_enabled:
        print(f"⚠️  SMTP is disabled. Skipping email OTP.")
        return otp_code, expires_at
    # ... send email
```

### 3. `app/services/providers/twilio_sms.py`
```python
# Enhanced logging
print(f"📱 Sending SMS via Twilio to {recipient}")
message = self.client.messages.create(
    from_=self.from_number,
    body=message_body,
    to=recipient
)
print(f"✅ SMS sent successfully! SID: {message.sid}")
```

---

## Twilio Phone Number Format

### Sending (from_number)
```
+19787248480  ✅ Correct (E.164 format)
```

### Receiving (to_number)
```python
# Indian numbers
+919876543210   ✅ Correct
9876543210      ❌ Wrong (missing country code)
+91 9876543210  ❌ Wrong (has space)

# US numbers
+11234567890    ✅ Correct
1234567890      ❌ Wrong (missing country code)
```

### Auto-formatting in Code

The backend automatically formats Indian numbers:

```python
# In user_service.py or auth_service.py
if not phone_number.startswith('+'):
    if phone_number.startswith('91'):
        phone_number = '+' + phone_number
    else:
        phone_number = '+91' + phone_number
```

---

## Costs (Twilio)

### SMS Pricing
- **India (SMS):** ~$0.0062 per SMS
- **US (SMS):** ~$0.0079 per SMS
- **Free Trial:** $15 credit

### Budget Estimate
```
100 users/day × 2 OTPs (register + login) = 200 SMS/day
200 SMS × $0.0062 = $1.24/day = ~$37/month (India)
```

### Cost Optimization
1. Use SMS for registration/login only (not for every action)
2. Implement rate limiting (max 3 OTPs per 5 minutes)
3. Consider cheaper SMS providers for high volume
4. Cache verified phone numbers to reduce resends

---

## Troubleshooting

### Twilio SMS Not Received

1. **Check Phone Number Format**
   ```python
   # Must be E.164 format
   to_number = "+919876543210"  # ✅
   to_number = "9876543210"      # ❌
   ```

2. **Check Twilio Dashboard**
   - Go to: https://console.twilio.com/
   - Check Message Logs
   - Look for delivery status

3. **Check Twilio Balance**
   - Ensure account has sufficient credits
   - Free trial accounts have limitations

4. **Check Phone Number**
   - Trial accounts can only send to verified numbers
   - Upgrade to send to any number

### Email Not Working on Render

✅ **Expected!** SMTP is disabled on Render (`SMTP_ENABLED=false`)

The system will:
- Save OTP in database
- Log OTP in console (for debugging)
- Skip email sending
- Users rely on SMS only

### Email Working Locally But Not on Render

✅ **Correct Behavior!**

- **Local:** `SMTP_ENABLED=true` → Emails sent
- **Render:** `SMTP_ENABLED=false` → Emails skipped

This is intentional to avoid network issues on Render.

---

## Render Environment Variables Checklist

```env
✅ TWILIO_ACCOUNT_SID=AC0c53df5b93da48272911f45048a0ddf9
✅ TWILIO_AUTH_TOKEN=98d19db658d4bc68f8b632a46951dd44
✅ TWILIO_PHONE_NUMBER=+19787248480
✅ OTP_DELIVERY_METHOD=sms_twilio
✅ SMTP_ENABLED=false
✅ SECRET_KEY=<strong-secret-key>
✅ DATABASE_URL=<auto-populated-by-render>
✅ ENVIRONMENT=production
✅ DEBUG=false
```

---

## Security Notes

### Twilio Credentials
- ⚠️  **Never commit credentials to git**
- ✅ Keep them in environment variables
- ✅ Rotate auth tokens periodically
- ✅ Use separate accounts for dev/prod

### OTP Security
- ✅ 10-minute expiration
- ✅ Max 3 attempts per 5 minutes
- ✅ One-time use (marked as used after verification)
- ✅ Stored hashed in database (optional enhancement)

---

## Next Steps

1. **Update Local .env**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your Twilio credentials
   ```

2. **Test Locally**
   ```bash
   python scripts/test_twilio.py
   ```

3. **Update Render Environment**
   - Go to Render Dashboard
   - Add Twilio variables
   - Set `SMTP_ENABLED=false`
   - Redeploy

4. **Test on Render**
   - Register new user
   - Check Render logs for Twilio messages
   - Verify SMS received

---

## Summary

✅ **SMS (Twilio):** Works everywhere (local + Render)  
✅ **Email (SMTP):** Works locally only  
✅ **Render:** SMS-only by design (SMTP disabled)  
✅ **Configuration:** Environment-specific via `SMTP_ENABLED`  
✅ **Ready to Deploy!** 🚀
