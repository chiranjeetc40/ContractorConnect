# OTP Service Logic Fix - Delivery Method Based Provider Selection

## Problem Identified

The OTP service was incorrectly using a single `primary_provider` for all delivery methods. This caused issues where:

❌ **Before:**
```python
# Always initialized provider from OTP_DELIVERY_METHOD setting (e.g., "email")
if not self.primary_provider:
    self.primary_provider = get_otp_provider()  # Might be EmailProvider

# Then tried to use it for SMS
if delivery_method == "sms":
    result = self.primary_provider.send_otp(...)  # EmailProvider sending SMS? ❌
```

**Issues:**
1. If `OTP_DELIVERY_METHOD=email`, it would try to send SMS via EmailProvider
2. If `OTP_DELIVERY_METHOD=sms_twilio`, it would try to send Email via TwilioSMSProvider
3. The `delivery_method` parameter was ignored for provider selection

---

## Solution Applied

✅ **After:**
```python
# Dynamically select provider based on delivery_method parameter

if delivery_method == "email":
    # Always use EmailProvider for email delivery
    email_provider = EmailProvider()
    result = email_provider.send_otp(identifier, otp_code, purpose)
    
else:  # SMS delivery
    # Use SMS provider from settings (sms_twilio, sms_msg91, etc.)
    if not self.primary_provider:
        self.primary_provider = get_otp_provider()  # Gets SMS provider
    result = self.primary_provider.send_otp(identifier, otp_code, purpose)
```

**Benefits:**
1. ✅ Email delivery always uses `EmailProvider`
2. ✅ SMS delivery uses provider from `OTP_DELIVERY_METHOD` setting
3. ✅ Correct provider selected based on `delivery_method` parameter
4. ✅ Fallback provider still works for SMS

---

## How It Works Now

### Email Delivery Flow

```python
# When delivery_method="email"
create_otp(identifier="user@example.com", delivery_method="email")

# Flow:
1. Check if SMTP_ENABLED=true
2. If disabled, skip and return OTP code
3. If enabled, create EmailProvider instance
4. Send OTP via EmailProvider (SMTP/SendGrid)
5. ✅ Email sent successfully
```

### SMS Delivery Flow

```python
# When delivery_method="sms"
create_otp(identifier="+919876543210", delivery_method="sms")

# Flow:
1. Initialize primary_provider from OTP_DELIVERY_METHOD setting
   - If OTP_DELIVERY_METHOD="sms_twilio" → TwilioSMSProvider
   - If OTP_DELIVERY_METHOD="sms_msg91" → MSG91Provider
2. Send OTP via SMS provider
3. If primary fails, try fallback provider
4. ✅ SMS sent successfully
```

---

## Configuration

### Environment Variables

```env
# SMS Provider (for delivery_method="sms")
OTP_DELIVERY_METHOD=sms_twilio
TWILIO_ACCOUNT_SID=AC0c53df5b93da48272911f45048a0ddf9
TWILIO_AUTH_TOKEN=98d19db658d4bc68f8b632a46951dd44
TWILIO_PHONE_NUMBER=+19787248480

# Fallback SMS Provider (optional)
OTP_FALLBACK_METHOD=console

# Email Provider (for delivery_method="email")
SMTP_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## Usage Examples

### Registration (Send to Both Phone and Email)

```python
# auth_service.py

# Send SMS OTP
otp_code_phone, expires_at_phone = self.otp_service.create_otp(
    identifier=user.phone_number,      # "+919876543210"
    purpose="registration",
    user_id=user.id,
    delivery_method="sms"               # ✅ Uses TwilioSMSProvider
)

# Send Email OTP
otp_code_email, expires_at_email = self.otp_service.create_otp(
    identifier=user.email,              # "user@example.com"
    purpose="registration",
    user_id=user.id,
    delivery_method="email"             # ✅ Uses EmailProvider
)
```

### Login (Send to Both Phone and Email)

```python
# auth_service.py - request_login_otp()

# User provides phone number only
user = self.user_repo.get_by_phone(phone_number)

# Send to phone
otp_service.create_otp(
    identifier=user.phone_number,       # "+919876543210"
    delivery_method="sms"               # ✅ Uses TwilioSMSProvider
)

# Send to email
otp_service.create_otp(
    identifier=user.email,              # "user@example.com"
    delivery_method="email"             # ✅ Uses EmailProvider
)
```

---

## Expected Logs

### Successful SMS Delivery

```
🔍 create_otp called with:
   identifier: +919876543210
   purpose: login
   user_id: 123
   delivery_method: sms

📱 Sending OTP via SMS to: +919876543210
📦 Using SMS provider: Twilio SMS
✅ SMS sent successfully! SID: SMxxxxxxx
✅ OTP sent via Twilio SMS
```

### Successful Email Delivery (Local)

```
🔍 create_otp called with:
   identifier: user@example.com
   purpose: login
   user_id: 123
   delivery_method: email

📧 Sending OTP to email: user@example.com
📦 Using Email provider: Email (SMTP)
✅ OTP sent via Email to user@example.com
```

### Skipped Email Delivery (Render/Production)

```
🔍 create_otp called with:
   identifier: user@example.com
   purpose: login
   user_id: 123
   delivery_method: email

⚠️  SMTP is disabled (SMTP_ENABLED=false). Skipping email OTP.
💡 OTP saved in database but not sent: 123456
```

---

## Provider Selection Logic

### Decision Tree

```
create_otp(identifier, delivery_method)
    │
    ├─ delivery_method == "email"?
    │   ├─ Yes: Check SMTP_ENABLED
    │   │   ├─ true: Use EmailProvider ✅
    │   │   └─ false: Skip email, return OTP ⚠️
    │   │
    │   └─ No: delivery_method == "sms"
    │       ├─ Initialize primary_provider from OTP_DELIVERY_METHOD
    │       │   ├─ sms_twilio → TwilioSMSProvider ✅
    │       │   ├─ sms_msg91 → MSG91Provider ✅
    │       │   └─ console → ConsoleProvider ✅
    │       │
    │       ├─ Try primary provider
    │       │   ├─ Success ✅
    │       │   └─ Failure ❌
    │       │
    │       └─ Try fallback provider (if configured)
    │           ├─ Success ✅
    │           └─ Failure ❌
```

---

## Code Changes Summary

### Before (Incorrect)

```python
# Always initialized one provider for everything
if not self.primary_provider:
    self.primary_provider = get_otp_provider()  # ❌ Could be Email or SMS

# Used same provider for both email and SMS
if delivery_method == "email":
    result = self.primary_provider.send_otp(...)  # ❌ Wrong provider
else:
    result = self.primary_provider.send_otp(...)  # ❌ Wrong provider
```

### After (Correct)

```python
# Email: Always use EmailProvider
if delivery_method == "email":
    email_provider = EmailProvider()  # ✅ Dedicated email provider
    result = email_provider.send_otp(...)

# SMS: Use provider from settings
else:
    if not self.primary_provider:
        self.primary_provider = get_otp_provider()  # ✅ Gets SMS provider
    result = self.primary_provider.send_otp(...)
```

---

## Testing

### Test SMS Delivery

```bash
cd backend
python scripts/test_twilio.py
```

### Test Registration with Both SMS and Email

```bash
POST http://localhost:8000/api/v1/auth/register
{
  "phone_number": "9876543210",
  "email": "test@example.com",
  "name": "Test User",
  "role": "contractor"
}
```

**Expected:**
- ✅ SMS sent to phone via Twilio
- ✅ Email sent to email via SMTP (if SMTP_ENABLED=true)
- ✅ User receives OTP on both channels

### Check Logs

Look for these patterns:
```
📱 Sending OTP via SMS to: +919876543210
📦 Using SMS provider: Twilio SMS
✅ OTP sent via Twilio SMS

📧 Sending OTP to email: test@example.com
📦 Using Email provider: Email (SMTP)
✅ OTP sent via Email to test@example.com
```

---

## Environment-Specific Behavior

### Local Development

```env
OTP_DELIVERY_METHOD=sms_twilio
SMTP_ENABLED=true
```

**Result:**
- ✅ SMS via Twilio
- ✅ Email via SMTP
- ✅ Both working

### Render/Production

```env
OTP_DELIVERY_METHOD=sms_twilio
SMTP_ENABLED=false
```

**Result:**
- ✅ SMS via Twilio
- ⚠️  Email skipped
- ✅ SMS-only delivery

---

## Summary

✅ **Email delivery:** Always uses `EmailProvider` (SMTP/SendGrid)  
✅ **SMS delivery:** Uses provider from `OTP_DELIVERY_METHOD` setting  
✅ **Dynamic selection:** Provider chosen based on `delivery_method` parameter  
✅ **No mixing:** Email provider never used for SMS, SMS provider never used for Email  
✅ **Fallback support:** Still works for SMS delivery  
✅ **Environment-aware:** Email can be disabled on Render  

The logic is now correct and properly separates email and SMS delivery! 🚀
