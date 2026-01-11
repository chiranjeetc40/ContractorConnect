# 🚀 Deployment & APK Build Guide

**Date:** December 29, 2025  
**Status:** Ready for deployment preparation

---

## 📱 Part 1: Build APK for Your Phone (Quick Start)

### Option A: Development APK (Fastest - 10 minutes)

This builds an APK you can install right away for testing.

#### Prerequisites Check:
```bash
# Check if you have everything
node --version     # Should be 16+
npm --version      # Should be 7+
java -version      # Should be Java 11 or 17
```

#### Step 1: Navigate to mobile folder
```bash
cd D:\Code\workspace\ContractorConnect\mobile
```

#### Step 2: Install EAS CLI (if not installed)
```bash
npm install -g eas-cli
```

#### Step 3: Configure for local build
Create `eas.json` in mobile folder:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### Step 4: Update app.json
```json
{
  "expo": {
    "name": "ContractorConnect",
    "slug": "contractorconnect",
    "version": "1.0.0",
    "android": {
      "package": "com.contractorconnect.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

#### Step 5: Build APK locally
```bash
# Option 1: Using Expo Go (for testing with Expo Go app)
npx expo start --android

# Option 2: Build development APK
eas build --profile development --platform android --local

# Option 3: Build preview APK (no Expo Go needed)
eas build --profile preview --platform android --local
```

#### Step 6: Install on your phone

**Method 1: USB Connection**
```bash
# Enable USB debugging on your phone first
# Then connect phone via USB
adb devices  # Check if phone is detected
adb install path/to/your-app.apk
```

**Method 2: Direct Download**
- Build will create an APK file in your project
- Transfer APK to phone via USB, WhatsApp, or email
- Open APK file on phone
- Allow "Install from unknown sources"
- Install the app

---

### Option B: Production APK (For Real Users - 30 minutes)

This creates a proper signed APK for distribution.

#### Step 1: Generate Keystore
```bash
cd android/app

# Generate keystore
keytool -genkeypair -v -storetype PKCS12 -keystore contractorconnect.keystore -alias contractorconnect -keyalg RSA -keysize 2048 -validity 10000
```

Enter these details:
- Keystore password: (choose a strong password)
- Name: ContractorConnect
- Organizational Unit: Engineering
- Organization: ContractorConnect
- City/Locality: Your City
- State: Your State
- Country Code: IN

**IMPORTANT:** Save the keystore file and password securely!

#### Step 2: Configure Gradle for signing

Create `android/app/keystore.properties`:
```properties
storePassword=your_keystore_password
keyPassword=your_key_password
keyAlias=contractorconnect
storeFile=contractorconnect.keystore
```

Update `android/app/build.gradle`:
```gradle
// Add before android block
def keystorePropertiesFile = rootProject.file("app/keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### Step 3: Build Release APK
```bash
cd android
./gradlew assembleRelease

# APK will be created at:
# android/app/build/outputs/apk/release/app-release.apk
```

#### Step 4: Test the APK
```bash
# Install on connected device
adb install app/build/outputs/apk/release/app-release.apk
```

---

## 🌐 Part 2: Backend Deployment

### Current Setup:
- ✅ Backend code complete (100% MVP)
- ✅ PostgreSQL on Render (already connected)
- ✅ Environment variables configured
- ⏳ Need to deploy to production server

### Deployment Options:

#### Option 1: Render (Recommended - Easy & Free Tier)

**Why Render:**
- ✅ Free PostgreSQL already set up
- ✅ Automatic deployments from Git
- ✅ Free SSL certificates
- ✅ Simple dashboard
- ✅ Good for MVP

**Steps:**

1. **Push code to GitHub** (if not already)
```bash
cd D:\Code\workspace\ContractorConnect
git add .
git commit -m "chore: Prepare for deployment"
git push origin main
```

2. **Create Web Service on Render**
- Go to https://dashboard.render.com
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Configure:
  - **Name:** contractorconnect-api
  - **Environment:** Python 3
  - **Build Command:** `pip install -r requirements.txt`
  - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - **Plan:** Free

3. **Add Environment Variables**
In Render dashboard, add these environment variables:
```bash
DATABASE_URL=<your-render-postgresql-url>
SECRET_KEY=<generate-secure-key>
ENVIRONMENT=production
DEBUG=False
CORS_ORIGINS=["*"]  # Update with your domain later

# OTP Configuration
OTP_DELIVERY_METHOD=console  # Or email/sms
OTP_EXPIRE_MINUTES=5

# Email (if using email OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Optional: SMS providers
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

4. **Deploy**
- Click "Create Web Service"
- Render will automatically deploy
- Get your API URL: `https://contractorconnect-api.onrender.com`

5. **Run Migrations**
```bash
# In Render Shell
alembic upgrade head
```

6. **Update Mobile App**
Update `mobile/src/config/api.config.ts`:
```typescript
const API_CONFIG = {
  BASE_URL: 'https://contractorconnect-api.onrender.com/api',
  // ... rest of config
};
```

---

#### Option 2: Railway (Alternative)

**Steps:**
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Select repository
5. Add PostgreSQL database
6. Configure environment variables
7. Deploy

**URL:** `https://contractorconnect-production.up.railway.app`

---

#### Option 3: AWS EC2 (Advanced)

For production scale, use AWS:
- EC2 for backend
- RDS for PostgreSQL
- S3 for file storage
- CloudFront for CDN
- Route 53 for DNS

(Detailed guide available if needed)

---

## 📋 Pre-Deployment Checklist

### Backend Preparation ✅

- [x] All API endpoints tested
- [x] Database migrations ready
- [x] Environment variables documented
- [ ] Production database created
- [ ] Secret keys generated
- [ ] CORS configured for mobile app
- [ ] OTP provider configured
- [ ] Error logging set up (optional: Sentry)
- [ ] API rate limiting configured
- [ ] Database backups enabled

### Mobile App Preparation ✅

- [x] All screens complete
- [x] API integration complete
- [x] Error handling implemented
- [ ] App icon created (1024x1024)
- [ ] Splash screen created
- [ ] App name finalized
- [ ] Package name set (com.contractorconnect.app)
- [ ] Version code set (1)
- [ ] API URL updated to production
- [ ] Remove console.logs from production
- [ ] Test on real device

---

## 🔧 Quick Commands Reference

### Build Commands:
```bash
# Development APK (with Expo)
cd mobile
npx expo start --android

# Preview APK (without Expo)
eas build --profile preview --platform android --local

# Production APK
cd mobile/android
./gradlew assembleRelease

# Install APK
adb install path/to/app.apk
```

### Backend Commands:
```bash
# Local testing
cd backend
uvicorn app.main:app --reload

# Check migrations
alembic current
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"
```

### Git Commands:
```bash
# Prepare for deployment
git status
git add .
git commit -m "chore: Prepare for deployment"
git push origin main
```

---

## 📱 Testing Your APK

### Before Installing:
1. ✅ Backend is deployed and accessible
2. ✅ Database migrations are applied
3. ✅ API URL in app points to production
4. ✅ Test all endpoints in Postman

### After Installing:
1. Register new user
2. Verify OTP (check console/email)
3. Create request (Society)
4. Browse requests (Contractor)
5. Submit bid
6. Accept bid
7. Test all major flows

### Common Issues:

**Issue: "App not installed"**
- Solution: Uninstall any existing version first
- Solution: Enable "Install from unknown sources"

**Issue: "Network request failed"**
- Solution: Check API URL in config
- Solution: Ensure backend is running
- Solution: Check internet connection

**Issue: "Unable to connect to database"**
- Solution: Check DATABASE_URL in environment
- Solution: Ensure database is accessible from Render

---

## 🎯 Next Steps

### Immediate (Today):
1. ✅ Build development APK
2. ✅ Test on your phone
3. ✅ Deploy backend to Render
4. ✅ Update API URL in mobile app
5. ✅ Test end-to-end flow

### This Week:
1. Create app icon and splash screen
2. Build production APK
3. Test with real users
4. Collect feedback
5. Fix critical bugs

### Next Week:
1. Prepare Play Store listing
2. Create screenshots
3. Write app description
4. Submit to Play Store
5. Start marketing

---

## 📞 Support Checklist

### If APK Build Fails:
1. Check Java version: `java -version`
2. Check Android SDK path
3. Check Gradle version
4. Clear build cache: `cd android && ./gradlew clean`
5. Check logs for specific error

### If Deployment Fails:
1. Check build logs in Render/Railway
2. Verify environment variables
3. Check database connection
4. Test migrations locally first
5. Check Python version compatibility

### If App Crashes:
1. Check device logs: `adb logcat`
2. Verify API is accessible
3. Check for CORS errors
4. Verify all dependencies installed
5. Test on different device

---

## 🔐 Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Generate secure SECRET_KEY (32+ chars)
- [ ] Enable HTTPS only
- [ ] Set secure CORS origins (not "*")
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Enable error logging (Sentry)
- [ ] Review API permissions
- [ ] Test authentication thoroughly
- [ ] Keep keystore file secure (never commit!)

---

## 📊 Deployment Timeline

**Estimated Time:**
- APK Build (Development): 10 minutes
- APK Build (Production): 30 minutes
- Backend Deployment (Render): 20 minutes
- Testing: 1 hour
- Fixes & Refinement: 2 hours

**Total:** ~4 hours to have app running on your phone with production backend!

---

**Ready to start?** Let me know which option you want to proceed with first:
1. Build APK for your phone (fastest)
2. Deploy backend to Render
3. Both simultaneously

I'll guide you step-by-step! 🚀
