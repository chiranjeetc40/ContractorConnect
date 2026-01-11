# 🔧 Registration Error Fix - Status 422

## ❌ Problem
Registration was failing with:
```
Registration error: [AxiosError: Request failed with status code 422]
ERROR Objects are not valid as a React child (found: object with keys {type, loc, msg, input, ctx})
```

**HTTP 422** = Unprocessable Entity = Data format mismatch between frontend and backend

## 🔍 Root Cause Analysis

### Backend Expected (UserCreate schema):
```python
{
  "phone_number": string (required),
  "name": string (optional),        # ← Backend uses "name"
  "email": string (optional),
  "role": "contractor" | "society" | "admin",
  "address": string (optional),
  "city": string (optional),
  "state": string (optional),
  "pincode": string (optional),
  "description": string (optional)
}
# Note: NO password field (OTP-based authentication!)
```

### Mobile App Was Sending:
```typescript
{
  "phone_number": string,
  "full_name": string,      # ❌ Backend expects "name" not "full_name"
  "email": string,
  "password": string,       # ❌ Backend doesn't accept password
  "role": string
}
```

## ✅ Fixes Applied

### 1. Updated Mobile API Interface
**File**: `mobile/src/api/auth.api.ts`

**Before**:
```typescript
export interface RegisterRequest {
  phone_number: string;
  password: string;        // ❌ Removed
  full_name: string;       // ❌ Renamed to 'name'
  email?: string;
  role: UserRole;
}
```

**After**:
```typescript
export interface RegisterRequest {
  phone_number: string;
  name: string;            // ✅ Matches backend
  email?: string;
  role: UserRole;
  // Optional fields
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  description?: string;
}
```

### 2. Updated Registration Form Submission
**File**: `mobile/src/screens/auth/RegisterScreen.tsx`

**Before**:
```typescript
const response = await authAPI.register({
  full_name: fullName.trim(),     // ❌
  phone_number: phoneNumber.replace(/\s/g, ''),
  email: email.trim() || undefined,
  password,                       // ❌
  role,
});
```

**After**:
```typescript
const response = await authAPI.register({
  name: fullName.trim(),          // ✅ Changed to 'name'
  phone_number: phoneNumber.replace(/\s/g, ''),
  email: email.trim() || undefined,
  role,
  // No password field - OTP-based auth
});
```

### 3. Removed Password Validation
**File**: `mobile/src/screens/auth/RegisterScreen.tsx`

**Before**:
```typescript
// Password validation
if (!password) {
  newErrors.password = 'Password is required';
} else if (password.length < 6) {
  newErrors.password = 'Password must be at least 6 characters';
}
```

**After**:
```typescript
// Note: Password is optional for OTP-based authentication
// Password validation removed - using OTP for authentication
```

### 4. Updated UI Labels
Made password fields optional with helper text explaining OTP authentication.

## 🧪 Testing the Fix

### Step 1: Reload the App
In Expo Go, shake your phone and tap **Reload**

OR press **R** in the terminal running Expo

### Step 2: Try Registration Again
1. Fill in the registration form:
   - Full Name: `Test User`
   - Phone Number: `9876543210`
   - Email: `test@example.com` (optional)
   - Role: Select Contractor or Society
   - Password fields: Leave empty (not needed for OTP)

2. Click **Register**

3. **Watch backend terminal** for OTP:
```
INFO: 192.168.1.xxx - "POST /api/v1/auth/register HTTP/1.1" 200 OK
📱 OTP for +919876543210: 123456
```

4. Should navigate to OTP verification screen

5. Enter OTP from terminal

6. Success! ✅

### Step 3: Verify User in Database

Run the check script:
```powershell
cd D:\Code\workspace\ContractorConnect\backend
.\.venv\Scripts\python.exe scripts\check_users.py
```

Should show your newly registered user!

## 📋 What Changed - Summary

| Item | Before | After | Reason |
|------|--------|-------|--------|
| Field name | `full_name` | `name` | Match backend schema |
| Password field | Sent to backend | Not sent | Backend doesn't accept it |
| Password validation | Required | Optional | OTP-based auth only |
| Password UI labels | "Password *" | "Password (Optional)" | Clarify it's not needed |

## 🎯 Why These Changes?

1. **OTP-Based Authentication**: Your system uses OTP (One-Time Password) for login, not traditional password authentication. The password field was a remnant from a different auth design.

2. **Schema Mismatch**: FastAPI's Pydantic validates all incoming data. If you send fields it doesn't expect, or use wrong field names, it returns 422 error.

3. **Backend Schema is Source of Truth**: Always check `app/schemas/user.py` to see what fields backend expects.

## 🔐 About OTP Authentication

Your app uses this flow:
```
1. User registers with phone number
2. Backend generates and sends OTP
3. User verifies OTP
4. Backend issues JWT token
5. User is logged in

No password storage needed! ✅
```

Benefits:
- ✅ No password to remember
- ✅ More secure (OTP expires quickly)
- ✅ Common in India (familiar UX)
- ✅ No password reset flow needed

## 🛠️ If You Want to Add Password Auth Later

You'll need to:

1. **Add password to User model**:
```python
# backend/app/models/user.py
password_hash: str = Column(String, nullable=True)
```

2. **Add password to UserCreate schema**:
```python
# backend/app/schemas/user.py
password: str = Field(..., min_length=6)
```

3. **Hash password in auth service**:
```python
from app.core.security import hash_password
user.password_hash = hash_password(user_data.password)
```

4. **Create password login endpoint**:
```python
@router.post("/login-password")
async def login_with_password(phone: str, password: str):
    # Verify password hash
    # Return token
```

But for now, OTP-only is perfectly fine!

## 📱 Current Status

✅ **Backend**: Expects `name`, no password
✅ **Mobile**: Sends `name`, no password
✅ **Validation**: Removed password requirements
✅ **UI**: Password fields optional
✅ **Ready**: Try registration now!

---

## 🚀 Next Steps

1. **Reload your Expo app** (press R or shake phone → Reload)
2. **Try registering** a new user
3. **Check backend logs** for the OTP code
4. **Verify the OTP** in the app
5. **Check users in database**:
   ```powershell
   cd backend
   .\.venv\Scripts\python.exe scripts\check_users.py
   ```

The 422 error should now be fixed! 🎉

---

**Quick Reference**:
- ✅ Field mapping fixed: `full_name` → `name`
- ✅ Removed: `password` field from API call
- ✅ Updated: Registration validation
- ✅ Status: Ready to test

Let me know if registration works now! 🚀
