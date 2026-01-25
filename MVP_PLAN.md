# MVP Development Plan - ContractorConnect

**Date:** December 28, 2025  
**Objective:** Build complete MVP for end-to-end testing  
**Timeline:** 2-3 weeks for MVP, then iterative feature additions

---

## 🎯 MVP Scope Definition

### Core User Flows (Must Have for MVP)

#### Flow 1: Society User Journey
1. Register/Login → Get OTP → Verify → Access token
2. Create work request (title, description, category, location, budget)
3. View list of bids on their request
4. Accept a bid (assigns contractor)
5. Update request status (in_progress → completed)
6. View request history

#### Flow 2: Contractor User Journey
1. Register/Login → Get OTP → Verify → Access token
2. Browse available requests (search/filter by category, location)
3. View request details
4. Submit bid on a request (amount, proposal)
5. View their submitted bids
6. View assigned work
7. Update work status

#### Flow 3: Admin Journey (Optional for MVP)
1. View all users, requests, bids
2. Moderate content if needed

---

## 📋 Phase Breakdown

### Phase 1: Complete Backend MVP (Week 1)

#### A. Bidding System API (Priority 1) - 2 days
**Status:** Not started  
**Endpoints needed:**
- POST `/api/v1/bids` - Submit bid
- GET `/api/v1/bids/request/{request_id}` - List bids for request
- GET `/api/v1/bids/my-bids` - Contractor's bids
- PATCH `/api/v1/bids/{bid_id}/accept` - Society accepts bid
- DELETE `/api/v1/bids/{bid_id}` - Withdraw bid

**Models:**
```python
Bid:
  - id, request_id, contractor_id
  - amount, proposal (text)
  - status (pending, accepted, rejected, withdrawn)
  - created_at, updated_at
```

**Business Logic:**
- Only contractors can submit bids
- Only open requests can receive bids
- Society owner can accept bid
- Accepting bid auto-assigns contractor to request
- Accepting bid auto-sets request status to IN_PROGRESS
- Cannot bid on own request (if contractor is also society)

#### B. Enhanced API Features (Priority 2) - 1 day
- [ ] Add pagination metadata to all list endpoints
- [ ] Add request/bid statistics endpoints
- [ ] Add user profile with work history
- [ ] Image upload endpoint (optional, can use URLs for MVP)

#### C. API Testing & Documentation (Priority 3) - 1 day
- [ ] Test all user flows in Swagger UI
- [ ] Document complete API flows
- [ ] Create Postman collection
- [ ] Test error scenarios

---

### Phase 2: Frontend Development (Week 2-3)

#### A. Project Setup (Day 1)
**Technology Stack:**
```
Framework: React Native (Expo)
State Management: Redux Toolkit / Zustand
API Client: Axios
Navigation: React Navigation
UI Library: React Native Paper / NativeBase
Form Management: React Hook Form
```

**Folder Structure:**
```
mobile/
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # App screens
│   ├── navigation/        # Navigation setup
│   ├── services/          # API services
│   ├── store/             # State management
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilities
│   ├── constants/         # Constants, colors, etc.
│   └── types/             # TypeScript types
├── assets/                # Images, fonts
├── App.tsx
└── package.json
```

#### B. Core Screens (Days 2-5)

**Authentication Screens:**
1. `WelcomeScreen` - Landing page with Register/Login buttons
2. `RegisterScreen` - Registration form (email, password, name, phone, role)
3. `LoginScreen` - Login form
4. `OTPVerificationScreen` - OTP input

**Society Screens:**
5. `SocietyHomeScreen` - Dashboard with my requests
6. `CreateRequestScreen` - Create new request form
7. `RequestDetailsScreen` - View request with bids
8. `BidListScreen` - List of bids on a request
9. `RequestListScreen` - Browse all my requests

**Contractor Screens:**
10. `ContractorHomeScreen` - Browse available requests
11. `RequestSearchScreen` - Search/filter requests
12. `SubmitBidScreen` - Submit bid form
13. `MyBidsScreen` - View my submitted bids
14. `MyWorkScreen` - View assigned work

**Shared Screens:**
15. `ProfileScreen` - View/edit profile
16. `SettingsScreen` - App settings

#### C. API Integration (Days 6-8)

**Service Layer:**
```typescript
// services/api.ts
- authService: register, login, verifyOTP, refresh
- requestService: create, list, search, update, delete
- bidService: submit, list, accept, withdraw
- userService: profile, update
```

**State Management:**
```typescript
// store/slices/
- authSlice: user, tokens, isAuthenticated
- requestSlice: requests, filters, pagination
- bidSlice: bids, myBids
- uiSlice: loading, errors, notifications
```

#### D. UI/UX Polish (Days 9-10)
- [ ] Loading states
- [ ] Error handling with user-friendly messages
- [ ] Form validation
- [ ] Empty states
- [ ] Pull-to-refresh
- [ ] Offline handling (basic)

---

## 🎨 MVP Screen Designs (Simple, Functional)

### Priority Screens for MVP

#### 1. Authentication Flow
```
WelcomeScreen
  ├── [Register Button]
  └── [Login Button]

RegisterScreen
  ├── Email input
  ├── Password input
  ├── Full Name input
  ├── Phone input
  ├── Role selector (Society/Contractor)
  └── [Register Button] → OTP Screen

OTPVerificationScreen
  ├── OTP input (6 digits)
  ├── [Verify Button]
  └── [Resend OTP]
```

#### 2. Society Flow
```
SocietyHomeScreen (TabNavigator)
  ├── My Requests tab
  │   ├── List of requests (card view)
  │   ├── [+ Create Request FAB]
  │   └── Pull to refresh
  └── Profile tab

CreateRequestScreen
  ├── Title input
  ├── Description textarea
  ├── Category dropdown
  ├── Address, City, State, Pincode
  ├── Expected dates
  └── [Submit Button]

RequestDetailsScreen
  ├── Request info card
  ├── Status badge
  ├── Bids section
  │   ├── Bid cards (contractor, amount, proposal)
  │   └── [Accept Bid] button per bid
  └── [Edit Request] / [Delete Request]
```

#### 3. Contractor Flow
```
ContractorHomeScreen (TabNavigator)
  ├── Browse Requests tab
  │   ├── Search bar
  │   ├── Filter chips (category, location)
  │   ├── Request cards list
  │   └── Pull to refresh
  ├── My Bids tab
  └── My Work tab

RequestDetailsScreen (Contractor view)
  ├── Request info
  ├── Society details
  ├── [Submit Bid] button
  └── Existing bid (if already bid)

SubmitBidScreen
  ├── Amount input
  ├── Proposal textarea
  ├── [Submit Bid Button]
  └── [Cancel]
```

---

## 🔧 Technical Implementation Plan

### Backend Tasks (Bidding System)

#### Step 1: Create Bid Model (30 min)
```python
# app/models/bid.py
class BidStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class Bid(Base):
    id, request_id, contractor_id
    amount, proposal
    status, created_at, updated_at
```

#### Step 2: Create Migration (15 min)
```bash
alembic revision --autogenerate -m "create bids table"
alembic upgrade head
```

#### Step 3: Create Schemas (30 min)
```python
# app/schemas/bid.py
BidCreate, BidUpdate, BidResponse, BidListResponse
```

#### Step 4: Create Repository (1 hour)
```python
# app/repositories/bid_repository.py
create, get_by_id, get_by_request, get_by_contractor
update_status, delete, count_by_request
```

#### Step 5: Create Service (1.5 hours)
```python
# app/services/bid_service.py
submit_bid, accept_bid, withdraw_bid
list_bids_for_request, get_my_bids
Validation: contractor can't bid on own request
Business logic: accepting bid assigns contractor
```

#### Step 6: Create API Endpoints (1.5 hours)
```python
# app/api/v1/bids.py
5 endpoints with full OpenAPI docs
```

### Frontend Tasks

#### Step 1: Initialize React Native Project (1 hour)
```bash
npx create-expo-app@latest mobile
cd mobile
npm install @react-navigation/native
npm install axios react-hook-form zustand
npm install react-native-paper
```

#### Step 2: Setup Project Structure (1 hour)
- Create folder structure
- Setup navigation
- Configure environment variables
- Setup API client with interceptors

#### Step 3: Build Authentication Screens (4 hours)
- Welcome, Register, Login, OTP screens
- Form validation
- API integration
- Token storage (AsyncStorage)

#### Step 4: Build Society Screens (6 hours)
- Home, Create Request, Request Details
- Form components
- API integration
- State management

#### Step 5: Build Contractor Screens (6 hours)
- Browse, Search, Submit Bid, My Bids
- List components
- Filters
- API integration

#### Step 6: Polish & Testing (4 hours)
- Error handling
- Loading states
- Navigation flow
- End-to-end testing

---

## 📱 MVP Feature Matrix

### Must Have (Week 1-3)
| Feature | Backend | Frontend | Priority |
|---------|---------|----------|----------|
| User Registration/Login | ✅ Done | ⏳ Todo | P0 |
| OTP Verification | ✅ Done | ⏳ Todo | P0 |
| Create Request (Society) | ✅ Done | ⏳ Todo | P0 |
| Browse Requests (Contractor) | ✅ Done | ⏳ Todo | P0 |
| Submit Bid (Contractor) | ⏳ Todo | ⏳ Todo | P0 |
| View Bids (Society) | ⏳ Todo | ⏳ Todo | P0 |
| Accept Bid (Society) | ⏳ Todo | ⏳ Todo | P0 |
| Update Status | ✅ Done | ⏳ Todo | P0 |
| Search/Filter Requests | ✅ Done | ⏳ Todo | P1 |
| Profile Management | ✅ Done | ⏳ Todo | P1 |

### Nice to Have (Post-MVP)
| Feature | Priority |
|---------|----------|
| Image Upload | P2 |
| Push Notifications | P2 |
| Rating/Review System | P2 |
| In-app Messaging | P3 |
| Payment Integration | P3 |
| Document Upload | P3 |
| Advanced Analytics | P3 |

---

## 🚀 Development Timeline

### Week 1: Complete Backend MVP
**Days 1-2:** Bidding System
- Day 1 Morning: Model, Migration, Schemas
- Day 1 Afternoon: Repository Layer
- Day 2 Morning: Service Layer
- Day 2 Afternoon: API Endpoints, Testing

**Day 3:** API Enhancement & Documentation
- Add missing features
- Complete API documentation
- Create Postman collection

**Day 4:** Backend Testing
- Test all user flows
- Fix bugs
- Performance optimization

### Week 2-3: Frontend Development
**Days 1-2:** Project Setup & Auth
- Initialize React Native project
- Setup navigation and state management
- Build authentication screens
- Integrate auth APIs

**Days 3-4:** Society Features
- Society home screen
- Create request screen
- Request details with bids
- Accept bid functionality

**Days 5-6:** Contractor Features
- Browse requests screen
- Search and filter
- Submit bid screen
- My bids and work screens

**Days 7-8:** Integration & Polish
- End-to-end testing
- Bug fixes
- UI/UX improvements
- Error handling

**Days 9-10:** MVP Testing
- User acceptance testing
- Performance testing
- Bug fixes
- Documentation

---

## 🧪 Testing Strategy

### Backend Testing (Week 1)
1. **API Testing in Swagger**
   - Test each endpoint individually
   - Test authentication flow
   - Test authorization rules
   - Test error scenarios

2. **Integration Testing**
   - Complete society flow
   - Complete contractor flow
   - Test bid acceptance workflow
   - Test status transitions

3. **Edge Cases**
   - Invalid tokens
   - Expired OTPs
   - Duplicate bids
   - Invalid status transitions

### Frontend Testing (Week 2-3)
1. **Component Testing**
   - Test forms with validation
   - Test navigation
   - Test API integration

2. **User Flow Testing**
   - Complete registration/login
   - Create request end-to-end
   - Browse and bid flow
   - Accept bid flow

3. **Device Testing**
   - Test on Android emulator
   - Test on iOS simulator (if Mac available)
   - Test on real device

---

## 📊 Success Metrics for MVP

### Functional Completeness
- ✅ User can register and login
- ✅ Society can create requests
- ✅ Contractor can browse and search requests
- ✅ Contractor can submit bids
- ✅ Society can view and accept bids
- ✅ Status workflow works correctly
- ✅ Profile management works

### Technical Quality
- ✅ All APIs respond correctly
- ✅ Authentication works securely
- ✅ Error handling is user-friendly
- ✅ App doesn't crash on normal usage
- ✅ Loading states are clear

### User Experience
- ✅ Navigation is intuitive
- ✅ Forms are easy to fill
- ✅ Feedback is immediate
- ✅ Errors are clear

---

## 🎯 Post-MVP Roadmap (Phase 2)

### Iteration 1 (Week 4-5): Enhanced Features
- [ ] Image upload for requests
- [ ] Contractor profile with portfolio
- [ ] Rating and review system
- [ ] Advanced search filters
- [ ] Request history and analytics

### Iteration 2 (Week 6-7): Communication
- [ ] In-app messaging
- [ ] Push notifications
- [ ] Email notifications
- [ ] SMS notifications for OTP

### Iteration 3 (Week 8-9): Payments
- [ ] Payment gateway integration
- [ ] Escrow system
- [ ] Invoice generation
- [ ] Payment history

### Iteration 4 (Week 10+): Advanced Features
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Document management
- [ ] Multi-language support
- [ ] Dark mode

---

## 💡 Next Immediate Actions

### Today's Tasks (December 28, 2025)

1. **Build Bidding System Backend** (4-5 hours)
   - Create Bid model
   - Generate migration
   - Build repository, service, API
   - Test in Swagger UI

2. **Plan Frontend Structure** (1 hour)
   - Finalize screen designs
   - Create component list
   - Setup development environment

3. **Initialize React Native Project** (1 hour)
   - Create project
   - Install dependencies
   - Setup folder structure

### Tomorrow's Tasks

1. **Complete Bidding API Testing** (2 hours)
2. **Build Authentication Screens** (4 hours)
3. **Start Society Screens** (2 hours)

---

## 📝 Decision Log

### Technology Choices
- **Frontend:** React Native (Expo) - Cross-platform, faster development
- **State Management:** Zustand - Simpler than Redux, sufficient for MVP
- **UI Library:** React Native Paper - Material Design, good components
- **Navigation:** React Navigation - Industry standard

### MVP Scope Decisions
- ✅ Include: Auth, Requests, Bids, Basic Profile
- ❌ Exclude: Messaging, Payments, Reviews, Images (use URLs)
- ❌ Defer: Push notifications, Advanced analytics

### Architecture Decisions
- Clean architecture on backend (maintained)
- Service layer pattern on frontend
- JWT authentication
- Stateless REST API

---

## 🎉 Summary

**MVP Goal:** Working system where societies can post work requests and contractors can bid on them.

**Timeline:** 3 weeks
- Week 1: Backend completion
- Week 2-3: Frontend development

**Current Status:**
- Backend: 98% (need bidding system)
- Frontend: 0% (starting now)

**Next Step:** Build Bidding System API (today), then start React Native frontend (today/tomorrow)

Let's get started! 🚀
