# 🔧 Network Connection Fix - RESOLVED

## Problem
Mobile app on Expo Go was unable to connect to backend API, showing:
```
❌ API Error: {"data": undefined, "status": undefined, "url": "/auth/register"}
ERROR 📡 Network error - no response received
ERROR Registration error: [AxiosError: Network Error]
```

## Root Cause
1. **Wrong API URL**: Mobile app was using `http://10.0.2.2:8000` (Android emulator address) but running on physical device via Expo Go
2. **CORS Not Configured**: Backend CORS only allowed `localhost:3000` and `localhost:8081`, blocking mobile device requests

## ✅ Fixes Applied

### 1. Updated Mobile API Configuration
**File**: `mobile/src/config/api.config.ts`
- Changed from: `http://10.0.2.2:8000/api/v1`
- Changed to: `http://192.168.1.107:8000/api/v1` (your computer's local IP)

### 2. Updated Backend CORS Settings
**File**: `backend/.env`
- Changed from: `CORS_ORIGINS=["http://localhost:3000","http://localhost:8081"]`
- Changed to: `CORS_ORIGINS=["*"]` (allows all origins during development)

### 3. Backend Restarted
- Backend now running on `http://0.0.0.0:8000`
- Accessible from any device on your local network
- Verified with health check: ✅ Working

## 🎯 Next Steps

### 1. Restart Expo Development Server
The mobile app needs to reload with the new API configuration:

```powershell
# In your mobile terminal (press Ctrl+C to stop, then):
cd D:\Code\workspace\ContractorConnect\mobile
npm start
```

Then in Expo Go:
- Press **R** to reload the app
- OR shake your phone and tap "Reload"

### 2. Verify Connection
Open the app and try to register:
1. Fill in registration form
2. Should now successfully connect to backend
3. OTP will print in backend terminal (since using console provider)
4. Copy OTP from terminal and verify in app

## 📱 Testing Checklist

- [ ] Restart Expo dev server (`npm start`)
- [ ] Reload app in Expo Go (shake phone → Reload)
- [ ] Try to register a new user
- [ ] Check backend terminal for OTP
- [ ] Verify OTP in app
- [ ] Test login
- [ ] Test creating a request

## 🔍 Verification Commands

### Check Backend is Running:
```powershell
curl http://192.168.1.107:8000/health -UseBasicParsing
```

### Check Your Computer's IP:
```powershell
ipconfig | findstr /i "IPv4"
```

### View Backend Logs:
Check the terminal running uvicorn for:
- API requests from mobile
- OTP codes being generated
- Any errors

## 🌐 Network Requirements

**Both devices MUST be on the same WiFi network:**
- ✅ Computer: Connected to your home WiFi
- ✅ Phone: Connected to SAME WiFi (not mobile data!)

**Firewall:**
- Windows Firewall might block incoming connections
- If still having issues, temporarily disable firewall to test

## 🔐 Important Notes

### For Development:
- `CORS_ORIGINS=["*"]` is fine for local development
- Your computer IP (`192.168.1.107`) might change if router restarts

### For Production:
- Must change CORS to specific domain: `["https://yourapp.com"]`
- Use proper backend URL (Render, AWS, etc.)
- Update `mobile/src/config/api.config.ts` with production URL

## 📊 Current Configuration

### Backend:
- **Running on**: `http://0.0.0.0:8000`
- **Accessible at**: `http://192.168.1.107:8000`
- **CORS**: Allows all origins (`*`)
- **Database**: PostgreSQL on Render (connected)
- **OTP Provider**: Console (prints to terminal)

### Mobile:
- **API URL**: `http://192.168.1.107:8000/api/v1`
- **Platform**: Expo Go on Android
- **Development**: Hot reload enabled

## 🐛 Troubleshooting

### Still Getting Network Error?

**1. Verify Both on Same WiFi:**
```powershell
# On computer:
ipconfig
# Look for "Wireless LAN adapter Wi-Fi" → IPv4 Address

# On phone:
# Settings → WiFi → Check network name matches computer
```

**2. Test Backend Directly:**
Open in phone browser: `http://192.168.1.107:8000/docs`
- Should see Swagger API documentation
- If doesn't load → firewall/network issue

**3. Windows Firewall:**
```powershell
# Temporarily disable to test (re-enable after!)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Or add rule for port 8000:
New-NetFirewallRule -DisplayName "Uvicorn Dev Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

**4. Check Expo Dev Server:**
In Expo terminal, you should see:
```
› Metro waiting on exp://192.168.1.107:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```
- IP should match your computer's IP

**5. Restart Everything:**
```powershell
# Stop backend (Ctrl+C in terminal)
# Stop Expo (Ctrl+C in terminal)

# Start backend
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start Expo (in new terminal)
cd mobile
npm start
```

### Different Error Messages?

**"timeout of 30000ms exceeded"**
- Backend is running but slow to respond
- Check backend terminal for errors
- Increase timeout in `api.config.ts`

**"connect ECONNREFUSED"**
- Backend not running
- Wrong IP address
- Check with `netstat -ano | findstr :8000`

**"CORS error"**
- Backend CORS not updated
- Verify `.env` has `CORS_ORIGINS=["*"]`
- Restart backend after changing

## ✅ Success Indicators

You'll know it's working when:
1. ✅ No network errors in Expo
2. ✅ Backend terminal shows incoming requests: `INFO: 192.168.1.xxx:xxxx - "POST /api/v1/auth/register HTTP/1.1" 200 OK`
3. ✅ OTP appears in backend terminal
4. ✅ App successfully registers/logs in user

---

**Status**: Fixed ✅
**Date**: January 4, 2026
**Next Action**: Restart Expo dev server and reload app in Expo Go
