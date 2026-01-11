# 🚀 Quick Start: Install App on Your Phone

**For ContractorConnect Project**  
**Date:** December 29, 2025

---

## ⚡ Fastest Way (Using Expo Go - 5 Minutes)

This is the easiest way to test your app immediately!

### Step 1: Install Expo Go on your phone
- **Android**: Download from Play Store
  - https://play.google.com/store/apps/details?id=host.exp.exponent

### Step 2: Start the development server
```powershell
# In PowerShell (already have terminal open)
cd D:\Code\workspace\ContractorConnect\mobile
npm start
```

### Step 3: Scan QR code
- Open Expo Go app on your phone
- Tap "Scan QR code"
- Scan the QR code shown in terminal
- App will load and run!

**Pros:** Super fast, no build needed  
**Cons:** Requires Expo Go app, needs computer running

---

## 📦 Build APK (Standalone - 30 Minutes)

This creates an APK you can install without Expo Go.

### Prerequisites:
```powershell
# Check if EAS CLI is installed
eas --version

# If not installed:
npm install -g eas-cli
```

### Step 1: Configure app.json

Update `mobile/app.json`:
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
        "backgroundColor": "#007bff"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "INTERNET"
      ]
    }
  }
}
```

### Step 2: Create eas.json

Create `mobile/eas.json`:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Step 3: Login to Expo (if first time)
```powershell
cd D:\Code\workspace\ContractorConnect\mobile
eas login
```

### Step 4: Build APK
```powershell
# Build preview APK (no Expo Go needed)
eas build --profile preview --platform android

# This will:
# 1. Upload your code to Expo servers
# 2. Build APK in the cloud
# 3. Give you download link when done (~10-15 min)
```

### Step 5: Download and Install
- Click the download link from terminal
- Transfer APK to your phone
- Enable "Install from unknown sources" in phone settings
- Open APK file and install

---

## 🏗️ Build Locally (Advanced - 1 Hour)

Build APK on your computer without cloud.

### Prerequisites:
1. **Android Studio** installed
2. **Java JDK 17** installed
3. **Android SDK** configured

### Step 1: Check Android setup
```powershell
# Check Java
java -version  # Should show Java 17

# Check Android SDK
echo $env:ANDROID_HOME  # Should show SDK path
```

### Step 2: Build locally
```powershell
cd D:\Code\workspace\ContractorConnect\mobile

# Build development APK
eas build --profile preview --platform android --local

# APK will be created in current directory
```

### Step 3: Install on phone
```powershell
# Connect phone via USB (enable USB debugging first)
adb devices  # Check if phone detected

# Install APK
adb install path-to-your-app.apk
```

---

## 🌐 Update Backend URL (Important!)

Before building, make sure your app points to production backend:

### Option 1: Use Render backend (Recommended)

1. Deploy backend to Render first (see DEPLOYMENT_GUIDE.md)
2. Get your backend URL: `https://contractorconnect-api.onrender.com`
3. Update `mobile/src/config/api.config.ts`:

```typescript
const API_CONFIG = {
  // Change this:
  // BASE_URL: 'http://localhost:8000/api',
  
  // To your production URL:
  BASE_URL: 'https://contractorconnect-api.onrender.com/api',
  
  // ... rest of config
};
```

### Option 2: Use local backend (Testing only)

If testing with local backend on same WiFi:

1. Find your computer's IP address:
```powershell
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

2. Update config:
```typescript
const API_CONFIG = {
  BASE_URL: 'http://192.168.1.100:8000/api',  // Use your IP
  // ...
};
```

3. Ensure backend allows CORS from your phone
4. Make sure computer and phone are on same WiFi

---

## 📱 Installation Steps on Phone

### Enable Unknown Sources:
1. Go to **Settings**
2. Go to **Security** or **Privacy**
3. Enable **Install from unknown sources** or **Install unknown apps**
4. Allow your file manager/browser to install apps

### Install APK:
1. Copy APK to phone via:
   - USB cable
   - WhatsApp/Telegram (send to yourself)
   - Google Drive/Dropbox
   - Direct download link
2. Open APK file on phone
3. Tap **Install**
4. Wait for installation
5. Tap **Open** or find app in app drawer

---

## 🧪 Testing Checklist

After installing, test these flows:

### Authentication:
- [ ] Open app (splash screen shows)
- [ ] Register new user
- [ ] Receive OTP (check console/email)
- [ ] Verify OTP
- [ ] Login works
- [ ] Token persists after closing app

### Society User:
- [ ] Create new request
- [ ] View my requests
- [ ] View request details
- [ ] Accept a bid
- [ ] Update request status

### Contractor User:
- [ ] Browse requests
- [ ] Search/filter requests
- [ ] Submit bid
- [ ] View my bids
- [ ] Withdraw bid

### General:
- [ ] Navigation works
- [ ] Forms validate correctly
- [ ] Error messages show
- [ ] Loading states work
- [ ] Images load (if any)
- [ ] Logout works

---

## 🐛 Troubleshooting

### "App not installed" error:
```
Solution:
1. Uninstall any existing version first
2. Clear phone cache
3. Try installing again
```

### "Network request failed":
```
Solution:
1. Check internet connection
2. Verify backend URL in api.config.ts
3. Check backend is running
4. Try with Postman first
```

### App crashes on launch:
```
Solution:
1. Check device logs: adb logcat
2. Ensure all dependencies installed
3. Rebuild with fresh install:
   cd mobile
   rm -rf node_modules
   npm install
   eas build ...
```

### QR code not scanning (Expo Go):
```
Solution:
1. Ensure phone and computer on same WiFi
2. Try typing URL manually in Expo Go
3. Check firewall settings
```

---

## 📊 Current Status

### Backend:
- ✅ Code complete (100% MVP)
- ✅ Database on Render
- ✅ All API endpoints working
- ⏳ Need to deploy to production
- ⏳ Need to configure OTP provider

### Mobile App:
- ✅ All screens complete
- ✅ API integration done
- ✅ Navigation working
- ✅ State management setup
- ⏳ Need production build
- ⏳ Need app icon/splash

---

## ⏭️ Next Steps

### Today (Priority):
1. **Test with Expo Go** (5 min)
   ```powershell
   cd mobile
   npm start
   # Scan QR on phone
   ```

2. **Deploy Backend** (20 min)
   - See DEPLOYMENT_GUIDE.md
   - Get production URL
   - Update api.config.ts

3. **Build Preview APK** (15 min)
   ```powershell
   eas build --profile preview --platform android
   ```

4. **Install & Test** (30 min)
   - Download APK
   - Install on phone
   - Test all features

### This Week:
1. Create proper app icon (1024x1024)
2. Create splash screen
3. Build production APK
4. Test with real users
5. Collect feedback

### Next Week:
1. Fix bugs from testing
2. Prepare Play Store listing
3. Submit to Play Store

---

## 🎯 Quick Commands

```powershell
# Start development server
cd D:\Code\workspace\ContractorConnect\mobile
npm start

# Build preview APK (cloud)
eas build --profile preview --platform android

# Build locally (if setup)
eas build --profile preview --platform android --local

# Install APK
adb install app.apk

# Check connected devices
adb devices

# View phone logs
adb logcat
```

---

## 💡 Pro Tips

1. **Use Expo Go first** - Fastest way to test
2. **Deploy backend first** - Ensure APIs work
3. **Test on real device** - Emulators don't show real issues
4. **Keep dev server running** - For Expo Go testing
5. **Use preview builds** - APK builds faster than production
6. **Save keystore safely** - You'll need it for updates

---

## 📞 Need Help?

Common issues and solutions:

1. **EAS build fails**: Check eas.json configuration
2. **APK won't install**: Enable unknown sources
3. **App crashes**: Check adb logcat for errors
4. **API errors**: Verify backend URL and CORS
5. **OTP not received**: Check OTP provider config

---

**Ready to install?** Start with Expo Go (fastest) or build APK (standalone).

Run this now:
```powershell
cd D:\Code\workspace\ContractorConnect\mobile
npm start
```

Then scan QR code with Expo Go app! 🚀
