# User Flow Guide

## 👥 Two Different User Experiences

### 🏢 Society User Flow

```
Login as Society
    ↓
HOME SCREEN: "Your Requests"
├─ Shows: ALL your submitted requests
├─ Status filters: All | Open | In Progress | Completed
└─ FAB Button (+): Create New Request
    ↓
Tap FAB → CREATE REQUEST SCREEN
├─ Title
├─ Description  
├─ Category (Plumbing, Electrical, etc.)
├─ Location
└─ Submit
    ↓
Request Created → Back to Home
    ↓
View Your Request
├─ See request details
├─ View bids received
└─ Accept/Reject bids
```

### 👷 Contractor User Flow

```
Login as Contractor
    ↓
HOME SCREEN: "Available Work"
├─ Shows: ALL OPEN requests (from all societies)
├─ Search bar
├─ Filter by: Category | City
└─ NO FAB button (can't create requests)
    ↓
Tap Request → VIEW DETAILS
├─ Request information
├─ Location
└─ Submit Bid Button
    ↓
Tap Submit Bid → BID FORM
├─ Your bid amount
├─ Estimated timeline
├─ Work plan/notes
└─ Submit
    ↓
Bid Submitted → Track in "My Bids" Tab
```

---

## 🔍 Key Differences

| Feature | Society User | Contractor User |
|---------|-------------|-----------------|
| **Home Screen Title** | "Your Requests" | "Available Work" |
| **Shows** | Own requests only | All open requests |
| **FAB Button (+)** | ✅ Yes - Create Request | ❌ No |
| **Can Create Requests** | ✅ Yes | ❌ No |
| **Can Submit Bids** | ❌ No | ✅ Yes |
| **Filters** | By Status (All/Open/Progress/Done) | By Category & City |
| **My Bids Tab** | ❌ No | ✅ Yes |

---

## 📱 Bottom Navigation

### Society Tabs:
```
┌─────────┬──────────┐
│  Home   │ Profile  │
└─────────┴──────────┘
```

### Contractor Tabs:
```
┌────────┬─────────┬─────────┬──────────┐
│ Browse │ My Bids │ My Work │ Profile  │
└────────┴─────────┴─────────┴──────────┘
```

---

## 🎯 First Time Testing

### As Society User:
1. **Login as Society**
2. Home screen might be **empty** (no requests yet)
3. **Tap the + Button** (FAB in bottom right)
4. Fill out request form
5. Submit
6. Now you'll see your request on home screen!

### As Contractor User:
1. **Login as Contractor**
2. Home screen shows **all available work**
3. If empty: No societies have created requests yet
4. **NO + button** - you can't create requests
5. When requests exist: Browse, filter, submit bids

---
