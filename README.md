# ContractorConnect

A mobile application connecting building societies with trusted contractors for civil work projects.

## 📱 What It Does

**For Societies:** Submit work requests, receive bids, hire contractors  
**For Contractors:** Browse available work, submit competitive bids, get hired


### Backend
```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Mobile
```powershell
cd mobile
npx expo start
```

## 📂 Project Structure

```
ContractorConnect/
├── backend/              # FastAPI backend with PostgreSQL
├── mobile/               # React Native Expo app
├── docs/                 # Detailed documentation
│   ├── fixes/            # Bug fix documentation
│   └── sessions/         # Development session notes
├── QUICK_START.md        # ⭐ Start here!
├── COMMANDS.md           # Useful commands reference
├── DEPLOYMENT_GUIDE.md   # Production deployment
└── README.md             # This file
```

## 📚 Documentation

### Essential Docs (Root Directory):
- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[COMMANDS.md](./COMMANDS.md)** - All useful commands
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deploy to production
- **[DATABASE_USER_GUIDE.md](./DATABASE_USER_GUIDE.md)** - Database management

### Detailed Docs (docs/ folder):
- **[docs/PROJECT-CHECKLIST.md](./docs/PROJECT-CHECKLIST.md)** - Implementation progress
- **[docs/API-SPECIFICATION.md](./docs/07-API-SPECIFICATION.md)** - API reference
- **[docs/fixes/](./docs/fixes/)** - Bug fixes and solutions
- **[docs/sessions/](./docs/sessions/)** - Development session notes

## ✨ Features

### Authentication
- ✅ Phone number + OTP verification
- ✅ Password login for returning users
- ✅ Secure token storage
- ✅ Role-based access (Society/Contractor)

### Society Users
- ✅ Create work requests
- ✅ View all your requests
- ✅ Track request status
- ✅ Receive and review bids

### Contractor Users
- ✅ Browse available work
- ✅ Filter by category
- ✅ Submit competitive bids
- ✅ Track bid status

### Common Features
- ✅ Profile management
- ✅ Logout functionality
- ✅ Safe area navigation
- ✅ Responsive design

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL (Database)
- SQLAlchemy (ORM)
- Alembic (Migrations)
- JWT Authentication
- Bcrypt (Password hashing)

**Mobile:**
- React Native + Expo
- TypeScript
- Zustand (State management)
- React Navigation
- Expo SecureStore
- React Native Paper (UI)

**Hosting:**
- Backend: Render
- Database: Render PostgreSQL
- Mobile: Expo Go (Development)

## 📊 Current Status

**Phase:** MVP Development  
**Status:** Core features complete, ready for testing

### Completed ✅
- User authentication system
- Request creation and browsing
- Bid submission system
- Profile management
- Mobile UI with navigation

### In Progress 🚧
- Request details screen
- Bid management
- Notifications

### Planned 📋
- Chat/Messaging
- Payment integration
- Review system

## 🔑 Environment Setup

### Backend (.env)
```env
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30
```

### Mobile (.env)
```env
API_URL=http://192.168.1.107:8000/api/v1
```

## 🧪 Testing

### Check Database
```powershell
cd backend
.\.venv\Scripts\python.exe scripts\check_users.py
```

## 📞 Support

Check documentation in `docs/` folder or review session notes for troubleshooting.

---

**Last Updated:** January 6, 2026  
**Version:** 1.0.0 MVP
