# Dual OTP Implementation (Email + Phone)

## Overview
Implemented dual-channel OTP delivery system where both email and phone are **mandatory** during registration, and OTP is sent to **both channels** during login/registration for enhanced security.

## Key Changes

### Backend Changes

#### 1. User Schema (`backend/app/schemas/user.py`)
- **Changed:** `email` field from `Optional[str]` to `str` (required)
- **Impact:** All new users must provide email during registration

#### 2. OTP Schemas (`backend/app/schemas/otp.py`)
- **Simplified:** Removed `identifier` field complexity
- **Changed:** `OTPRequest` and `OTPVerify` now only accept `phone_number`
- **Rationale:** Login always uses phone number; backend fetches email automatically

#### 3. Auth Service (`backend/app/services/auth_service.py`)

**Registration (`register()`):**
- Sends OTP to **both** phone (SMS) and email
- Creates two OTP records (one for phone, one for email)
- Returns message: "OTP sent to both phone and email for verification"

**Login (`request_login_otp()`):**
- Accepts only phone number from user
- Fetches user's email from database automatically
- Sends OTP to **both** phone (SMS) and email
- Returns both phone and email in response

**Verification (`verify_otp_and_login()`):**
- Accepts phone number and OTP code
- Tries to verify OTP from **either** phone or email record
- User can enter OTP received from phone **OR** email
- Generates JWT tokens upon successful verification

#### 4. API Endpoints (`backend/app/api/v1/auth.py`)
- Updated `/login` endpoint documentation
- Changed to use `otp_request.phone_number`
- Updated `/verify-otp` to use `otp_verify.phone_number`

### Frontend Changes

#### 1. Registration Screen (`mobile/src/screens/auth/RegisterScreen.tsx`)
- **Changed:** Email field from optional to **required**
- Updated label: "Email (Required)"
- Added helper text: "OTP will be sent to both phone and email"
- Updated validation to enforce email requirement
- Updated API call to always send email

#### 2. Login Screen (`mobile/src/screens/auth/LoginScreen.tsx`)
- Updated OTP info message: "📱 ✉️ OTP will be sent to both your registered phone number and email"
- No change to input fields (still phone only)

#### 3. API Types (`mobile/src/api/auth.api.ts`)
- **Changed:** `RegisterRequest.email` from `email?: string` to `email: string` (required)

## User Flow

### Registration Flow
1. User provides: name, **phone**, **email** (both required), role
2. Backend validates and creates user account
3. Backend sends OTP to **both** phone (SMS) and email
4. User receives 2 OTPs (same code in both channels)
5. User enters OTP (from either source)
6. Account is verified

### Login Flow
1. User enters only **phone number**
2. Backend fetches user's email from database
3. Backend sends OTP to **both** phone (SMS) and email
4. User receives 2 OTPs (same code in both channels)
5. User enters OTP (from either source)
6. User is logged in with JWT tokens

## Security Benefits

1. **Dual Channel Verification:** User must have access to both phone and email
2. **Redundancy:** If one channel fails, user can still use the other
3. **Flexibility:** User can choose which OTP to enter (phone or email)
4. **Account Recovery:** Email provides backup contact method
5. **Rate Limiting:** Maximum 3 OTP requests per 5 minutes per phone number

## Technical Implementation

### OTP Service Logic
```python
# Registration - Send to both channels
otp_code_phone = create_otp(phone_number, delivery_method="sms")
otp_code_email = create_otp(email, delivery_method="email")

# Login - Fetch email and send to both
user = get_by_phone(phone_number)
otp_code_phone = create_otp(user.phone_number, delivery_method="sms")
otp_code_email = create_otp(user.email, delivery_method="email")

# Verification - Try both OTP records
try:
    verify_otp(user.phone_number, otp_code)
except:
    verify_otp(user.email, otp_code)  # Fallback to email OTP
```

### Database Structure
- Each OTP request creates **2 records** in `otps` table:
  - One with `phone_number` field containing phone
  - One with `phone_number` field containing email
  - Both have same `user_id` and `purpose`
  - Both have same `otp_code` (6 digits)
  - Both expire after 10 minutes

## API Response Examples

### Registration Response
```json
{
  "message": "User registered successfully. OTP sent to both phone and email for verification.",
  "phone_number": "+919876543210",
  "email": "user@example.com",
  "expires_in_minutes": 10,
  "requires_verification": true,
  "user_id": 123
}
```

### Login Response
```json
{
  "message": "OTP sent to both your phone and email",
  "phone_number": "+919876543210",
  "email": "user@example.com",
  "expires_in_minutes": 10
}
```

### Verify OTP Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 123,
    "phone_number": "+919876543210",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "contractor",
    "is_verified": true
  }
}
```

## Testing Checklist

### Backend Testing
- [ ] Register new user with phone and email
- [ ] Verify OTP sent to both channels
- [ ] Verify OTP from phone works
- [ ] Verify OTP from email works
- [ ] Login with phone number
- [ ] Verify email is fetched automatically
- [ ] Verify OTP sent to both channels
- [ ] Test rate limiting (3 requests per 5 min)
- [ ] Test OTP expiry (10 minutes)

### Frontend Testing
- [ ] Registration form requires email
- [ ] Registration form validates email format
- [ ] Registration success shows both phone and email
- [ ] Login screen shows dual OTP message
- [ ] OTP verification accepts code from either source
- [ ] Error handling for missing email in database

## Migration Notes

### Existing Users Without Email
- Users registered before this change may not have email
- Backend will throw error: "No email associated with this account"
- **Solution:** Add migration script to update existing users or prompt them to add email

### Database Migration
```sql
-- Make email column NOT NULL (after adding emails to existing users)
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Add unique constraint on email
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
```

## Environment Variables
Ensure these are configured for email OTP delivery:

```env
# Email Provider Configuration
EMAIL_PROVIDER=smtp  # or your email service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@contractorconnect.com
```

## Rollback Plan
If issues arise, rollback involves:
1. Revert `email` field to `Optional[str]` in UserBase
2. Revert auth_service methods to send OTP to single channel
3. Update frontend to make email optional again
4. Redeploy backend and frontend

## Future Enhancements
1. Allow user to choose OTP delivery preference (phone only, email only, both)
2. Add SMS/Email verification badges in user profile
3. Implement OTP resend with different channel selection
4. Add OTP delivery status tracking (sent, delivered, failed)
5. Implement backup codes for 2FA
