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
├─ Budget Range
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
├─ Budget range
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

## 💡 Why It Might Look Similar

Both screens use:
- Similar search bars
- Similar card layouts
- Similar filters

**But the DATA is different:**
- Society sees: "My requests I created"
- Contractor sees: "Available work I can bid on"

---

## 🧪 Test the Difference

### Step 1: Create Two Accounts
```
Account 1: Society User
Phone: +91 9999999991
Role: Society

Account 2: Contractor User  
Phone: +91 9999999992
Role: Contractor
```

### Step 2: Login as Society
1. Login with Society account
2. Tap + button (FAB)
3. Create a work request (e.g., "Fix Bathroom Leak")
4. Submit

### Step 3: Login as Contractor
1. **Logout** from Society account
2. Login with Contractor account
3. You should NOW see the request Society created!
4. Tap it → Submit a bid

### Step 4: Back to Society
1. Logout from Contractor
2. Login as Society again
3. View your request
4. You should see the bid Contractor submitted!

---

## 📊 Visual Differences

### Society Home Screen:
```
╔═══════════════════════════════════╗
║       Your Requests               ║
╠═══════════════════════════════════╣
║ 🔍 Search your requests...        ║
║                                   ║
║ [All] [Open] [In Progress] [Done] ║
║                                   ║
║ ┌──────────────────────────────┐  ║
║ │ Fix Bathroom Leak            │  ║
║ │ 💰 ₹2,000 - ₹5,000          │  ║
║ │ 🏷️ Plumbing                 │  ║
║ │ 📍 Mumbai                    │  ║
║ │ 📊 3 Bids Received           │  ║
║ └──────────────────────────────┘  ║
║                                   ║
║              [+] ← FAB Button     ║
╚═══════════════════════════════════╝
```

### Contractor Browse Screen:
```
╔═══════════════════════════════════╗
║       Available Work              ║
╠═══════════════════════════════════╣
║ 🔍 Search requests...             ║
║                                   ║
║ [Category ▼] [City ▼]             ║
║                                   ║
║ ┌──────────────────────────────┐  ║
║ │ Fix Bathroom Leak            │  ║
║ │ 💰 ₹2,000 - ₹5,000          │  ║
║ │ 🏷️ Plumbing                 │  ║
║ │ 📍 Mumbai                    │  ║
║ │ 🏢 Sunshine Apartments       │  ║
║ └──────────────────────────────┘  ║
║                                   ║
║        (NO + Button)              ║
╚═══════════════════════════════════╝
```

---

## ✅ Verification Checklist

- [ ] Society user sees "+ Create Request" button
- [ ] Contractor user does NOT see "+ Create Request" button
- [ ] Society home shows "Your Requests" (own requests)
- [ ] Contractor home shows "Available Work" (all open requests)
- [ ] Society can create requests
- [ ] Contractor can submit bids
- [ ] Different tab layouts (2 tabs vs 4 tabs)

---

**The workflows ARE different!** The confusion might be:
1. Empty state looks similar
2. Card layouts look similar
3. Need actual data to see the difference

**Solution:** Create requests as Society, then login as Contractor to see them!
