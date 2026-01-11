# 🗄️ Database User Management Guide

## Quick Commands to Check Users

### Method 1: Using Python Script (Recommended)

Create and run this script to check all users:

```powershell
# In backend directory
cd D:\Code\workspace\ContractorConnect\backend

# Create a script to check users
@"
from app.core.database import SessionLocal
from app.models.user import User
import json

db = SessionLocal()
try:
    users = db.query(User).all()
    print(f"\n📊 Total Users: {len(users)}\n")
    print("=" * 80)
    
    for user in users:
        print(f"""
User ID: {user.id}
Name: {user.name or 'Not set'}
Phone: {user.phone_number}
Email: {user.email or 'Not set'}
Role: {user.role}
Status: {user.status}
Verified: {'✅ Yes' if user.is_verified else '❌ No'}
Created: {user.created_at}
{'-' * 80}
        """)
finally:
    db.close()
"@ | Out-File -FilePath check_users.py -Encoding UTF8

# Run the script
.\.venv\Scripts\python.exe check_users.py
```

### Method 2: Using psql (PostgreSQL Command Line)

```powershell
# Connect to your database
psql "postgresql://contractor_user:gCNb1EW3dufWbmO4H98Rxt3HMkEYWVeY@dpg-ctgmobaj1k6c73db5stg-a.singapore-postgres.render.com/contractor_db_x65r"

# Then run SQL queries:
```

```sql
-- Check all users
SELECT id, name, phone_number, email, role, status, is_verified, created_at 
FROM users 
ORDER BY created_at DESC;

-- Count users by role
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- Check verified vs unverified
SELECT 
    is_verified, 
    COUNT(*) as count 
FROM users 
GROUP BY is_verified;

-- Check user with specific phone
SELECT * FROM users WHERE phone_number = '+919876543210';

-- Exit psql
\q
```

### Method 3: Using Python REPL

```powershell
cd D:\Code\workspace\ContractorConnect\backend

# Start Python REPL
.\.venv\Scripts\python.exe

# Then in Python:
```

```python
from app.core.database import SessionLocal
from app.models.user import User

# Create database session
db = SessionLocal()

# Get all users
users = db.query(User).all()

# Print user count
print(f"Total users: {len(users)}")

# Print each user
for user in users:
    print(f"{user.id}: {user.name} ({user.phone_number}) - {user.role} - {'Verified' if user.is_verified else 'Not Verified'}")

# Get specific user by phone
user = db.query(User).filter(User.phone_number == "+919876543210").first()
print(user.name if user else "User not found")

# Get unverified users
unverified = db.query(User).filter(User.is_verified == False).all()
print(f"Unverified users: {len(unverified)}")

# Close session
db.close()

# Exit Python
exit()
```

### Method 4: Using API Endpoint (Create Admin Endpoint)

Let me create an admin endpoint for you:

**File**: `backend/app/api/v1/admin.py` (New file)

```python
"""
Admin API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.dependencies import get_current_active_user
from app.models.user import User, UserRole
from app.schemas.user import UserResponse

router = APIRouter()


@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List all users (Admin only).
    
    **Requires admin role**
    """
    # Check if user is admin
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access this endpoint"
        )
    
    users = db.query(User).offset(skip).limit(limit).all()
    return users
```

Then access: `http://192.168.1.107:8000/docs` → Try the `/api/v1/admin/users` endpoint

## 📊 Common Queries

### Delete a User
```python
from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()
user = db.query(User).filter(User.phone_number == "+919876543210").first()
if user:
    db.delete(user)
    db.commit()
    print(f"Deleted user: {user.name}")
db.close()
```

### Update User Status
```python
from app.core.database import SessionLocal
from app.models.user import User, UserStatus

db = SessionLocal()
user = db.query(User).filter(User.phone_number == "+919876543210").first()
if user:
    user.is_verified = True
    user.status = UserStatus.ACTIVE
    db.commit()
    print(f"Updated user: {user.name}")
db.close()
```

### Clear All Users (CAREFUL!)
```python
from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()
db.query(User).delete()
db.commit()
print("All users deleted!")
db.close()
```

## 🔍 Using DBeaver (GUI Tool)

1. **Download DBeaver**: https://dbeaver.io/download/
2. **Install and Open**
3. **Create New Connection**:
   - Database: PostgreSQL
   - Host: `dpg-ctgmobaj1k6c73db5stg-a.singapore-postgres.render.com`
   - Port: `5432`
   - Database: `contractor_db_x65r`
   - Username: `contractor_user`
   - Password: `gCNb1EW3dufWbmO4H98Rxt3HMkEYWVeY`
   - SSL: Required

4. **Browse Tables**: Navigate to `public` → `users`
5. **View Data**: Right-click table → View Data

## 📝 Quick Check Script

Save this as `backend/scripts/check_users.py`:

```python
"""
Quick script to check all users in the database.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.user import User

def main():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        
        print("\n" + "=" * 80)
        print(f"📊 TOTAL USERS: {len(users)}")
        print("=" * 80 + "\n")
        
        if not users:
            print("❌ No users found in database.\n")
            return
        
        for i, user in enumerate(users, 1):
            status_icon = "✅" if user.is_verified else "⏳"
            print(f"""
{i}. {status_icon} {user.name or 'Unnamed User'}
   ├─ 📱 Phone: {user.phone_number}
   ├─ 📧 Email: {user.email or 'Not provided'}
   ├─ 👤 Role: {user.role.upper()}
   ├─ 🔑 Status: {user.status}
   ├─ ✓  Verified: {'Yes' if user.is_verified else 'No'}
   ├─ 📅 Created: {user.created_at.strftime('%Y-%m-%d %H:%M:%S')}
   └─ 🆔 ID: {user.id}
            """)
        
        print("=" * 80 + "\n")
        
        # Summary
        print("📈 SUMMARY:")
        print(f"   - Contractors: {sum(1 for u in users if u.role == 'contractor')}")
        print(f"   - Societies: {sum(1 for u in users if u.role == 'society')}")
        print(f"   - Admins: {sum(1 for u in users if u.role == 'admin')}")
        print(f"   - Verified: {sum(1 for u in users if u.is_verified)}")
        print(f"   - Unverified: {sum(1 for u in users if not u.is_verified)}")
        print("\n")
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
```

**Run it**:
```powershell
cd D:\Code\workspace\ContractorConnect\backend
.\.venv\Scripts\python.exe scripts\check_users.py
```

## 🚨 Testing Registration Fix

After fixing the registration issue, test with:

1. **Register a new user** in the app
2. **Check backend logs** for the OTP
3. **Verify the user was created**:

```powershell
cd backend
.\.venv\Scripts\python.exe -c "from app.core.database import SessionLocal; from app.models.user import User; db = SessionLocal(); users = db.query(User).all(); print(f'Total users: {len(users)}'); [print(f'{u.phone_number} - {u.name} - {u.role}') for u in users]; db.close()"
```

4. **Copy OTP from logs**
5. **Verify in app**
6. **Check user is now verified**:

```powershell
.\.venv\Scripts\python.exe -c "from app.core.database import SessionLocal; from app.models.user import User; db = SessionLocal(); user = db.query(User).filter(User.phone_number == '+919876543210').first(); print(f'Verified: {user.is_verified}' if user else 'Not found'); db.close()"
```

---

**Quick Test After Fix:**
```powershell
# 1. Register in app
# 2. Check if user created:
cd D:\Code\workspace\ContractorConnect\backend
.\.venv\Scripts\python.exe -c "from app.core.database import SessionLocal; from app.models.user import User; db = SessionLocal(); print(f'Users: {db.query(User).count()}'); db.close()"
```
