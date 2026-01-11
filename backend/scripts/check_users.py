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
   ├─ 🔑 Password Hash: {user.password_hash}
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
