# 🎯 Deployment & APK Action Plan

**Date:** December 29, 2025  
**Goal:** Get app running on your phone + Deploy backend to production  
**Estimated Time:** 2-4 hours

---

## 🚀 Quick Start (Choose Your Path)

### Path A: Test Immediately (5 minutes) - RECOMMENDED FIRST
**Install Expo Go + Test with dev server**

### Path B: Build APK (30 minutes)
**Create standalone APK to install without Expo Go**

### Path C: Full Production (2 hours)
**Deploy backend + Build production APK**

---

## 📱 Path A: Test Immediately (FASTEST)

### Step 1: Install Expo Go on your Android phone
Download from Play Store:
https://play.google.com/store/apps/details?id=host.exp.exponent

### Step 2: Start development server
```powershell
# You should already be in a terminal, run:
cd D:\Code\workspace\ContractorConnect\mobile
npm start
```

### Step 3: Scan QR code
- Open Expo Go app on your phone
- Tap "Scan QR code"
- Scan the QR code shown in your terminal
- App will load on your phone!

### Step 4: Test the app
- ✅ Register a new user
- ✅ Check console for OTP (since OTP_DELIVERY_METHOD=console)
- ✅ Enter OTP and verify
- ✅ Test creating requests (Society)
- ✅ Test browsing requests (Contractor)

**Time:** 5 minutes  
**Pros:** Super fast, hot reload works  
**Cons:** Needs Expo Go app, computer must be running

---

## 📦 Path B: Build APK (STANDALONE)

### Prerequisites:
```powershell
# Install EAS CLI globally
npm install -g eas-cli
```

### Step 1: Login to Expo
```powershell
cd D:\Code\workspace\ContractorConnect\mobile
eas login
```

If you don't have an Expo account:
1. Go to https://expo.dev
2. Sign up with email
3. Verify email
4. Use those credentials for `eas login`

### Step 2: Configure project
```powershell
# This will create eas.json and update app.json
eas build:configure
```

### Step 3: Build APK
```powershell
# Build preview APK (cloud build - takes 10-15 min)
eas build --profile preview --platform android

# EAS will:
# 1. Upload your code
# 2. Build APK on Expo servers
# 3. Give you download link
```

### Step 4: Download and install
1. Click the download link from terminal
2. Transfer APK to your phone (USB, WhatsApp, email)
3. On phone: Enable "Install from unknown sources"
4. Tap APK file → Install → Open

**Time:** 30 minutes  
**Pros:** No Expo Go needed, works offline  
**Cons:** Takes time to build, needs Expo account

---

## 🌐 Path C: Full Production Deployment

### Part 1: Deploy Backend (20 minutes)

#### Step 1: Prepare backend
```powershell
cd D:\Code\workspace\ContractorConnect\backend

# Run preparation script
.\prepare-deployment.ps1

# Commit changes
cd ..
git add .
git commit -m "chore: Prepare for production deployment"
git push origin main
```

#### Step 2: Deploy to Render

1. **Go to https://dashboard.render.com**
2. **Sign up / Login** (can use GitHub)
3. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `ContractorConnect` repository
   
4. **Configure Service:**
   - **Name:** `contractorconnect-api`
   - **Region:** Choose closest to India
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** `Free`

5. **Add Environment Variables:**
Click "Environment" tab, add these:

```bash
# Database (use your existing Render PostgreSQL URL)
DATABASE_URL=postgresql://contractor_user:password@host/database

# Security
SECRET_KEY=generate-a-secure-random-32-char-string-here
ENVIRONMENT=production
DEBUG=False

# CORS (update after getting domain)
CORS_ORIGINS=["*"]

# OTP Configuration
OTP_DELIVERY_METHOD=console
OTP_EXPIRE_MINUTES=5
OTP_LENGTH=6
MAX_OTP_ATTEMPTS=3

# Optional: Email OTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@contractorconnect.com
```

6. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (~5-10 minutes)
   - You'll get URL like: `https://contractorconnect-api.onrender.com`

7. **Test API:**
```powershell
# Test health endpoint
curl https://contractorconnect-api.onrender.com/health

# Test in browser
# Open: https://contractorconnect-api.onrender.com/docs
```

#### Step 3: Update Mobile App

Update `mobile/src/config/api.config.ts`:
```typescript
const API_CONFIG = {
  // Change from local to production
  BASE_URL: 'https://contractorconnect-api.onrender.com/api',
  TIMEOUT: 30000,
  // ... rest
};
```

### Part 2: Build Production APK (30 minutes)

```powershell
cd D:\Code\workspace\ContractorConnect\mobile

# Build production APK
eas build --profile production --platform android

# Or preview for testing
eas build --profile preview --platform android
```

Download, install, and test!

**Time:** 2 hours  
**Pros:** Real production setup, scalable  
**Cons:** Takes longer, more complex

---

## 🎯 Recommended Sequence

### Today (Right Now):

1. **✅ Test with Expo Go** (5 min)
   ```powershell
   cd D:\Code\workspace\ContractorConnect\mobile
   npm start
   ```
   - Install Expo Go on phone
   - Scan QR code
   - Test basic functionality
   - Confirm everything works

2. **✅ Deploy Backend** (20 min)
   - Follow Path C, Part 1
   - Get production API URL
   - Test endpoints

3. **✅ Update API Config** (2 min)
   - Change BASE_URL to production
   - Commit changes

4. **✅ Build APK** (30 min)
   - Run `eas build`
   - Download and install
   - Test on phone

---

## 📋 Complete Checklist

### Backend Deployment:
- [ ] Run `prepare-deployment.ps1`
- [ ] Generate secure SECRET_KEY
- [ ] Push code to GitHub
- [ ] Create Render Web Service
- [ ] Configure environment variables
- [ ] Deploy and wait for success
- [ ] Test `/health` endpoint
- [ ] Test `/docs` endpoint
- [ ] Run migrations (auto-runs in build command)
- [ ] Test API with Postman

### Mobile App:
- [ ] Update API_CONFIG with production URL
- [ ] Update app.json (name, package, version)
- [ ] Create eas.json (already done!)
- [ ] Login to Expo: `eas login`
- [ ] Build APK: `eas build --profile preview --platform android`
- [ ] Download APK from link
- [ ] Transfer to phone
- [ ] Enable unknown sources
- [ ] Install APK
- [ ] Test all features

### Testing:
- [ ] Register new user (Society)
- [ ] Verify OTP
- [ ] Create request
- [ ] Register new user (Contractor)
- [ ] Browse requests
- [ ] Submit bid
- [ ] Society accepts bid
- [ ] Status updates work
- [ ] Logout and login again

---

## 🛠️ Required Tools

### Already Installed:
- ✅ Node.js
- ✅ Python
- ✅ PostgreSQL (on Render)
- ✅ Git

### Need to Install:
- [ ] Expo Go app (on Android phone)
- [ ] EAS CLI: `npm install -g eas-cli`

### Optional:
- Android Studio (for local builds)
- Java JDK 17 (for local builds)

---

## 💡 Important Notes

### Backend:
1. **Free tier limits** on Render:
   - Spins down after 15 min inactivity
   - Takes ~30 sec to wake up
   - 750 hours/month free
   - Enough for MVP testing!

2. **Database**:
   - Use existing Render PostgreSQL
   - Already have DATABASE_URL
   - Migrations will run automatically

3. **OTP Provider**:
   - Currently set to `console` (prints OTP)
   - For production, switch to email/SMS
   - See `OTP_PROVIDER_SETUP.md`

### Mobile:
1. **Package Name**:
   - Using `com.contractorconnect.app`
   - Can't change after Play Store upload
   - Keep it for now

2. **Version**:
   - Version: 1.0.0
   - Version Code: 1
   - Increment for updates

3. **Signing**:
   - Expo handles signing for now
   - For Play Store, will need keystore
   - EAS Build will help with this

---

## 🐛 Troubleshooting

### EAS Build Fails:
```powershell
# Clear cache and retry
eas build:cancel
eas build --profile preview --platform android --clear-cache
```

### API Connection Fails:
```typescript
// Check API_CONFIG.ts has correct URL
// Check CORS is configured in backend
// Test API in browser first
```

### OTP Not Working:
```bash
# Check backend logs in Render dashboard
# OTP will print to logs if using console provider
# Look for line: "📱 OTP for..."
```

### App Crashes:
```powershell
# Check build logs
eas build:view

# Test locally first
npm start
```

---

## 📞 Next Steps After Installation

### If Testing Goes Well:
1. Create proper app icon (1024x1024)
2. Create splash screen
3. Build production signed APK
4. Test with more users
5. Collect feedback

### If Issues Found:
1. Document bugs
2. Fix in code
3. Test locally
4. Rebuild and redeploy
5. Test again

### For Play Store:
1. Create Play Console account ($25 one-time)
2. Prepare app listing (description, screenshots)
3. Build release bundle: `eas build --profile production`
4. Upload to Play Store
5. Submit for review

---

## 🎯 Current Status

### ✅ Complete:
- Backend code (100% MVP)
- Mobile app (100% MVP)
- Database setup
- API integration
- OTP system (flexible providers)

### ⏳ Today's Goals:
1. Test with Expo Go ✅
2. Deploy backend ✅
3. Build APK ✅
4. Install on phone ✅
5. End-to-end testing ✅

### 📅 This Week:
- Polish UI
- Fix bugs
- Add app icon
- Production build
- User testing

---

## 🚀 Let's Start!

**Choose your path and run these commands:**

### Path A (Immediate Testing):
```powershell
cd D:\Code\workspace\ContractorConnect\mobile
npm start
# Scan QR with Expo Go
```

### Path B (Build APK):
```powershell
npm install -g eas-cli
cd D:\Code\workspace\ContractorConnect\mobile
eas login
eas build --profile preview --platform android
```

### Path C (Full Production):
```powershell
# First deploy backend (see guide above)
# Then build app
cd D:\Code\workspace\ContractorConnect\mobile
eas build --profile preview --platform android
```

**I recommend starting with Path A to test everything works, then moving to Path B/C!**

Ready? Let me know which path you want to take and I'll guide you through it step-by-step! 🎉
