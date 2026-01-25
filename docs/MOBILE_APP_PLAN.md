# React Native Mobile App - Complete Implementation Plan

**Date:** December 28, 2025  
**Project:** ContractorConnect Mobile App  
**Framework:** React Native (Expo)  
**Timeline:** 2-3 weeks for MVP

---

## 🎯 Technology Stack (Best Practices)

### Core Framework
- **React Native 0.73+** with **Expo SDK 50+**
  - Reason: Faster development, easy updates, excellent tooling
  - Expo Go for testing, can eject if needed

### Navigation
- **React Navigation v6** (Industry standard)
  - Stack Navigator for screen transitions
  - Bottom Tab Navigator for main sections
  - Drawer Navigator for menu (optional)

### State Management
- **Zustand** (Modern, lightweight)
  - Reason: Simpler than Redux, better than Context API
  - Perfect for small-to-medium apps
  - TypeScript support

### API & Data Fetching
- **Axios** with custom hooks
- **TanStack Query (React Query)** for caching
  - Automatic background refetching
  - Optimistic updates
  - Cache management

### Form Management
- **React Hook Form** (Best performance)
  - Minimal re-renders
  - Built-in validation
  - Easy integration with UI libraries

### UI Library
- **React Native Paper** (Material Design)
  - Consistent design system
  - Accessibility built-in
  - Theming support
  - Production-ready components

### Additional Libraries
- **React Native Async Storage** - Local persistence
- **Expo SecureStore** - Secure token storage
- **React Native Reanimated** - Smooth animations
- **React Native Gesture Handler** - Better touch handling
- **Expo Image Picker** - Upload images
- **Expo Location** - Get user location
- **date-fns** - Date formatting
- **Zod** - Runtime validation (complements TypeScript)

### Development Tools
- **TypeScript** - Type safety
- **ESLint + Prettier** - Code quality
- **Expo Dev Tools** - Debugging
- **Flipper** (optional) - Advanced debugging

---

## 📁 Project Structure (Best Practice)

```
mobile/
├── src/
│   ├── api/                    # API integration
│   │   ├── client.ts           # Axios instance with interceptors
│   │   ├── auth.api.ts         # Auth endpoints
│   │   ├── request.api.ts      # Request endpoints
│   │   ├── bid.api.ts          # Bid endpoints
│   │   └── user.api.ts         # User endpoints
│   │
│   ├── components/             # Reusable components
│   │   ├── common/             # Generic components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── auth/               # Auth-specific
│   │   │   ├── OTPInput.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── request/            # Request components
│   │   │   ├── RequestCard.tsx
│   │   │   ├── RequestFilters.tsx
│   │   │   └── RequestForm.tsx
│   │   └── bid/                # Bid components
│   │       ├── BidCard.tsx
│   │       ├── BidForm.tsx
│   │       └── BidStatistics.tsx
│   │
│   ├── screens/                # All app screens
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── OTPScreen.tsx
│   │   ├── society/
│   │   │   ├── SocietyHomeScreen.tsx
│   │   │   ├── CreateRequestScreen.tsx
│   │   │   ├── RequestDetailsScreen.tsx
│   │   │   └── BidListScreen.tsx
│   │   ├── contractor/
│   │   │   ├── ContractorHomeScreen.tsx
│   │   │   ├── BrowseRequestsScreen.tsx
│   │   │   ├── SubmitBidScreen.tsx
│   │   │   └── MyBidsScreen.tsx
│   │   └── shared/
│   │       ├── ProfileScreen.tsx
│   │       └── SettingsScreen.tsx
│   │
│   ├── navigation/             # Navigation setup
│   │   ├── RootNavigator.tsx   # Main navigator
│   │   ├── AuthNavigator.tsx   # Auth flow
│   │   ├── SocietyNavigator.tsx
│   │   ├── ContractorNavigator.tsx
│   │   └── types.ts            # Navigation types
│   │
│   ├── store/                  # Zustand state management
│   │   ├── authStore.ts        # Auth state
│   │   ├── requestStore.ts     # Request state
│   │   ├── bidStore.ts         # Bid state
│   │   └── uiStore.ts          # UI state (loading, errors)
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts          # Auth operations
│   │   ├── useRequests.ts      # Request operations
│   │   ├── useBids.ts          # Bid operations
│   │   ├── useForm.ts          # Form utilities
│   │   └── useDebounce.ts      # Utility hooks
│   │
│   ├── utils/                  # Utilities
│   │   ├── validation.ts       # Validation schemas
│   │   ├── formatting.ts       # Formatters
│   │   ├── constants.ts        # App constants
│   │   └── helpers.ts          # Helper functions
│   │
│   ├── types/                  # TypeScript types
│   │   ├── api.types.ts        # API response types
│   │   ├── models.types.ts     # Data models
│   │   └── navigation.types.ts # Navigation types
│   │
│   ├── theme/                  # Theming
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── theme.ts            # Combined theme
│   │
│   └── config/                 # Configuration
│       ├── api.config.ts       # API URLs
│       └── app.config.ts       # App settings
│
├── assets/                     # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── App.tsx                     # App entry point
├── app.json                    # Expo config
├── package.json
├── tsconfig.json              # TypeScript config
├── .eslintrc.js               # ESLint config
├── .prettierrc                # Prettier config
└── README.md
```

---

## 🎨 Design System

### Color Palette (Modern & Professional)

```typescript
const colors = {
  // Primary (Blue - Trust, Professional)
  primary: {
    main: '#2196F3',      // Material Blue 500
    light: '#64B5F6',     // Blue 300
    dark: '#1976D2',      // Blue 700
    contrast: '#FFFFFF'
  },
  
  // Secondary (Orange - Action, Energy)
  secondary: {
    main: '#FF9800',      // Orange 500
    light: '#FFB74D',     // Orange 300
    dark: '#F57C00',      // Orange 700
    contrast: '#FFFFFF'
  },
  
  // Success, Error, Warning
  success: '#4CAF50',     // Green
  error: '#F44336',       // Red
  warning: '#FFC107',     // Amber
  info: '#2196F3',        // Blue
  
  // Backgrounds
  background: {
    default: '#F5F5F5',   // Light grey
    paper: '#FFFFFF',     // White
    dark: '#121212'       // Dark mode
  },
  
  // Text
  text: {
    primary: '#212121',   // Almost black
    secondary: '#757575', // Grey
    disabled: '#BDBDBD',  // Light grey
    hint: '#9E9E9E'
  },
  
  // Status colors
  status: {
    open: '#4CAF50',      // Green
    inProgress: '#2196F3', // Blue
    completed: '#9C27B0',  // Purple
    cancelled: '#F44336',  // Red
    onHold: '#FF9800'      // Orange
  }
};
```

### Typography

```typescript
const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 28, fontWeight: 'bold' },
  h3: { fontSize: 24, fontWeight: '600' },
  h4: { fontSize: 20, fontWeight: '600' },
  h5: { fontSize: 18, fontWeight: '600' },
  h6: { fontSize: 16, fontWeight: '600' },
  subtitle1: { fontSize: 16, fontWeight: '400' },
  subtitle2: { fontSize: 14, fontWeight: '500' },
  body1: { fontSize: 16, fontWeight: '400' },
  body2: { fontSize: 14, fontWeight: '400' },
  button: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
  caption: { fontSize: 12, fontWeight: '400' },
  overline: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase' }
};
```

### Spacing System (8pt grid)

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};
```

---

## 📱 Screen Designs (Wireframes)

### 1. Authentication Flow

#### Welcome Screen
```
┌─────────────────────────────────┐
│                                 │
│        [App Logo/Icon]          │
│                                 │
│      ContractorConnect          │
│   Find & Hire Local Contractors│
│                                 │
│   [Illustration/Image]          │
│                                 │
│   ┌─────────────────────────┐   │
│   │  Register               │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │  Login                  │   │
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

#### Register Screen
```
┌─────────────────────────────────┐
│  ← Back        Register          │
├─────────────────────────────────┤
│                                 │
│  Full Name                      │
│  ┌─────────────────────────────┐│
│  │ Enter your name            ││
│  └─────────────────────────────┘│
│                                 │
│  Phone Number                   │
│  ┌─────────────────────────────┐│
│  │ +91 98765 43210           ││
│  └─────────────────────────────┘│
│                                 │
│  Email (Optional)               │
│  ┌─────────────────────────────┐│
│  │ your@email.com            ││
│  └─────────────────────────────┘│
│                                 │
│  Password                       │
│  ┌─────────────────────────────┐│
│  │ ••••••••    👁            ││
│  └─────────────────────────────┘│
│                                 │
│  I am a:                        │
│  ○ Building Society             │
│  ○ Contractor                   │
│                                 │
│  ┌─────────────────────────────┐│
│  │     Create Account          ││
│  └─────────────────────────────┘│
│                                 │
│  Already have account? Login   │
└─────────────────────────────────┘
```

#### OTP Verification Screen
```
┌─────────────────────────────────┐
│  ← Back    Verify OTP            │
├─────────────────────────────────┤
│                                 │
│         [Lock Icon]             │
│                                 │
│  Enter the 6-digit code sent to│
│      +91 98765 43210            │
│                                 │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 ││
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│
│                                 │
│  Didn't receive code?           │
│  Resend in 00:45               │
│                                 │
│  ┌─────────────────────────────┐│
│  │       Verify               ││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

### 2. Society Flow

#### Society Home (Tab Navigation)
```
┌─────────────────────────────────┐
│  ☰  My Requests    🔔 [Search]  │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │ Plumbing Work               ││
│  │ Status: Open • 3 bids       ││
│  │ Budget: ₹5,000 - ₹10,000   ││
│  │ Posted: 2 hours ago         ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ Electrical Repair           ││
│  │ Status: In Progress         ││
│  │ Contractor: John Doe        ││
│  │ Started: 1 day ago          ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ Painting Work               ││
│  │ Status: Completed ✓         ││
│  │ Completed: 3 days ago       ││
│  └─────────────────────────────┘│
│                                 │
│         [Empty State]           │
│  No requests yet? Create one!   │
│                                 │
├─────────────────────────────────┤
│  [+]    Requests   Bids  Profile│
└─────────────────────────────────┘
```

#### Create Request Screen
```
┌─────────────────────────────────┐
│  ← Back    Create Request        │
├─────────────────────────────────┤
│                                 │
│  Title *                        │
│  ┌─────────────────────────────┐│
│  │ Kitchen plumbing repair    ││
│  └─────────────────────────────┘│
│                                 │
│  Category *                     │
│  ┌─────────────────────────────┐│
│  │ Plumbing            ▼      ││
│  └─────────────────────────────┘│
│                                 │
│  Description *                  │
│  ┌─────────────────────────────┐│
│  │ Leaking sink under kitchen ││
│  │ needs immediate repair...   ││
│  │                             ││
│  └─────────────────────────────┘│
│                                 │
│  Location *                     │
│  ┌─────────────────────────────┐│
│  │ Address                     ││
│  │ City, State, Pincode        ││
│  └─────────────────────────────┘│
│                                 │
│                                  │
│                                 │
│  ┌─────────────────────────────┐│
│  │    Post Request            ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

#### Request Details with Bids
```
┌─────────────────────────────────┐
│  ← Back    Request Details   ⋮  │
├─────────────────────────────────┤
│                                 │
│  Kitchen Plumbing Repair        │
│  Status: Open • Posted 2h ago   │
│                                 │
│  Category: Plumbing             │
│  Budget: ₹5,000 - ₹10,000      │
│  Location: Mumbai, Maharashtra  │
│                                 │
│  Description:                   │
│  Leaking sink under kitchen...  │
│                                 │
├─────────────────────────────────┤
│  Bids (3)                       │
│  ┌─────────────────────────────┐│
│  │ 👤 John Plumber             ││
│  │ Amount: ₹7,500              ││
│  │ Rating: ⭐ 4.8 (25 reviews)  ││
│  │ "I have 10 years exp..."    ││
│  │                             ││
│  │ [View Details] [Accept Bid] ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 👤 Mike Contractor          ││
│  │ Amount: ₹8,200              ││
│  │ Rating: ⭐ 4.5 (18 reviews)  ││
│  │ "Quick service guaranteed..."││
│  │                             ││
│  │ [View Details] [Accept Bid] ││
│  └─────────────────────────────┘│
│                                 │
│  Statistics:                    │
│  Avg Bid: ₹7,800 • Low: ₹7,000││
└─────────────────────────────────┘
```

### 3. Contractor Flow

#### Contractor Home (Browse)
```
┌─────────────────────────────────┐
│  ☰  Browse Work    🔔 [Search]  │
├─────────────────────────────────┤
│  Filters: [Category ▼] [City ▼]│
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │ Plumbing Work               ││
│  │ Budget: ₹5K-₹10K • Mumbai  ││
│  │ Posted: 2 hours ago         ││
│  │ [View Details]              ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ Electrical Repair           ││
│  │ Budget: ₹8K-₹15K • Pune    ││
│  │ Posted: 5 hours ago         ││
│  │ [View Details]              ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ Painting Work               ││
│  │ Budget: ₹20K-₹30K • Mumbai ││
│  │ Posted: 1 day ago           ││
│  │ [View Details]              ││
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  Browse   My Bids   Work  Profile│
└─────────────────────────────────┘
```

#### Submit Bid Screen
```
┌─────────────────────────────────┐
│  ← Back    Submit Bid            │
├─────────────────────────────────┤
│                                 │
│  Request: Kitchen Plumbing      │
│  Society: ABC Housing Society   │
│                                 │
│  Your Bid Amount *              │
│  ┌─────────────────────────────┐│
│  │ ₹ 7,500                    ││
│  └─────────────────────────────┘│
│  Recommended: ₹7,800 (Avg)     │
│                                 │
│  Work Proposal *                │
│  ┌─────────────────────────────┐│
│  │ I have 10 years of         ││
│  │ experience in plumbing...   ││
│  │                             ││
│  │ (Min 50 characters)         ││
│  └─────────────────────────────┘│
│                                 │
│  Estimated Timeline             │
│  ┌─────────────────────────────┐│
│  │ 2 days                      ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │      Submit Bid            ││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

#### My Bids Screen
```
┌─────────────────────────────────┐
│  ☰  My Bids         [Filter ▼]  │
├─────────────────────────────────┤
│  Tabs: [Pending] [Accepted] [All]│
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🟡 Pending                  ││
│  │ Kitchen Plumbing            ││
│  │ Your Bid: ₹7,500            ││
│  │ Submitted: 2 hours ago      ││
│  │ [View] [Edit] [Withdraw]    ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🟢 Accepted                 ││
│  │ Electrical Work             ││
│  │ Your Bid: ₹12,000           ││
│  │ Status: In Progress         ││
│  │ [View Details]              ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🔴 Rejected                 ││
│  │ Painting Work               ││
│  │ Your Bid: ₹25,000           ││
│  │ Reason: Higher bid accepted ││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

---

## 🔧 Implementation Steps

### Phase 1: Setup (Day 1)

#### Step 1.1: Initialize Expo Project
```bash
npx create-expo-app@latest ContractorConnectMobile --template blank-typescript
cd ContractorConnectMobile
```

#### Step 1.2: Install Core Dependencies
```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs

# Expo dependencies
npx expo install react-native-screens react-native-safe-area-context

# UI Library
npm install react-native-paper react-native-vector-icons
npm install --save-dev @types/react-native-vector-icons

# State Management
npm install zustand

# API & Data Fetching
npm install axios @tanstack/react-query

# Forms
npm install react-hook-form zod @hookform/resolvers

# Storage
npx expo install expo-secure-store @react-native-async-storage/async-storage

# Utilities
npm install date-fns

# Animations (optional)
npx expo install react-native-reanimated react-native-gesture-handler
```

#### Step 1.3: Project Structure Setup
Create all folders and base files

#### Step 1.4: Configuration Files
- TypeScript config
- ESLint config
- Prettier config
- API config

### Phase 2: Core Infrastructure (Day 1-2)

#### Step 2.1: Theme Setup
- Define colors, typography, spacing
- Create theme provider
- Setup React Native Paper theme

#### Step 2.2: API Client
- Axios instance with interceptors
- Request/response interceptors
- Error handling
- Token management

#### Step 2.3: State Management
- Auth store (user, tokens, isAuthenticated)
- UI store (loading, errors, notifications)
- Request store
- Bid store

#### Step 2.4: Navigation Setup
- Root navigator with auth flow
- Auth stack (Welcome, Register, Login, OTP)
- Society tab navigator
- Contractor tab navigator

### Phase 3: Authentication (Day 2)

#### Step 3.1: Auth API Integration
- Register endpoint
- Login endpoint
- Verify OTP endpoint
- Token refresh logic

#### Step 3.2: Auth Screens
- Welcome screen with branding
- Register form with validation
- Login form
- OTP input with auto-focus and resend

#### Step 3.3: Protected Routes
- Auth state persistence
- Automatic logout on token expiry
- Route guards

### Phase 4: Society Features (Day 3-4)

#### Step 4.1: Request Management
- Create request form (multi-step?)
- Request list with filters
- Request details view
- Edit/delete request

#### Step 4.2: Bid Management (Society Side)
- View bids for request
- Bid statistics display
- Accept bid with confirmation
- Contractor profile view

#### Step 4.3: Dashboard
- Overview cards (active, completed, pending bids)
- Recent activity
- Quick actions

### Phase 5: Contractor Features (Day 5-6)

#### Step 5.1: Browse & Search
- Request list with filters
- Category filter
- Location filter
- Search functionality
- Pagination/infinite scroll

#### Step 5.2: Bid Submission
- Submit bid form
- Proposal editor with character count
- Bid amount calculator
- Timeline estimation

#### Step 5.3: Bid Management (Contractor Side)
- My bids list (pending, accepted, rejected)
- Bid details
- Edit pending bid
- Withdraw bid

#### Step 5.4: Assigned Work
- View assigned requests
- Update work status
- Work history

### Phase 6: Shared Features (Day 7)

#### Step 6.1: Profile Management
- View profile
- Edit profile form
- Change password
- Profile photo upload

#### Step 6.2: Settings
- App preferences
- Notifications settings
- About app
- Logout

### Phase 7: Polish & Testing (Day 8)

#### Step 7.1: Error Handling
- Global error boundary
- API error handling
- Form validation errors
- Network error handling

#### Step 7.2: Loading States
- Skeleton loaders
- Pull to refresh
- Loading indicators
- Optimistic updates

#### Step 7.3: Empty States
- No data illustrations
- Helpful messages
- Call-to-action buttons

#### Step 7.4: Animations
- Screen transitions
- Button feedback
- Card animations
- Skeleton shimmer

---

## 📋 Component Library

### Common Components to Build

1. **Button** - Primary, Secondary, Outlined, Text
2. **Input** - Text, Password, Phone, Email
3. **Card** - Generic card with variants
4. **Chip** - Status chips, filter chips
5. **Badge** - Notification badges
6. **Avatar** - User avatars
7. **Loading** - Full screen, inline, skeleton
8. **EmptyState** - No data states
9. **ErrorBoundary** - Error handling
10. **BottomSheet** - Modal bottom sheets
11. **SearchBar** - Search input with filters
12. **DatePicker** - Date selection
13. **Dropdown** - Select dropdown
14. **ImagePicker** - Photo upload
15. **LocationPicker** - Location selection

---

## 🎯 Best Practices to Follow

### Code Quality
1. **TypeScript** - Strict mode enabled
2. **ESLint** - Airbnb config with custom rules
3. **Prettier** - Auto-formatting
4. **Husky** - Pre-commit hooks (optional)
5. **Folder Structure** - Feature-based organization

### Performance
1. **React.memo** - Prevent unnecessary re-renders
2. **useMemo/useCallback** - Memoize expensive operations
3. **FlatList** - For large lists (not ScrollView)
4. **Image optimization** - Proper sizing and caching
5. **Code splitting** - Lazy load heavy screens

### Security
1. **Secure Storage** - Store tokens securely
2. **API Key Protection** - Environment variables
3. **Input Validation** - Both client and server side
4. **HTTPS Only** - Secure communication
5. **No Sensitive Logs** - Clean logging

### User Experience
1. **Loading States** - Always show progress
2. **Error Messages** - Clear and actionable
3. **Offline Support** - Basic offline handling
4. **Haptic Feedback** - Touch feedback
5. **Accessibility** - Screen reader support

### Testing (Optional for MVP)
1. **Unit Tests** - Jest for business logic
2. **Component Tests** - React Testing Library
3. **E2E Tests** - Detox (post-MVP)

---

## 🚀 Getting Started Commands

```bash
# Create project
npx create-expo-app@latest ContractorConnectMobile --template blank-typescript

# Navigate to project
cd ContractorConnectMobile

# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios

# Run on web
npm run web
```

---

## 📱 Testing Strategy

### Manual Testing
1. Test on Android emulator
2. Test on iOS simulator (if Mac available)
3. Test on real device (Expo Go app)
4. Test all user flows
5. Test error scenarios

### Automated Testing (Post-MVP)
1. Unit tests for utilities
2. Component tests
3. Integration tests
4. E2E tests

---

## 🎉 Deliverables

At the end of development, you'll have:

1. ✅ Fully functional React Native mobile app
2. ✅ Clean, maintainable TypeScript codebase
3. ✅ Professional UI with Material Design
4. ✅ Complete authentication flow
5. ✅ Society features (post requests, manage bids)
6. ✅ Contractor features (browse, bid, work management)
7. ✅ Profile management
8. ✅ Error handling and loading states
9. ✅ Responsive design
10. ✅ Production-ready app

---

**Ready to start building! Let's create a modern, professional mobile app! 🚀**

Shall we begin with Phase 1: Project Setup?
