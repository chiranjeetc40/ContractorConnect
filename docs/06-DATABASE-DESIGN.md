# Database Design

## Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    Users     │         │   Requests   │         │  Quotations  │
│──────────────│         │──────────────│         │──────────────│
│ PK id        │1      * │ PK id        │1      * │ PK id        │
│    name      │◄────────│ FK user_id   │◄────────│ FK request_id│
│    email     │         │ FK contractor│         │ FK contractor│
│    phone     │         │    _id       │         │    _id       │
│    password  │         │    title     │         │    amount    │
│    role      │         │    status    │         │    details   │
│    created_at│         │    work_type │         │    created_at│
└──────┬───────┘         │    ...       │         └──────────────┘
       │                 └──────┬───────┘
       │                        │
       │                        │
       │                 ┌──────┴───────┐
       │                 │              │
       │            ┌────▼────┐   ┌────▼────┐
       │            │ Request │   │ Request │
       │            │ Photos  │   │Timeline │
       │            │─────────│   │─────────│
       │            │ PK id   │   │ PK id   │
       │            │ FK req_id│  │ FK req_id│
       │            │    url   │   │ status  │
       │            └─────────┘   │ timestamp│
       │                          └─────────┘
       │
       │         ┌──────────────┐
       └────────►│Notifications │
                 │──────────────│
                 │ PK id        │
                 │ FK user_id   │
                 │    type      │
                 │    title     │
                 │    message   │
                 │    read      │
                 │    created_at│
                 └──────────────┘
```

## Table Schemas

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SOCIETY_USER', 'CONTRACTOR', 'ADMIN', 'ENGINEER', 'SUPER_ADMIN')),
    
    -- Profile information
    profile_photo_url TEXT,
    company_name VARCHAR(255), -- For contractors
    gst_number VARCHAR(20), -- For contractors
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pin_code VARCHAR(10),
    
    -- Preferences
    language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'mr')),
    notification_enabled BOOLEAN DEFAULT TRUE,
    email_notification_enabled BOOLEAN DEFAULT TRUE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_users_email (email),
    INDEX idx_users_phone (phone),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
);
```

### Requests Table

```sql
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL, -- REQ-YYYYMMDD-XXXXX
    
    -- Foreign keys
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contractor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_engineer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Request details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (
        status IN (
            'SUBMITTED', 'UNDER_REVIEW', 'INSPECTION_SCHEDULED',
            'QUOTATION_SENT', 'ACCEPTED', 'REJECTED', 'PAYMENT_PENDING',
            'PAID', 'WORK_IN_PROGRESS', 'COMPLETED', 'CANCELLED'
        )
    ),
    
    -- Building information
    building_name VARCHAR(255) NOT NULL,
    building_address TEXT NOT NULL,
    contact_person_name VARCHAR(255) NOT NULL,
    contact_person_phone VARCHAR(15) NOT NULL,
    pin_code VARCHAR(10) NOT NULL,
    
    -- Work specifications
    building_area_sqft DECIMAL(10, 2) NOT NULL,
    number_of_floors INTEGER NOT NULL,
    work_type VARCHAR(100) NOT NULL CHECK (
        work_type IN (
            'PAINTING', 'PLUMBING', 'ELECTRICAL', 'STRUCTURAL',
            'WATERPROOFING', 'GENERAL_REPAIR', 'RENOVATION', 'OTHER'
        )
    ),
    work_description TEXT NOT NULL,
    
    -- Additional details
    urgency_level VARCHAR(20) DEFAULT 'NORMAL' CHECK (
        urgency_level IN ('NORMAL', 'URGENT', 'EMERGENCY')
    ),
    preferred_inspection_date DATE,
    additional_notes TEXT,
    
    -- Payment (Phase 2)
    payment_amount DECIMAL(10, 2) DEFAULT 500.00,
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (
        payment_status IN ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED')
    ),
    payment_transaction_id VARCHAR(100),
    payment_date TIMESTAMP,
    
    -- Sync metadata
    is_synced BOOLEAN DEFAULT FALSE,
    sync_attempts INTEGER DEFAULT 0,
    last_sync_attempt TIMESTAMP,
    
    -- Timestamps
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_requests_user_id (user_id),
    INDEX idx_requests_contractor_id (contractor_id),
    INDEX idx_requests_status (status),
    INDEX idx_requests_work_type (work_type),
    INDEX idx_requests_pin_code (pin_code),
    INDEX idx_requests_urgency (urgency_level),
    INDEX idx_requests_submitted_at (submitted_at),
    INDEX idx_requests_request_number (request_number)
);
```

### Request_Photos Table

```sql
CREATE TABLE request_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    
    -- Photo details
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_kb INTEGER,
    mime_type VARCHAR(50),
    
    -- Upload metadata
    uploaded_by UUID REFERENCES users(id),
    upload_type VARCHAR(20) DEFAULT 'INITIAL' CHECK (
        upload_type IN ('INITIAL', 'INSPECTION', 'PROGRESS', 'COMPLETION')
    ),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_request_photos_request_id (request_id),
    INDEX idx_request_photos_upload_type (upload_type)
);
```

### Request_Timeline Table

```sql
CREATE TABLE request_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    
    -- Timeline entry
    status VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Actor
    performed_by UUID REFERENCES users(id),
    
    -- Metadata
    metadata JSONB, -- Additional data for this event
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_timeline_request_id (request_id),
    INDEX idx_timeline_created_at (created_at)
);
```

### Quotations Table (Phase 2)

```sql
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number VARCHAR(50) UNIQUE NOT NULL, -- QUO-YYYYMMDD-XXXXX
    
    -- Foreign keys
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    contractor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id), -- Engineer who created draft
    
    -- Quotation details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Financial details
    total_amount DECIMAL(12, 2) NOT NULL,
    breakdown JSONB NOT NULL, -- Array of items with description, quantity, rate
    gst_percentage DECIMAL(5, 2) DEFAULT 18.00,
    gst_amount DECIMAL(12, 2),
    final_amount DECIMAL(12, 2) NOT NULL,
    
    -- Additional terms
    estimated_duration_days INTEGER,
    warranty_period_months INTEGER,
    terms_and_conditions TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (
        status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED')
    ),
    
    -- Validity
    valid_until DATE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_quotations_request_id (request_id),
    INDEX idx_quotations_contractor_id (contractor_id),
    INDEX idx_quotations_status (status)
);
```

### Notifications Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recipient
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification content
    type VARCHAR(50) NOT NULL CHECK (
        type IN (
            'REQUEST_CREATED', 'REQUEST_UPDATED', 'REQUEST_CANCELLED',
            'QUOTATION_RECEIVED', 'PAYMENT_RECEIVED', 'WORK_STARTED',
            'WORK_COMPLETED', 'SYSTEM_ANNOUNCEMENT'
        )
    ),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entity
    entity_type VARCHAR(50), -- 'REQUEST', 'QUOTATION', etc.
    entity_id UUID, -- ID of related entity
    
    -- Navigation
    action_url TEXT, -- Deep link to navigate to
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- Delivery status
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_created_at (created_at)
);
```

### OTP_Verifications Table

```sql
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identifier
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    
    -- OTP details
    otp_code VARCHAR(6) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL, -- Hashed OTP for security
    
    -- Purpose
    purpose VARCHAR(50) NOT NULL CHECK (
        purpose IN ('REGISTRATION', 'LOGIN', 'PASSWORD_RESET', 'PHONE_VERIFICATION')
    ),
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Validity
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_otp_phone (phone),
    INDEX idx_otp_email (email),
    INDEX idx_otp_created_at (created_at)
);
```

### Sessions Table

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Token details
    refresh_token_hash VARCHAR(255) NOT NULL,
    access_token_jti VARCHAR(100), -- JWT ID for access token
    
    -- Device information
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    device_type VARCHAR(50), -- 'ANDROID', 'iOS', 'WEB'
    app_version VARCHAR(20),
    os_version VARCHAR(50),
    
    -- Network
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Indexes
    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_refresh_token_hash (refresh_token_hash),
    INDEX idx_sessions_is_active (is_active)
);
```

### Audit_Logs Table

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Actor
    user_id UUID REFERENCES users(id),
    
    -- Action
    action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'USER', 'REQUEST', 'QUOTATION', etc.
    entity_id UUID,
    
    -- Details
    description TEXT,
    changes JSONB, -- Before/after values
    
    -- Context
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_audit_user_id (user_id),
    INDEX idx_audit_entity_type (entity_type),
    INDEX idx_audit_entity_id (entity_id),
    INDEX idx_audit_created_at (created_at)
);
```

## TypeScript Interfaces

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  
  // Profile
  profilePhotoUrl?: string;
  companyName?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  
  // Preferences
  language: 'en' | 'mr';
  notificationEnabled: boolean;
  emailNotificationEnabled: boolean;
  
  // Status
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Timestamps
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

enum UserRole {
  SOCIETY_USER = 'SOCIETY_USER',
  CONTRACTOR = 'CONTRACTOR',
  ADMIN = 'ADMIN',
  ENGINEER = 'ENGINEER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}
```

### Request

```typescript
interface Request {
  id: string;
  requestNumber: string;
  
  // Relations
  userId: string;
  contractorId?: string;
  assignedEngineerId?: string;
  
  // Details
  title: string;
  description?: string;
  status: RequestStatus;
  
  // Building info
  buildingName: string;
  buildingAddress: string;
  contactPersonName: string;
  contactPersonPhone: string;
  pinCode: string;
  
  // Work specs
  buildingAreaSqft: number;
  numberOfFloors: number;
  workType: WorkType;
  workDescription: string;
  
  // Additional
  urgencyLevel: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  preferredInspectionDate?: Date;
  additionalNotes?: string;
  
  // Payment
  paymentAmount: number;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  paymentDate?: Date;
  
  // Sync
  isSynced: boolean;
  syncAttempts: number;
  lastSyncAttempt?: Date;
  
  // Timestamps
  submittedAt: Date;
  reviewedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (populated)
  user?: User;
  contractor?: User;
  photos?: RequestPhoto[];
  timeline?: RequestTimelineEntry[];
}

enum RequestStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  INSPECTION_SCHEDULED = 'INSPECTION_SCHEDULED',
  QUOTATION_SENT = 'QUOTATION_SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAID = 'PAID',
  WORK_IN_PROGRESS = 'WORK_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

enum WorkType {
  PAINTING = 'PAINTING',
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  STRUCTURAL = 'STRUCTURAL',
  WATERPROOFING = 'WATERPROOFING',
  GENERAL_REPAIR = 'GENERAL_REPAIR',
  RENOVATION = 'RENOVATION',
  OTHER = 'OTHER'
}

enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}
```

## Database Indexes Strategy

### Performance Considerations

1. **Covering Indexes**: For frequently queried combinations
2. **Partial Indexes**: For common filters (e.g., active status)
3. **Full-Text Search**: For description/notes search
4. **JSONB Indexes**: For metadata queries

### Example Optimized Queries

```sql
-- Contractor dashboard: Recent requests
CREATE INDEX idx_requests_contractor_recent 
ON requests (contractor_id, submitted_at DESC) 
WHERE status IN ('SUBMITTED', 'UNDER_REVIEW');

-- User's active requests
CREATE INDEX idx_requests_user_active 
ON requests (user_id, status, submitted_at DESC)
WHERE status NOT IN ('COMPLETED', 'CANCELLED');

-- Full-text search on requests
CREATE INDEX idx_requests_fts 
ON requests USING gin(
    to_tsvector('english', 
        coalesce(title, '') || ' ' || 
        coalesce(description, '') || ' ' ||
        coalesce(work_description, '')
    )
);
```

## Migration Strategy

```sql
-- Version control for migrations
CREATE TABLE schema_migrations (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example migration
-- V001__initial_schema.sql
-- V002__add_contractor_fields.sql
-- V003__add_quotations_table.sql
```

---
*Last Updated: December 28, 2025*
