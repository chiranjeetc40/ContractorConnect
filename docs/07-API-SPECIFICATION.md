# API Specification

## Base URL

```
Development: http://localhost:8000/api/v1
Staging: https://staging-api.contractorconnect.com/api/v1
Production: https://api.contractorconnect.com/api/v1
```

## Authentication

All protected endpoints require JWT authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "timestamp": "2025-12-28T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "phone",
        "message": "Phone number is required"
      }
    ]
  },
  "timestamp": "2025-12-28T10:30:00Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalItems": 98,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Authentication Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePass123",
  "role": "SOCIETY_USER",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "otpSent": true,
    "expiresIn": 300
  },
  "message": "OTP sent to your phone"
}
```

### Verify OTP

```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 86400,
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "SOCIETY_USER"
    }
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "identifier": "john@example.com", // or phone
  "password": "SecurePass123"
}
```

### Refresh Token

```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## User Endpoints

### Get Current User

```http
GET /users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "SOCIETY_USER",
    "profilePhotoUrl": "https://...",
    "language": "en",
    "notificationEnabled": true,
    "createdAt": "2025-12-28T10:00:00Z"
  }
}
```

### Update Profile

```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "address": "123 Main St",
  "city": "Mumbai",
  "pinCode": "400001"
}
```

### Upload Profile Photo

```http
POST /users/me/photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

photo: <file>
```

### Change Password

```http
POST /users/me/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

---

## Request Endpoints

### Create Request

```http
POST /requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Building painting required",
  "buildingName": "Sunrise Apartments",
  "buildingAddress": "123 Main Street, Andheri",
  "contactPersonName": "Ramesh Kumar",
  "contactPersonPhone": "9876543210",
  "pinCode": "400053",
  "buildingAreaSqft": 5000,
  "numberOfFloors": 5,
  "workType": "PAINTING",
  "workDescription": "Complete exterior painting of building",
  "urgencyLevel": "NORMAL",
  "preferredInspectionDate": "2025-12-30",
  "additionalNotes": "Prefer eco-friendly paint"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "requestNumber": "REQ-20251228-00001",
    "status": "SUBMITTED",
    "submittedAt": "2025-12-28T10:30:00Z",
    ...
  },
  "message": "Request submitted successfully"
}
```

### Get All Requests (User)

```http
GET /requests?status=SUBMITTED&page=1&pageSize=20
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `workType` (optional): Filter by work type
- `page` (optional, default: 1): Page number
- `pageSize` (optional, default: 20): Items per page
- `sortBy` (optional): Sort field (submittedAt, updatedAt)
- `sortOrder` (optional): asc or desc

### Get All Requests (Contractor)

```http
GET /requests/all?status=SUBMITTED&workType=PAINTING&pinCode=400053
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `workType` (optional): Filter by work type
- `pinCode` (optional): Filter by location
- `urgencyLevel` (optional): Filter by urgency
- `fromDate` (optional): Date range start
- `toDate` (optional): Date range end
- `search` (optional): Search in title/description
- `page`, `pageSize`, `sortBy`, `sortOrder`

### Get Request by ID

```http
GET /requests/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "requestNumber": "REQ-20251228-00001",
    "status": "SUBMITTED",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "phone": "9876543210"
    },
    "buildingName": "Sunrise Apartments",
    "workType": "PAINTING",
    "photos": [
      {
        "id": "uuid",
        "url": "https://...",
        "uploadedAt": "2025-12-28T10:30:00Z"
      }
    ],
    "timeline": [
      {
        "status": "SUBMITTED",
        "timestamp": "2025-12-28T10:30:00Z"
      }
    ],
    ...
  }
}
```

### Update Request

```http
PUT /requests/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "workDescription": "Updated description",
  "additionalNotes": "Updated notes"
}
```

**Note:** Only allowed before contractor reviews

### Mark Request as Reviewed

```http
POST /requests/:id/mark-reviewed
Authorization: Bearer <token>
```

### Cancel Request

```http
POST /requests/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "No longer needed"
}
```

**Note:** Only within 24 hours of submission

### Upload Request Photos

```http
POST /requests/:id/photos
Authorization: Bearer <token>
Content-Type: multipart/form-data

photos[]: <file1>
photos[]: <file2>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadedPhotos": [
      {
        "id": "uuid",
        "url": "https://...",
        "fileName": "photo1.jpg"
      }
    ]
  }
}
```

### Get Request Timeline

```http
GET /requests/:id/timeline
Authorization: Bearer <token>
```

---

## Analytics Endpoints

### Get Dashboard Statistics

```http
GET /analytics/dashboard?period=today
Authorization: Bearer <token>
```

**Query Parameters:**
- `period`: today, week, month, year, custom
- `fromDate`: For custom period
- `toDate`: For custom period

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRequests": 125,
    "newRequests": 15,
    "underReview": 20,
    "completed": 85,
    "byWorkType": {
      "PAINTING": 40,
      "PLUMBING": 30,
      "ELECTRICAL": 25,
      "OTHER": 30
    },
    "byUrgency": {
      "NORMAL": 100,
      "URGENT": 20,
      "EMERGENCY": 5
    },
    "averageResponseTime": "2.5 hours",
    "conversionRate": 0.68
  }
}
```

### Get Requests by Status

```http
GET /analytics/requests-by-status?fromDate=2025-12-01&toDate=2025-12-28
Authorization: Bearer <token>
```

### Export Report

```http
GET /analytics/export?format=pdf&period=month
Authorization: Bearer <token>
```

**Query Parameters:**
- `format`: pdf or excel
- `period`: today, week, month, year, custom
- `fromDate`, `toDate`: For custom period

**Response:** File download

---

## Notification Endpoints

### Get All Notifications

```http
GET /notifications?page=1&pageSize=20&unreadOnly=false
Authorization: Bearer <token>
```

**Query Parameters:**
- `unreadOnly` (optional, default: false): Show only unread
- `type` (optional): Filter by notification type
- `page`, `pageSize`

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "type": "REQUEST_CREATED",
        "title": "New Request",
        "message": "You have a new repair request",
        "isRead": false,
        "createdAt": "2025-12-28T10:30:00Z",
        "actionUrl": "/requests/uuid"
      }
    ],
    "pagination": {...}
  }
}
```

### Mark Notification as Read

```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read

```http
PUT /notifications/read-all
Authorization: Bearer <token>
```

### Get Unread Count

```http
GET /notifications/unread-count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### Update Notification Preferences

```http
PUT /notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "pushEnabled": true,
  "emailEnabled": true,
  "types": {
    "REQUEST_CREATED": true,
    "REQUEST_UPDATED": true,
    "QUOTATION_RECEIVED": false
  }
}
```

---

## File Upload Endpoints

### Upload File

```http
POST /upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
type: "REQUEST_PHOTO" | "PROFILE_PHOTO" | "DOCUMENT"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://storage.../file.jpg",
    "fileName": "file.jpg",
    "fileSize": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

---

## WebSocket Endpoints (Real-time Updates)

### Connect

```
wss://api.contractorconnect.com/ws?token=<access_token>
```

### Message Format

**Subscribe to updates:**
```json
{
  "type": "SUBSCRIBE",
  "channels": ["requests", "notifications"]
}
```

**Receive update:**
```json
{
  "type": "REQUEST_UPDATED",
  "data": {
    "requestId": "uuid",
    "status": "UNDER_REVIEW",
    "updatedAt": "2025-12-28T10:30:00Z"
  }
}
```

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **General API**: 100 requests per minute
- **File uploads**: 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640693400
```

---

## API Versioning

API version is included in the URL path:
- Current: `/api/v1/`
- When v2 is released: `/api/v2/`

Old versions will be supported for 6 months after new version release.

---

## Postman Collection

A complete Postman collection is available at:
```
docs/postman/ContractorConnect-API.postman_collection.json
```

---

*Last Updated: December 28, 2025*
