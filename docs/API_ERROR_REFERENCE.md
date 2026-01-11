# 🐛 Common API Errors & Solutions

## HTTP Status Codes Reference

### 422 Unprocessable Entity
**Meaning:** Request format is valid JSON, but field validation failed

**Common Causes:**
1. **Field name mismatch** - Frontend sends `otp`, backend expects `otp_code`
2. **Wrong data type** - Sending string instead of number
3. **Missing required field** - Frontend not sending required field
4. **Validation failed** - Phone number format, email format, etc.

**How to Debug:**
```python
# Backend: Check Pydantic schema
# Example: app/schemas/otp.py
class OTPVerify(BaseModel):
    phone_number: str  # What backend expects
    otp_code: str      # Not "otp"!
```

```typescript
// Frontend: Check interface
// Example: mobile/src/api/auth.api.ts
export interface VerifyOTPRequest {
  phone_number: string;  // Must match backend
  otp_code: string;      // Must match backend
}
```

**Solution:** Match field names exactly between frontend and backend

---

### 400 Bad Request
**Meaning:** Request is invalid due to business logic

**Common Causes:**
1. User already exists
2. Invalid credentials
3. OTP expired
4. Account not verified

**Example Error Messages:**
- "User already registered with this phone number"
- "Invalid phone number or password"
- "OTP expired"
- "Account not verified"

---

### 401 Unauthorized
**Meaning:** Authentication required or failed

**Common Causes:**
1. Missing Authorization header
2. Invalid JWT token
3. Token expired

**Solution:**
```typescript
// Check if token is being sent
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

### 404 Not Found
**Meaning:** Endpoint or resource doesn't exist

**Common Causes:**
1. Wrong API URL
2. User not found in database

**Check:**
```typescript
// Verify API endpoint path
BASE_URL: 'http://192.168.1.107:8000/api/v1'
ENDPOINTS: {
  VERIFY_OTP: '/auth/verify-otp'  // Not /verify-otp
}
```

---

### 500 Internal Server Error
**Meaning:** Server-side error (bug in backend code)

**How to Debug:**
1. Check backend terminal for Python traceback
2. Look for database errors
3. Check if required services are running

---

## Field Name Mapping Guide

### Authentication Endpoints

#### Register
**Frontend → Backend:**
```typescript
{
  name: string              → name (not full_name!)
  phone_number: string      → phone_number
  email: string?            → email
  password: string?         → password
  role: string              → role
}
```

#### Verify OTP
**Frontend → Backend:**
```typescript
{
  phone_number: string      → phone_number
  otp_code: string          → otp_code (not otp!)
}
```

#### Login with Password
**Frontend → Backend:**
```typescript
{
  phone_number: string      → phone_number
  password: string          → password
}
```

---

## Debugging Checklist

### For 422 Errors:

1. **Check field names match exactly:**
   ```bash
   # Backend schema
   cd backend
   .\.venv\Scripts\python.exe -c "from app.schemas.otp import OTPVerify; import json; print(json.dumps(OTPVerify.model_json_schema(), indent=2))"
   ```

2. **Check what mobile app is sending:**
   ```typescript
   // Add console.log before API call
   console.log('Sending data:', data);
   const response = await authAPI.verifyOTP(data);
   ```

3. **Check backend validation errors:**
   - Look at backend terminal for detailed error
   - FastAPI shows which field failed validation

4. **Common field name mistakes:**
   - `otp` vs `otp_code` ❌
   - `full_name` vs `name` ❌
   - `phoneNumber` vs `phone_number` ❌

### For Network Errors:

1. **Check backend is running:**
   ```powershell
   curl http://192.168.1.107:8000/health -UseBasicParsing
   ```

2. **Check API URL in mobile app:**
   ```typescript
   // mobile/src/config/api.config.ts
   BASE_URL: 'http://192.168.1.107:8000/api/v1'
   ```

3. **Check CORS settings:**
   ```bash
   # backend/.env
   CORS_ORIGINS=["*"]
   ```

4. **Check phone and computer on same WiFi:**
   ```powershell
   ipconfig | findstr /i "IPv4"
   ```

---

## Testing API Endpoints Manually

### Test with curl (PowerShell):

#### Register:
```powershell
$body = @{
    phone_number = "+919876543210"
    name = "Test User"
    password = "test123"
    role = "contractor"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://192.168.1.107:8000/api/v1/auth/register" -Method POST -Body $body -ContentType "application/json"
```

#### Verify OTP:
```powershell
$body = @{
    phone_number = "+919876543210"
    otp_code = "123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://192.168.1.107:8000/api/v1/auth/verify-otp" -Method POST -Body $body -ContentType "application/json"
```

#### Password Login:
```powershell
$body = @{
    phone_number = "+919876543210"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://192.168.1.107:8000/api/v1/auth/login-password" -Method POST -Body $body -ContentType "application/json"
```

---

## Quick Fixes Reference

| Error | Field Issue | Fix |
|-------|-------------|-----|
| 422 on register | `full_name` sent | Change to `name` |
| 422 on verify OTP | `otp` sent | Change to `otp_code` |
| 422 on any endpoint | Wrong field type | Check schema types |
| Network error | Wrong IP | Update `api.config.ts` |
| CORS error | Not allowed | Add `*` to CORS |
| 401 Unauthorized | No token | Add Bearer token |
| 400 Bad Request | Business logic | Check error message |

---

## Tools for Debugging

### 1. Backend API Documentation
```
Open: http://192.168.1.107:8000/docs
```
- See all endpoints
- View expected request/response formats
- Test endpoints directly

### 2. Check Backend Logs
```powershell
# Backend terminal shows all requests
INFO: 192.168.1.xxx - "POST /api/v1/auth/verify-otp HTTP/1.1" 422
# Shows status code and endpoint
```

### 3. Mobile App Console
```typescript
// Add logging in API calls
console.log('📤 Sending:', data);
const response = await authAPI.verifyOTP(data);
console.log('📥 Received:', response);
```

### 4. Database Check
```powershell
# Check if user was created
cd backend
.\.venv\Scripts\python.exe scripts\check_users.py
```

---

## Prevention Tips

1. **Always check schema first:**
   - Look at backend Pydantic schema
   - Match TypeScript interface exactly

2. **Use consistent naming:**
   - Backend uses snake_case: `phone_number`, `otp_code`
   - Frontend should match exactly

3. **Test endpoints in Swagger UI first:**
   - Go to `/docs`
   - Test with correct data format
   - Then implement in mobile app

4. **Add proper error handling:**
   ```typescript
   try {
     const response = await authAPI.verifyOTP(data);
   } catch (error: any) {
     const errorMsg = error.response?.data?.detail || 
                      error.message || 
                      'Unknown error';
     console.error('❌ Error:', errorMsg);
   }
   ```

---

## Quick Reference: All Fixed Issues

| Date | Issue | Cause | Fix |
|------|-------|-------|-----|
| Jan 5 | Network error | Wrong IP in config | Changed to 192.168.1.107 |
| Jan 5 | 422 on register | `full_name` → `name` | Updated field name |
| Jan 5 | Password not stored | No password_hash | Added DB field + migration |
| Jan 6 | 422 on verify OTP | `otp` → `otp_code` | Updated field name |

---

**Remember:** 422 errors are almost always field name or type mismatches! 🔍
