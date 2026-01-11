# Quick Database Check Commands

## Check Total Users
```powershell
cd D:\Code\workspace\ContractorConnect\backend
.\.venv\Scripts\python.exe -c "from app.core.database import SessionLocal; from app.models.user import User; db = SessionLocal(); print(f'📊 Total Users: {db.query(User).count()}'); db.close()"
```

## List All Users (One-liner)
```powershell
.\.venv\Scripts\python.exe -c "from app.core.database import SessionLocal; from app.models.user import User; db = SessionLocal(); users = db.query(User).all(); [print(f'{u.phone_number} | {u.name or \"No name\"} | {u.role} | {\"✅\" if u.is_verified else \"⏳\"}') for u in users]; print(f'\nTotal: {len(users)} users'); db.close()"
```

## Check Last Registered User
```powershell
.\.venv\Scripts\python.exe -c "from app.core.database import SessionLocal; from app.models.user import User; db = SessionLocal(); user = db.query(User).order_by(User.created_at.desc()).first(); print(f'Last user: {user.phone_number} - {user.name} ({user.role})') if user else print('No users yet'); db.close()"
```

## Detailed User Check (Pretty)
```powershell
.\.venv\Scripts\python.exe scripts\check_users.py
```

## Delete All Users (CAREFUL!)
```powershell
.\.venv\Scripts\python.exe -c "from app.core.database import SessionLocal; from app.models.user import User; db = SessionLocal(); count = db.query(User).delete(); db.commit(); print(f'Deleted {count} users'); db.close()"
```

## Check Specific Phone Number
```powershell
# Replace +919876543210 with actual phone number
.\.venv\Scripts\python.exe -c "from app.core.database import SessionLocal; from app.models.user import User; db = SessionLocal(); user = db.query(User).filter(User.phone_number == '+919876543210').first(); print(f'Found: {user.name} - Verified: {user.is_verified}') if user else print('User not found'); db.close()"
```

## Create Admin User (if needed)
```powershell
.\.venv\Scripts\python.exe -c "from app.core.database import SessionLocal; from app.models.user import User, UserRole, UserStatus; import uuid; db = SessionLocal(); admin = User(id=str(uuid.uuid4()), phone_number='+919999999999', name='Admin', role=UserRole.ADMIN, status=UserStatus.ACTIVE, is_verified=True); db.add(admin); db.commit(); print('Admin created!'); db.close()"
```
