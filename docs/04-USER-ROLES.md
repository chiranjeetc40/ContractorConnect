# User Roles & Permissions

## Role Definitions

### 1. Society User / Building Owner

**Primary Responsibility**: Submit and track repair/construction requests

#### Capabilities
- Register and manage own profile
- Create repair/construction requests
- Upload photos and documents
- View own request history
- Track request status
- Receive notifications on request updates
- Edit requests before contractor review
- Cancel requests (within 24 hours)
- Make payments (Phase 2)
- View quotations (Phase 2)
- Rate contractors (Phase 3)

#### Permissions Matrix

| Resource | Create | Read Own | Read All | Update Own | Update All | Delete |
|----------|--------|----------|----------|------------|------------|--------|
| Request | ✅ | ✅ | ❌ | ✅* | ❌ | ✅** |
| User Profile | - | ✅ | ❌ | ✅ | ❌ | ❌ |
| Quotation | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Analytics | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Notifications | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |

*Before contractor reviews  
**Cancel only, within 24 hours

### 2. Contractor / Admin

**Primary Responsibility**: Manage incoming requests, coordinate work, view analytics

#### Capabilities
- Register as contractor
- View all incoming requests
- Filter and search requests
- View request details and contact information
- Mark requests as reviewed
- Send engineers for inspection (Phase 2)
- Create and submit quotations (Phase 2)
- View analytics dashboard
- Export reports
- Receive real-time notifications
- Manage own profile
- View payment history (Phase 2)
- Manage team members (Phase 3)

#### Permissions Matrix

| Resource | Create | Read Own | Read All | Update Own | Update All | Delete |
|----------|--------|----------|----------|------------|------------|--------|
| Request | ❌ | - | ✅ | ❌ | ✅* | ❌ |
| User Profile | - | ✅ | ❌ | ✅ | ❌ | ❌ |
| Quotation | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Analytics | - | - | ✅ | - | - | - |
| Notifications | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

*Update status only

### 3. Engineer (Phase 2)

**Primary Responsibility**: Conduct site inspections and create reports

#### Capabilities
- Register as engineer (assigned by contractor)
- View assigned inspection tasks
- Access request details
- Upload inspection photos
- Create inspection reports
- Record measurements
- Submit quotation draft
- Update task status
- Navigate to site location
- Receive task notifications

#### Permissions Matrix

| Resource | Create | Read Own | Read All | Update Own | Update All | Delete |
|----------|--------|----------|----------|------------|------------|--------|
| Request | ❌ | - | ✅* | ❌ | ❌ | ❌ |
| Inspection | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Quotation Draft | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| User Profile | - | ✅ | ❌ | ✅ | ❌ | ❌ |
| Notifications | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |

*Only assigned requests

### 4. Super Admin (Phase 3)

**Primary Responsibility**: Platform management and oversight

#### Capabilities
- View all users and activities
- Manage contractor accounts
- View platform-wide analytics
- Configure system settings
- Manage user roles
- Handle disputes
- View audit logs
- Send platform notifications
- Manage content and translations
- Control feature flags

#### Permissions Matrix

| Resource | Create | Read Own | Read All | Update Own | Update All | Delete |
|----------|--------|----------|----------|------------|------------|--------|
| Request | ❌ | - | ✅ | ❌ | ✅ | ✅ |
| User | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quotation | ❌ | - | ✅ | ❌ | ✅ | ✅ |
| Analytics | - | - | ✅ | - | - | - |
| System Config | ✅ | - | ✅ | - | ✅ | ✅ |
| Audit Logs | ❌ | - | ✅ | ❌ | ❌ | ❌ |

## Permission System Design

### Permission Naming Convention

```
<resource>:<action>:<scope>

Examples:
- request:create
- request:read:own
- request:read:all
- user:update:own
- analytics:view
- quotation:create
```

### Permission Categories

#### Resource-Based Permissions
```typescript
enum ResourcePermission {
  // Request permissions
  REQUEST_CREATE = 'request:create',
  REQUEST_READ_OWN = 'request:read:own',
  REQUEST_READ_ALL = 'request:read:all',
  REQUEST_UPDATE_OWN = 'request:update:own',
  REQUEST_UPDATE_ALL = 'request:update:all',
  REQUEST_DELETE_OWN = 'request:delete:own',
  
  // User permissions
  USER_CREATE = 'user:create',
  USER_READ_OWN = 'user:read:own',
  USER_READ_ALL = 'user:read:all',
  USER_UPDATE_OWN = 'user:update:own',
  USER_UPDATE_ALL = 'user:update:all',
  USER_DELETE = 'user:delete',
  
  // Quotation permissions
  QUOTATION_CREATE = 'quotation:create',
  QUOTATION_READ_OWN = 'quotation:read:own',
  QUOTATION_READ_ALL = 'quotation:read:all',
  QUOTATION_UPDATE_OWN = 'quotation:update:own',
  QUOTATION_UPDATE_ALL = 'quotation:update:all',
  
  // Analytics permissions
  ANALYTICS_VIEW_OWN = 'analytics:view:own',
  ANALYTICS_VIEW_ALL = 'analytics:view:all',
  ANALYTICS_EXPORT = 'analytics:export',
  
  // Notification permissions
  NOTIFICATION_SEND = 'notification:send',
  NOTIFICATION_READ_OWN = 'notification:read:own',
  
  // Inspection permissions (Phase 2)
  INSPECTION_CREATE = 'inspection:create',
  INSPECTION_READ_OWN = 'inspection:read:own',
  INSPECTION_UPDATE_OWN = 'inspection:update:own',
  
  // System permissions (Phase 3)
  SYSTEM_CONFIG = 'system:config',
  AUDIT_VIEW = 'audit:view',
}
```

### Role-Permission Mapping

```typescript
const ROLE_PERMISSIONS: Record<UserRole, ResourcePermission[]> = {
  SOCIETY_USER: [
    ResourcePermission.REQUEST_CREATE,
    ResourcePermission.REQUEST_READ_OWN,
    ResourcePermission.REQUEST_UPDATE_OWN,
    ResourcePermission.REQUEST_DELETE_OWN,
    ResourcePermission.USER_READ_OWN,
    ResourcePermission.USER_UPDATE_OWN,
    ResourcePermission.QUOTATION_READ_OWN,
    ResourcePermission.NOTIFICATION_READ_OWN,
  ],
  
  CONTRACTOR: [
    ResourcePermission.REQUEST_READ_ALL,
    ResourcePermission.REQUEST_UPDATE_ALL,
    ResourcePermission.USER_READ_OWN,
    ResourcePermission.USER_UPDATE_OWN,
    ResourcePermission.QUOTATION_CREATE,
    ResourcePermission.QUOTATION_READ_ALL,
    ResourcePermission.QUOTATION_UPDATE_OWN,
    ResourcePermission.ANALYTICS_VIEW_ALL,
    ResourcePermission.ANALYTICS_EXPORT,
    ResourcePermission.NOTIFICATION_SEND,
    ResourcePermission.NOTIFICATION_READ_OWN,
  ],
  
  ENGINEER: [
    ResourcePermission.REQUEST_READ_ALL, // Only assigned
    ResourcePermission.USER_READ_OWN,
    ResourcePermission.USER_UPDATE_OWN,
    ResourcePermission.INSPECTION_CREATE,
    ResourcePermission.INSPECTION_READ_OWN,
    ResourcePermission.INSPECTION_UPDATE_OWN,
    ResourcePermission.QUOTATION_CREATE, // Draft only
    ResourcePermission.NOTIFICATION_READ_OWN,
  ],
  
  ADMIN: [
    ResourcePermission.REQUEST_READ_ALL,
    ResourcePermission.REQUEST_UPDATE_ALL,
    ResourcePermission.USER_READ_OWN,
    ResourcePermission.USER_UPDATE_OWN,
    ResourcePermission.QUOTATION_READ_ALL,
    ResourcePermission.ANALYTICS_VIEW_ALL,
    ResourcePermission.ANALYTICS_EXPORT,
    ResourcePermission.NOTIFICATION_SEND,
    ResourcePermission.NOTIFICATION_READ_OWN,
  ],
  
  SUPER_ADMIN: [
    // All permissions
    ...Object.values(ResourcePermission)
  ],
};
```

## Role Assignment & Management

### Registration Flow

```typescript
// During registration
interface RegistrationData {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: 'SOCIETY_USER' | 'CONTRACTOR'; // User selects
  // Additional fields based on role
  companyName?: string; // For contractors
  address?: string;
}

// Backend validates and creates user
async function registerUser(data: RegistrationData) {
  // Validate role selection
  if (!['SOCIETY_USER', 'CONTRACTOR'].includes(data.role)) {
    throw new Error('Invalid role');
  }
  
  // Create user with role
  const user = await createUser({
    ...data,
    role: data.role,
    permissions: ROLE_PERMISSIONS[data.role],
    status: 'ACTIVE'
  });
  
  return user;
}
```

### Role Switching (Phase 3)

Some users might need multiple roles (e.g., contractor who also owns a building):

```typescript
interface UserRoles {
  primaryRole: UserRole;
  additionalRoles: UserRole[];
  activeRole: UserRole; // Current active role
}

// Switch role
async function switchRole(userId: string, newRole: UserRole) {
  const user = await getUserById(userId);
  
  if (!user.additionalRoles.includes(newRole)) {
    throw new Error('User does not have this role');
  }
  
  // Update active role
  await updateUser(userId, { activeRole: newRole });
  
  // Generate new JWT with new permissions
  const token = generateToken({
    userId,
    role: newRole,
    permissions: ROLE_PERMISSIONS[newRole]
  });
  
  return token;
}
```

## Permission Checking

### Frontend Permission Check

```typescript
// Hook for permission checking
function useHasPermission(permission: ResourcePermission): boolean {
  const { user } = useAuth();
  
  if (!user) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[user.role];
  return rolePermissions.includes(permission);
}

// Component usage
function CreateRequestButton() {
  const canCreate = useHasPermission(ResourcePermission.REQUEST_CREATE);
  
  if (!canCreate) {
    return null; // Don't show button
  }
  
  return <Button onPress={handleCreate}>Create Request</Button>;
}

// Route protection
function ProtectedRoute({ permission, children }) {
  const hasPermission = useHasPermission(permission);
  
  if (!hasPermission) {
    return <Navigate to="/no-permission" />;
  }
  
  return children;
}
```

### Backend Permission Check

```python
# Decorator for permission checking
def require_permission(permission: str):
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get current user from JWT
            current_user = kwargs.get('current_user')
            
            if not current_user:
                raise HTTPException(
                    status_code=401,
                    detail="Not authenticated"
                )
            
            # Check permission
            role_permissions = ROLE_PERMISSIONS[current_user.role]
            
            if permission not in role_permissions:
                raise HTTPException(
                    status_code=403,
                    detail="Insufficient permissions"
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator

# Usage
@router.get("/requests")
@require_permission("request:read:all")
async def get_all_requests(
    current_user: User = Depends(get_current_user)
):
    return await request_service.get_all_requests()

# Resource ownership check
@router.put("/requests/{request_id}")
@require_permission("request:update:own")
async def update_request(
    request_id: str,
    data: UpdateRequestSchema,
    current_user: User = Depends(get_current_user)
):
    # Verify ownership
    request = await request_service.get_by_id(request_id)
    
    if request.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this request"
        )
    
    return await request_service.update(request_id, data)
```

## Dynamic Permission System (Future Enhancement)

For more flexibility, implement database-driven permissions:

```typescript
// Database schema
interface PermissionEntity {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  scope: 'own' | 'all' | 'team';
}

interface RoleEntity {
  id: string;
  name: string;
  description: string;
  permissions: PermissionEntity[];
}

interface UserEntity {
  id: string;
  role: RoleEntity;
  customPermissions: PermissionEntity[]; // Override specific permissions
}

// Permission check becomes database query
async function hasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const user = await db.users.findById(userId, {
    include: ['role.permissions', 'customPermissions']
  });
  
  const allPermissions = [
    ...user.role.permissions,
    ...user.customPermissions
  ];
  
  return allPermissions.some(p => p.name === permission);
}
```

## Best Practices

1. **Principle of Least Privilege**: Users get only permissions they need
2. **Explicit Permissions**: Deny by default, allow explicitly
3. **Granular Permissions**: Fine-grained control over resources
4. **Audit Trail**: Log all permission checks and changes
5. **Role Hierarchy**: Roles can inherit from parent roles
6. **Permission Caching**: Cache role permissions for performance
7. **Regular Review**: Periodically audit and review permissions

---
*Last Updated: December 28, 2025*
