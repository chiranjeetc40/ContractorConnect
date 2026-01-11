# OTP Provider Setup Guide

## Quick Start (Development)

For development/testing, use the **Console Provider** (no setup required):

```bash
# .env
OTP_DELIVERY_METHOD=console
```

OTPs will be printed to console instead of being sent. Perfect for local development!

---

## Production Setup

### Option 1: Email OTP (Easiest, Free)

**Best for:** Testing, backup method, users who prefer email

**Setup:**
```bash
# .env
OTP_DELIVERY_METHOD=email
OTP_FALLBACK_METHOD=  # Optional

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Generate from Google Account Security
SMTP_FROM=noreply@contractorconnect.com
SMTP_FROM_NAME=ContractorConnect
```

**Gmail App Password Setup:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate password for "Mail"
5. Use that password in `SMTP_PASSWORD`

**Pros:**
- ✅ Free
- ✅ No signup required
- ✅ Reliable
- ✅ Works globally

**Cons:**
- ❌ Slower than SMS (users need to check email)
- ❌ May go to spam

---

### Option 2: MSG91 SMS (India, Affordable)

**Best for:** India-focused apps, cost-conscious, high volume

**Setup:**
```bash
# .env
OTP_DELIVERY_METHOD=sms_msg91
OTP_FALLBACK_METHOD=email  # Optional fallback

# MSG91 Configuration
MSG91_AUTH_KEY=your-auth-key
MSG91_SENDER_ID=CTRCTR  # 6-char sender ID
MSG91_ROUTE=4  # 4 = Transactional
MSG91_TEMPLATE_ID=your-template-id  # Optional
```

**Signup Steps:**
1. Go to https://msg91.com/signup
2. Complete registration
3. Verify your account
4. Get Auth Key from Dashboard
5. Register Sender ID (CTRCTR or similar)
6. (Optional) Create OTP template for better deliverability

**Pricing:**
- ~₹0.10 per SMS (~$0.0012)
- Very affordable for India

**Pros:**
- ✅ Very cheap for India
- ✅ Fast delivery
- ✅ Good for high volume
- ✅ OTP templates

**Cons:**
- ❌ India-only (limited international)
- ⚠️ Quality varies

---

### Option 3: Twilio SMS (Global, Premium)

**Best for:** Global apps, reliability critical, budget flexible

**Setup:**
```bash
# .env
OTP_DELIVERY_METHOD=sms_twilio
OTP_FALLBACK_METHOD=email  # Optional

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Signup Steps:**
1. Go to https://www.twilio.com/try-twilio
2. Sign up (gets $15 free credit)
3. Verify your account
4. Get Account SID and Auth Token from Dashboard
5. Buy a phone number ($1/month + usage)

**Pricing:**
- India: ~$0.0075 per SMS
- US: ~$0.0079 per SMS
- Other countries: Varies

**Pros:**
- ✅ Most reliable
- ✅ Global coverage (190+ countries)
- ✅ Excellent documentation
- ✅ WhatsApp support
- ✅ Free trial credit

**Cons:**
- ❌ More expensive than MSG91 in India
- ❌ Requires phone number purchase

**Dependencies:**
```bash
pip install twilio
```

---

### Option 4: Twilio WhatsApp (Modern, Engaging)

**Best for:** Modern apps, high engagement, tech-savvy users

**Setup:**
```bash
# .env
OTP_DELIVERY_METHOD=whatsapp_twilio
OTP_FALLBACK_METHOD=sms_twilio  # Fallback to SMS

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Twilio sandbox or approved number
```

**Signup Steps:**
1. Sign up for Twilio (same as SMS)
2. Enable WhatsApp in Console
3. For testing: Use Twilio Sandbox (free)
4. For production: Request WhatsApp Business Number
5. Submit message templates for approval

**Pricing:**
- ~$0.005 per message (cheaper than SMS!)
- First 1,000 conversations/month free

**Pros:**
- ✅ Cheaper than SMS
- ✅ High open rates (98%+)
- ✅ Rich formatting possible
- ✅ Modern UX

**Cons:**
- ❌ Requires WhatsApp Business approval
- ❌ Template approval process
- ⚠️ Users must have WhatsApp

**Dependencies:**
```bash
pip install twilio
```

---

## Recommended Configurations

### For Development:
```bash
OTP_DELIVERY_METHOD=console
```

### For MVP/Testing:
```bash
OTP_DELIVERY_METHOD=email
```

### For Production (India):
```bash
OTP_DELIVERY_METHOD=sms_msg91
OTP_FALLBACK_METHOD=email
```

### For Production (Global):
```bash
OTP_DELIVERY_METHOD=sms_twilio
OTP_FALLBACK_METHOD=email
```

### For Production (Modern):
```bash
OTP_DELIVERY_METHOD=whatsapp_twilio
OTP_FALLBACK_METHOD=sms_twilio
```

---

## Testing Providers

### Test Console Provider (Default):
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+919876543210", "full_name": "Test User", "role": "Society"}'
```

Check console for OTP output.

### Test Email Provider:
```bash
# Set in .env
OTP_DELIVERY_METHOD=email

# Send OTP
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "user@example.com", "full_name": "Test User", "role": "Society"}'
```

Check email inbox.

### Test SMS Provider:
```bash
# Set in .env
OTP_DELIVERY_METHOD=sms_msg91  # or sms_twilio

# Send OTP to real phone
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+919876543210", "full_name": "Test User", "role": "Society"}'
```

Check phone for SMS.

---

## Fallback Mechanism

The system supports automatic fallback if primary provider fails:

```bash
OTP_DELIVERY_METHOD=sms_msg91     # Try this first
OTP_FALLBACK_METHOD=email          # If SMS fails, send email
```

**Flow:**
1. Try primary provider (MSG91 SMS)
2. If fails → Try fallback (Email)
3. If both fail → OTP still created in DB, but not sent (logged as warning)

---

## Provider Comparison Table

| Provider | Cost (India) | Setup | Global | Speed | Reliability | Best For |
|----------|--------------|-------|--------|-------|-------------|----------|
| Console | Free | None | ✅ | Instant | 100% | Development |
| Email | Free | 5 min | ✅ | 1-5 sec | 95% | Backup/Testing |
| MSG91 | ₹0.10 | 15 min | ❌ | <1 sec | 90% | India Production |
| Twilio SMS | $0.0075 | 10 min | ✅ | <1 sec | 99% | Global Production |
| Twilio WhatsApp | $0.005 | 30 min | ✅ | <1 sec | 98% | Modern Apps |

---

## Switching Providers

Just change `.env` and restart server. No code changes needed!

```bash
# Switch from console to email
OTP_DELIVERY_METHOD=email

# Switch to SMS
OTP_DELIVERY_METHOD=sms_msg91

# Switch to WhatsApp
OTP_DELIVERY_METHOD=whatsapp_twilio

# Restart server
```

---

## Troubleshooting

### Email not sending:
- Check SMTP credentials
- Enable "Less secure app access" for Gmail
- Use App Password instead of regular password
- Check spam folder

### MSG91 not working:
- Verify Auth Key is correct
- Check Sender ID is approved
- Ensure route is "4" (transactional)
- Check phone number format (+919876543210)

### Twilio not working:
- Verify Account SID and Auth Token
- Check phone number is purchased and active
- Ensure phone number format (+919876543210)
- Check Twilio Console for errors

### WhatsApp not working:
- Ensure WhatsApp number has "whatsapp:" prefix
- Check template is approved
- Verify Business Account is set up
- Use Sandbox for testing first

---

## Cost Estimates

**For 10,000 OTPs/month:**

| Provider | Monthly Cost | Notes |
|----------|--------------|-------|
| Console | $0 | Dev only |
| Email | $0 | Free with own SMTP |
| MSG91 | ₹1,000 (~$12) | India only |
| Twilio SMS | $75 | Global |
| Twilio WhatsApp | $50 | After free tier |

**Recommendation:**
- Dev: Console (free)
- India: MSG91 SMS ($12/month)
- Global: Twilio SMS ($75/month) with Email fallback
- Premium: Twilio WhatsApp ($50/month) with SMS fallback
