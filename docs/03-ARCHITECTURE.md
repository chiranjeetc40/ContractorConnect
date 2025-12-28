# System Architecture

## Architecture Overview

ContractorConnect follows a **three-tier architecture** with clear separation of concerns:

1. **Presentation Layer** (React Native Mobile App)
2. **Business Logic Layer** (Python FastAPI Backend)
3. **Data Layer** (PostgreSQL Database)

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     MOBILE APPLICATION (React Native)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   UI Layer   │  │  Navigation  │  │ Localization │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ State Mgmt   │  │   Services   │  │ Local Storage│          │
│  │  (Redux)     │  │   (API)      │  │ (WatermelonDB)│         │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/REST API
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Python FastAPI)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ API Gateway  │  │ Auth Service │  │  Middleware  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Business   │  │ Notification │  │    File      │          │
│  │    Logic     │  │   Service    │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↕ ORM (SQLAlchemy)
┌─────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │    AWS S3    │          │
│  │   Database   │  │    Cache     │  │ File Storage │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Mobile Application Architecture

### Layer Structure

```
src/
├── app/                          # Application core
│   ├── store/                    # Redux store configuration
│   ├── navigation/               # Navigation configuration
│   └── config/                   # App configuration
├── features/                     # Feature-based modules
│   ├── auth/                     # Authentication feature
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/                # Feature-specific state
│   │   └── types/
│   ├── requests/                 # Request management feature
│   ├── dashboard/                # Dashboard feature
│   └── profile/                  # Profile feature
├── shared/                       # Shared resources
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   ├── constants/                # App constants
│   ├── types/                    # TypeScript types
│   └── services/                 # Shared services
├── infrastructure/               # Infrastructure concerns
│   ├── api/                      # API client
│   ├── storage/                  # Local storage
│   ├── notifications/            # Push notifications
│   └── localization/             # i18n
└── assets/                       # Static assets
    ├── images/
    ├── fonts/
    └── translations/
```

### Key Architectural Patterns

#### 1. Feature-Based Architecture
Each feature is self-contained with its own:
- Screens (UI components)
- Business logic (services)
- State management (Redux slices)
- Types/interfaces
- Tests

**Benefits:**
- Easy to add new features
- Clear boundaries between modules
- Simplified testing
- Better code organization

#### 2. Repository Pattern
All data access goes through repository layer:

```typescript
interface IRequestRepository {
  create(request: CreateRequestDTO): Promise<Request>;
  findById(id: string): Promise<Request | null>;
  findAll(filters: RequestFilters): Promise<Request[]>;
  update(id: string, data: UpdateRequestDTO): Promise<Request>;
  delete(id: string): Promise<void>;
}

// Implementation with offline support
class RequestRepository implements IRequestRepository {
  constructor(
    private apiService: ApiService,
    private localDb: LocalDatabase,
    private syncService: SyncService
  ) {}
  
  async create(request: CreateRequestDTO): Promise<Request> {
    // Save to local DB first
    const localRequest = await this.localDb.requests.create(request);
    
    // Queue for sync
    await this.syncService.queue('CREATE_REQUEST', localRequest);
    
    // Try immediate sync if online
    if (await this.isOnline()) {
      await this.syncService.syncNow();
    }
    
    return localRequest;
  }
}
```

#### 3. Service Layer Pattern
Business logic separated from UI:

```typescript
class RequestService {
  constructor(
    private repository: IRequestRepository,
    private validationService: ValidationService,
    private notificationService: NotificationService
  ) {}
  
  async submitRequest(data: CreateRequestDTO): Promise<Result<Request>> {
    // Validate
    const validation = await this.validationService.validate(data);
    if (!validation.isValid) {
      return Result.fail(validation.errors);
    }
    
    // Create request
    const request = await this.repository.create(data);
    
    // Send notification
    await this.notificationService.notify({
      type: 'REQUEST_CREATED',
      data: request
    });
    
    return Result.ok(request);
  }
}
```

#### 4. State Management with Redux Toolkit

```typescript
// Feature slice
const requestSlice = createSlice({
  name: 'requests',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filters: defaultFilters
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  }
});
```

## Backend Architecture

### Layer Structure

```
app/
├── main.py                       # Application entry point
├── core/                         # Core functionality
│   ├── config.py                 # Configuration
│   ├── security.py               # Security utilities
│   └── database.py               # Database setup
├── api/                          # API layer
│   ├── v1/                       # API version 1
│   │   ├── endpoints/
│   │   │   ├── auth.py
│   │   │   ├── requests.py
│   │   │   ├── users.py
│   │   │   └── notifications.py
│   │   └── dependencies.py       # Route dependencies
│   └── middleware/               # Custom middleware
├── domain/                       # Domain layer
│   ├── models/                   # Domain models
│   │   ├── user.py
│   │   ├── request.py
│   │   └── notification.py
│   ├── services/                 # Business logic
│   │   ├── auth_service.py
│   │   ├── request_service.py
│   │   └── notification_service.py
│   └── repositories/             # Data access
│       ├── user_repository.py
│       └── request_repository.py
├── infrastructure/               # Infrastructure
│   ├── database/                 # Database models
│   │   └── models.py
│   ├── email/                    # Email service
│   ├── sms/                      # SMS/OTP service
│   ├── storage/                  # File storage
│   └── cache/                    # Redis cache
├── schemas/                      # Pydantic schemas
│   ├── user.py
│   ├── request.py
│   └── common.py
└── tests/                        # Tests
    ├── unit/
    └── integration/
```

### Key Architectural Patterns

#### 1. Clean Architecture / Hexagonal Architecture

**Domain Layer** (Core business logic)
- Independent of frameworks
- Contains business rules
- Defines interfaces for external dependencies

**Infrastructure Layer** (External dependencies)
- Database implementation
- External APIs
- File systems

**API Layer** (Adapters)
- Converts external requests to domain operations
- Handles HTTP concerns

#### 2. Dependency Injection

```python
# Dependency injection for services
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_request_service(
    db: Session = Depends(get_db)
) -> RequestService:
    repository = RequestRepository(db)
    notification_service = NotificationService()
    return RequestService(repository, notification_service)

# Usage in endpoint
@router.post("/requests")
async def create_request(
    request: CreateRequestSchema,
    service: RequestService = Depends(get_request_service),
    current_user: User = Depends(get_current_user)
):
    return await service.create_request(request, current_user)
```

#### 3. Repository Pattern

```python
class RequestRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, request: RequestCreate) -> Request:
        db_request = RequestModel(**request.dict())
        self.db.add(db_request)
        self.db.commit()
        self.db.refresh(db_request)
        return db_request
    
    def find_by_id(self, request_id: str) -> Optional[Request]:
        return self.db.query(RequestModel).filter(
            RequestModel.id == request_id
        ).first()
    
    def find_all(self, filters: RequestFilters) -> List[Request]:
        query = self.db.query(RequestModel)
        
        if filters.status:
            query = query.filter(RequestModel.status == filters.status)
        if filters.user_id:
            query = query.filter(RequestModel.user_id == filters.user_id)
        
        return query.all()
```

#### 4. Service Layer

```python
class RequestService:
    def __init__(
        self,
        repository: RequestRepository,
        notification_service: NotificationService
    ):
        self.repository = repository
        self.notification_service = notification_service
    
    async def create_request(
        self,
        request_data: CreateRequestSchema,
        user: User
    ) -> Request:
        # Business logic
        request = self.repository.create(request_data)
        
        # Send notifications
        await self.notification_service.notify_contractors(request)
        await self.notification_service.send_confirmation_email(
            user, request
        )
        
        return request
```

## Role-Based Access Control (RBAC) Architecture

### Role Hierarchy

```
┌─────────────────────┐
│    SUPER_ADMIN      │  (Future)
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼────┐   ┌───▼────────┐
│ ADMIN  │   │ CONTRACTOR │
│        │   │            │
└────────┘   └────────────┘
    
┌──────────────┐
│ SOCIETY_USER │
└──────────────┘

┌──────────────┐
│   ENGINEER   │  (Future)
└──────────────┘
```

### Permission Model

```typescript
enum Permission {
  // Request permissions
  REQUEST_CREATE = 'request:create',
  REQUEST_READ_OWN = 'request:read:own',
  REQUEST_READ_ALL = 'request:read:all',
  REQUEST_UPDATE_OWN = 'request:update:own',
  REQUEST_DELETE_OWN = 'request:delete:own',
  
  // User permissions
  USER_READ_OWN = 'user:read:own',
  USER_UPDATE_OWN = 'user:update:own',
  USER_READ_ALL = 'user:read:all',
  USER_UPDATE_ALL = 'user:update:all',
  
  // Analytics permissions
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',
  
  // Notification permissions
  NOTIFICATION_SEND = 'notification:send',
}

const rolePermissions: Record<Role, Permission[]> = {
  SOCIETY_USER: [
    Permission.REQUEST_CREATE,
    Permission.REQUEST_READ_OWN,
    Permission.REQUEST_UPDATE_OWN,
    Permission.USER_READ_OWN,
    Permission.USER_UPDATE_OWN,
  ],
  
  CONTRACTOR: [
    Permission.REQUEST_READ_ALL,
    Permission.USER_READ_OWN,
    Permission.USER_UPDATE_OWN,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.NOTIFICATION_SEND,
  ],
  
  ADMIN: [
    Permission.REQUEST_READ_ALL,
    Permission.USER_READ_ALL,
    Permission.USER_UPDATE_ALL,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.NOTIFICATION_SEND,
  ],
};
```

### Implementation

```typescript
// Permission check hook
function usePermission(permission: Permission): boolean {
  const user = useSelector((state) => state.auth.user);
  
  if (!user) return false;
  
  const permissions = rolePermissions[user.role];
  return permissions.includes(permission);
}

// Protected component
function ProtectedComponent() {
  const canViewAnalytics = usePermission(Permission.ANALYTICS_VIEW);
  
  if (!canViewAnalytics) {
    return <NoPermissionMessage />;
  }
  
  return <AnalyticsDashboard />;
}

// Backend middleware
def require_permission(permission: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: User = None, **kwargs):
            if not has_permission(current_user, permission):
                raise HTTPException(status_code=403, detail="Forbidden")
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

@router.get("/analytics")
@require_permission("analytics:view")
async def get_analytics(current_user: User = Depends(get_current_user)):
    pass
```

## Data Flow Architecture

### Request Submission Flow

```
[User] → [CreateRequestScreen]
           ↓
    [Validation Layer]
           ↓
    [RequestService]
           ↓
    ┌──────┴──────┐
    ↓             ↓
[Local DB]   [Sync Queue]
    ↓             ↓
[UI Update]  [Background Sync]
                  ↓
              [API Call]
                  ↓
         [Backend Validation]
                  ↓
         [Business Logic]
                  ↓
         [Database Save]
                  ↓
         [Notification]
         /            \
        ↓              ↓
   [Push to App]  [Email Send]
```

### Offline-First Architecture

```
                [User Action]
                     ↓
              [Is Online?] ──No──┐
                     │            │
                    Yes           │
                     ↓            ↓
              [API Request]  [Local DB]
                     │            │
                     ↓            ↓
              [Response]   [Queue for Sync]
                     │            │
                     ↓            ↓
              [Local DB]   [Sync Indicator]
                     │            │
                     └────┬───────┘
                          ↓
                    [UI Update]
                    
[Background Service: Checks connectivity]
         ↓
    [Online Detected]
         ↓
    [Process Queue]
         ↓
    [Sync to Server]
         ↓
    [Update Local DB]
```

## Security Architecture

### Authentication Flow

```
1. User enters phone + password
2. Client sends to /auth/login
3. Server validates credentials
4. Server generates JWT (access + refresh token)
5. Client stores tokens securely (KeyChain/KeyStore)
6. Client includes access token in API requests
7. Server validates JWT on each request
8. Token expires → Client uses refresh token
9. Refresh token expired → User re-authenticates
```

### Token Structure

```typescript
interface JWTPayload {
  sub: string;        // User ID
  role: UserRole;     // User role
  permissions: string[]; // Permissions array
  iat: number;        // Issued at
  exp: number;        // Expiry
}
```

### Data Encryption

- **In Transit**: TLS 1.3
- **At Rest**: 
  - Database: PostgreSQL encryption
  - Local storage: Platform secure storage (KeyChain/KeyStore)
  - Files: AES-256 encryption

---
*Last Updated: December 28, 2025*
