# Requirements Specification

## Functional Requirements

### 1. User Management

#### 1.1 Registration & Authentication
- **REQ-001**: Users must be able to register using phone number
- **REQ-002**: System must send OTP for phone verification
- **REQ-003**: OTP must expire after 5 minutes
- **REQ-004**: Users can resend OTP after 30 seconds
- **REQ-005**: Registration requires: name, phone, email, role selection
- **REQ-006**: No admin approval required for registration
- **REQ-007**: Password must be minimum 8 characters with complexity rules
- **REQ-008**: User can login with phone number or email
- **REQ-009**: Forgot password functionality via OTP
- **REQ-010**: Session management with auto-logout after 30 days inactivity

#### 1.2 Profile Management
- **REQ-011**: Users can view and edit profile information
- **REQ-012**: Profile includes: name, phone, email, address, role
- **REQ-013**: Profile photo upload (optional)
- **REQ-014**: Change password functionality
- **REQ-015**: Language preference selection (English/Marathi)

### 2. Request Management (Society/Owner Side)

#### 2.1 Request Creation
- **REQ-016**: User can create new repair/construction request
- **REQ-017**: Request form must include:
  - Building/Society name
  - Address (with pin code)
  - Contact person name and phone
  - Building area (in sq. ft.)
  - Number of floors
  - Type of work (dropdown: Painting, Plumbing, Electrical, Structural, Waterproofing, General Repair, Other)
  - Work description (text area)
  - Urgency level (Normal, Urgent, Emergency)
  - Preferred visit date for inspection
  - Photos (multiple upload, optional)
- **REQ-018**: All mandatory fields must be validated before submission
- **REQ-019**: Form data must be saved locally while offline
- **REQ-020**: Request must auto-sync when connection is restored
- **REQ-021**: User receives confirmation after successful submission
- **REQ-022**: Unique request ID generated for each submission

#### 2.2 Request Tracking
- **REQ-023**: User can view list of all their requests
- **REQ-024**: Request list shows: ID, date, status, type of work
- **REQ-025**: User can view detailed request information
- **REQ-026**: Request status includes:
  - Submitted (pending review)
  - Under Review (Phase 2)
  - Inspection Scheduled (Phase 2)
  - Quotation Received (Phase 2)
  - Accepted/Rejected (Phase 2)
  - Work in Progress (Phase 3)
  - Completed (Phase 3)
- **REQ-027**: User can edit request before contractor reviews it
- **REQ-028**: User can cancel request within 24 hours
- **REQ-029**: Request history maintained with timestamps

### 3. Contractor/Admin Management

#### 3.1 Request Dashboard
- **REQ-030**: Contractor can view all incoming requests
- **REQ-031**: Dashboard shows request count by status
- **REQ-032**: Requests can be filtered by:
  - Status
  - Date range
  - Work type
  - Location (pin code)
  - Urgency level
- **REQ-033**: Requests can be sorted by date, urgency
- **REQ-034**: Contractor can search requests by ID or keywords

#### 3.2 Request Details
- **REQ-035**: Contractor can view complete request details
- **REQ-036**: Contractor can view contact information
- **REQ-037**: Contractor can view uploaded photos
- **REQ-038**: Contractor can mark request as "Reviewed"
- **REQ-039**: Request location shown on map (Phase 2)

#### 3.3 Analytics & Reports
- **REQ-040**: Dashboard shows:
  - Total requests (today, week, month)
  - Requests by status
  - Requests by work type
  - Response time analytics
- **REQ-041**: Export reports to PDF/Excel (Phase 2)
- **REQ-042**: Filter analytics by date range
- **REQ-043**: Visual charts for data representation

### 4. Notification System

#### 4.1 Push Notifications
- **REQ-044**: Contractor receives push notification on new request
- **REQ-045**: User receives notification on status change
- **REQ-046**: Notifications work when app is in background
- **REQ-047**: Notification history maintained in-app
- **REQ-048**: Users can enable/disable notifications

#### 4.2 Email Notifications
- **REQ-049**: Email sent to contractor on new request
- **REQ-050**: Email sent to user on request confirmation
- **REQ-051**: Email templates in user's preferred language
- **REQ-052**: Email includes request summary and link

### 5. Offline Functionality

- **REQ-053**: App must work without internet connection
- **REQ-054**: User can create requests offline
- **REQ-055**: Offline data stored locally
- **REQ-056**: Subtle indicator showing offline status
- **REQ-057**: Auto-sync when connection restored
- **REQ-058**: Sync status shown to user
- **REQ-059**: Conflict resolution for sync issues
- **REQ-060**: Critical actions queue for sync priority

### 6. Localization

- **REQ-061**: App supports English and Marathi
- **REQ-062**: Language selection during registration
- **REQ-063**: Language can be changed in settings
- **REQ-064**: All UI elements translated
- **REQ-065**: Date/time formats localized
- **REQ-066**: Number formats localized (Indian system)

## Non-Functional Requirements

### 1. Performance
- **NFR-001**: App launch time < 3 seconds
- **NFR-002**: API response time < 2 seconds (95th percentile)
- **NFR-003**: Image upload < 5 seconds per image
- **NFR-004**: Support up to 10 images per request (max 5MB each)
- **NFR-005**: Smooth scrolling for lists (60 FPS)
- **NFR-006**: App size < 50 MB

### 2. Security
- **NFR-007**: All API calls over HTTPS
- **NFR-008**: JWT tokens with 24-hour expiry
- **NFR-009**: Refresh token mechanism implemented
- **NFR-010**: Passwords hashed using bcrypt
- **NFR-011**: OTP stored encrypted
- **NFR-012**: Role-based access control (RBAC)
- **NFR-013**: Input validation on client and server
- **NFR-014**: SQL injection prevention
- **NFR-015**: XSS protection implemented

### 3. Reliability
- **NFR-016**: App crash rate < 0.1%
- **NFR-017**: 99.9% API uptime
- **NFR-018**: Data backup daily
- **NFR-019**: Graceful error handling with user-friendly messages
- **NFR-020**: Automatic retry for failed requests

### 4. Usability
- **NFR-021**: Maximum 3 clicks to reach any feature
- **NFR-022**: Consistent UI/UX across all screens
- **NFR-023**: Accessibility features (font scaling, contrast)
- **NFR-024**: Helpful error messages
- **NFR-025**: Onboarding tutorial for first-time users

### 5. Scalability
- **NFR-026**: Support 10,000 concurrent users
- **NFR-027**: Database optimized for 1M+ records
- **NFR-028**: Horizontal scaling capability
- **NFR-029**: CDN for static assets
- **NFR-030**: Efficient pagination for large lists

### 6. Compatibility
- **NFR-031**: Android 8.0 (API level 26) and above
- **NFR-032**: Support various screen sizes (phones, tablets)
- **NFR-033**: Work on low-end devices (2GB RAM)
- **NFR-034**: Support both portrait and landscape modes

### 7. Maintainability
- **NFR-035**: Modular architecture for easy updates
- **NFR-036**: Comprehensive logging
- **NFR-037**: Code coverage > 80%
- **NFR-038**: API versioning implemented
- **NFR-039**: Database migrations support

## Business Rules

- **BR-001**: One user can have only one role at a time
- **BR-002**: Request cannot be deleted, only cancelled
- **BR-003**: Request ID format: REQ-YYYYMMDD-XXXXX
- **BR-004**: OTP valid for 5 minutes only
- **BR-005**: Maximum 3 OTP attempts per hour
- **BR-006**: Payment of ₹500 mandatory before quotation access (Phase 2)
- **BR-007**: Offline data syncs in FIFO order
- **BR-008**: Users can have maximum 5 active requests at a time
- **BR-009**: Request auto-expires after 30 days if no action
- **BR-010**: Contractor must respond within 48 hours

## Constraints

- **CON-001**: Payment gateway: Paytm only
- **CON-002**: File upload: Images only (JPG, PNG, HEIC)
- **CON-003**: Initial platform: Android only
- **CON-004**: Backend language: Python only
- **CON-005**: Supported languages: English and Marathi only (Phase 1)

## Assumptions

- **ASM-001**: Users have smartphone with camera
- **ASM-002**: Users have valid phone number and email
- **ASM-003**: Internet connectivity available for initial setup
- **ASM-004**: Users understand basic smartphone operations
- **ASM-005**: Contractors have consistent internet access

---
*Last Updated: December 28, 2025*
