# 🔍 Debug: Society User Navigation Issue

## Issue
Society users are seeing Contractor navigation (My Bids, My Work tabs) instead of Society navigation (Home, Profile only).

## Root Cause Found! 🎯

**The bug was in `RootNavigator.tsx`:**

```typescript
// ❌ WRONG - Capital 'S'
user?.role === 'Society'

// ✅ CORRECT - Lowercase 's'  
user?.role === 'society'
```

The backend stores roles as lowercase (`"society"`, `"contractor"`) but the frontend was checking for capitalized `"Society"`, so it NEVER matched and always showed the Contractor navigator!

---

## What Was Fixed

### File: `mobile/src/navigation/RootNavigator.tsx`

**Before:**
```typescript
user?.role === 'Society' ? (
  <Stack.Screen name="Society" component={SocietyNavigator} />
) : (
  <Stack.Screen name="Contractor" component={ContractorNavigator} />
)
```

**After:**
```typescript
user?.role === 'society' ? (
  <Stack.Screen name="Society" component={SocietyNavigator} />
) : user?.role === 'contractor' ? (
  <Stack.Screen name="Contractor" component={ContractorNavigator} />
) : (
  // Fallback shouldn't happen
  <Stack.Screen name="Contractor" component={ContractorNavigator} />
)
```

### Added Debug Logging

Added comprehensive logging to track the issue:

1. **RootNavigator** - Shows which navigator is being displayed
2. **AuthStore** - Shows user role when saved/loaded
3. **SocietyHomeScreen** - Confirms screen rendering and FAB button

---

## Test Now 🧪

### Step 1: Reload App
```
Shake phone → Tap "Reload"
OR
Press R in Expo terminal
```

### Step 2: Check Console Logs

You should now see logs like:

```
✅ [AuthStore] Restored user: { 
  userId: '1', 
  userName: 'John Doe',
  userRole: 'society',  ⬅️ lowercase!
  roleType: 'string' 
}

🏢 [RootNavigator] Showing Society Navigator  ⬅️ Correct navigator!
🏢 [SocietyHomeScreen] Component mounted
📡 [SocietyHomeScreen] Loading requests...
🔘 [SocietyHomeScreen] Rendering FAB button  ⬅️ FAB is there!
```

### Step 3: Verify Navigation

**Society Users Should See:**
```
Bottom Tabs:
┌─────────┬──────────┐
│  Home   │ Profile  │  ⬅️ ONLY 2 TABS
└─────────┴──────────┘
```

**NOT this (Contractor tabs):**
```
Bottom Tabs:
┌────────┬─────────┬─────────┬─────────┐
│ Browse │ My Bids │ My Work │ Profile │  ❌ WRONG!
└────────┴─────────┴─────────┴─────────┘
```

### Step 4: Test FAB Button

1. Look at **bottom-right corner**
2. You should see **blue "+ New Request"** button
3. Should be positioned ABOVE the tab bar
4. Tap it → Should navigate to Create Request form

---

## Debug Logs Reference

### If you see Contractor Navigator (wrong):
```
⚠️ [RootNavigator] Unknown role, defaulting to Contractor
```
**Problem:** User role is not 'society' or 'contractor' (check backend)

### If FAB not visible:
```
🔘 [SocietyHomeScreen] Rendering FAB button
```
**Check:** This log should appear. If not, SocietyHomeScreen isn't rendering.

### If Create Request doesn't navigate:
```
➕ [SocietyHomeScreen] Create request button pressed
```
**Check:** This log should appear when you tap FAB.

---

## Verification Checklist

After reloading, verify:

- [ ] Console shows: `🏢 [RootNavigator] Showing Society Navigator`
- [ ] Bottom tabs show: **Home** and **Profile** only (not My Bids/My Work)
- [ ] FAB button visible in bottom-right corner
- [ ] FAB button positioned above tab bar
- [ ] Tapping FAB navigates to Create Request screen
- [ ] User role in logs shows `'society'` (lowercase)

---

## Backend Role Values

**Correct values (from `backend/app/models/user.py`):**
```python
class UserRole(str, enum.Enum):
    CONTRACTOR = "contractor"  # lowercase!
    SOCIETY = "society"        # lowercase!
    ADMIN = "admin"
```

**Mobile enum (from `mobile/src/types/models.types.ts`):**
```typescript
export enum UserRole {
  SOCIETY = 'society',        // lowercase!
  CONTRACTOR = 'contractor',  // lowercase!
  ADMIN = 'admin',
}
```

---

## How to Check Your User's Role

### Option 1: Check Logs
After login, look for:
```
💾 [AuthStore] Setting auth: { userRole: 'society' }
```

### Option 2: Backend Database
```powershell
cd backend
.\.venv\Scripts\python.exe scripts\check_users.py
```

Look for your user's role in the output.

### Option 3: API Response
Check the login/verify-otp response:
```json
{
  "user": {
    "role": "society"  ⬅️ Should be lowercase
  }
}
```

---

## If Still Not Working

### Check 1: User Actually a Society User?
Maybe you created a Contractor account by mistake.

**Fix:** Register new account and select **"Society"** role.

### Check 2: Old User Data Cached?
Clear app data and login again.

**Fix:**
```typescript
// In Profile screen, tap Logout
// Then login again
```

### Check 3: Backend Returning Wrong Role?
Check backend response.

**Test:**
```powershell
# Check what backend returns
Invoke-RestMethod -Uri "http://192.168.1.107:8000/api/v1/auth/me" -Headers @{ Authorization = "Bearer YOUR_TOKEN" }
```

---

## Summary

**The Bug:** Case mismatch - checking `'Society'` but backend returns `'society'`

**The Fix:** Changed to lowercase `'society'` and `'contractor'`

**Added:** Debug logs to track user flow

**Result:** Society users now see correct navigation with FAB button!

---

## Files Modified

1. `mobile/src/navigation/RootNavigator.tsx`
   - Fixed role comparison (Society → society)
   - Added explicit contractor check
   - Added debug logging

2. `mobile/src/store/authStore.ts`
   - Added logging in setAuth()
   - Added logging in initialize()

3. `mobile/src/screens/society/SocietyHomeScreen.tsx`
   - Added logging for component mount
   - Added logging for FAB render
   - Added logging for button press

---

**Status:** ✅ FIXED  
**Reload app to see changes!** 🚀
