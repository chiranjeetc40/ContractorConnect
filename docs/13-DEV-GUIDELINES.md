# Development Guidelines

## Code Style & Standards

### TypeScript/JavaScript Guidelines

#### Naming Conventions

```typescript
// PascalCase for components, classes, types, interfaces
class RequestService {}
interface User {}
type RequestStatus = 'SUBMITTED' | 'REVIEWED';
const LoginScreen = () => {};

// camelCase for variables, functions, methods
const userName = 'John';
function createRequest() {}
const handleSubmit = () => {};

// UPPER_CASE for constants
const API_BASE_URL = 'https://api.contractorconnect.com';
const MAX_RETRY_ATTEMPTS = 3;

// Prefix interfaces with 'I' for data transfer objects (optional)
interface ICreateRequestDTO {
  title: string;
  description: string;
}

// Prefix boolean variables with 'is', 'has', 'should'
const isLoading = true;
const hasPermission = false;
const shouldSync = true;
```

#### File Naming

```
// Components: PascalCase
LoginScreen.tsx
RequestCard.tsx
Button.tsx

// Hooks: camelCase with 'use' prefix
useAuth.ts
useRequests.ts
usePermissions.ts

// Services: camelCase with 'Service' suffix
authService.ts
requestService.ts

// Types: PascalCase with .types.ts
User.types.ts
Request.types.ts

// Constants: camelCase with .constants.ts
app.constants.ts
api.constants.ts

// Utils: camelCase
formatDate.ts
validatePhone.ts
```

#### Code Organization

```typescript
// Feature-based structure
features/
  auth/
    screens/
      LoginScreen.tsx
      RegisterScreen.tsx
    components/
      OTPInput.tsx
    services/
      authService.ts
    store/
      authSlice.ts
    hooks/
      useAuth.ts
    types/
      Auth.types.ts
    constants/
      auth.constants.ts
```

#### Component Structure

```typescript
// 1. Imports (grouped)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Local imports
import { Button } from '@/shared/components';
import { useAuth } from '../hooks/useAuth';
import { LoginFormData } from '../types/Auth.types';

// 2. Types/Interfaces
interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

// 3. Component
export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  // 3.1 Hooks
  const navigation = useNavigation();
  const { login, isLoading } = useAuth();
  
  // 3.2 State
  const [formData, setFormData] = useState<LoginFormData>({
    phone: '',
    password: ''
  });
  
  // 3.3 Effects
  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup logic
    };
  }, []);
  
  // 3.4 Handlers
  const handleSubmit = async () => {
    try {
      await login(formData);
      onLoginSuccess?.();
    } catch (error) {
      // Handle error
    }
  };
  
  // 3.5 Render helpers
  const renderForm = () => {
    return <View>{/* Form content */}</View>;
  };
  
  // 3.6 Main render
  return (
    <View style={styles.container}>
      {renderForm()}
    </View>
  );
};

// 4. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  }
});
```

#### Async/Await & Error Handling

```typescript
// Good
async function fetchRequests(): Promise<Request[]> {
  try {
    const response = await api.get('/requests');
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle API error
      throw new AppError('Failed to fetch requests', error);
    }
    throw error;
  }
}

// Use Result type for operations that can fail
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: Error };

async function createRequest(data: CreateRequestDTO): Promise<Result<Request>> {
  try {
    const request = await requestService.create(data);
    return { success: true, data: request };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### Python Guidelines

#### Naming Conventions

```python
# snake_case for variables, functions
user_name = "John"
def create_request():
    pass

# PascalCase for classes
class RequestService:
    pass

# UPPER_CASE for constants
API_BASE_URL = "https://api.contractorconnect.com"
MAX_RETRY_ATTEMPTS = 3

# Prefix private methods with underscore
class UserService:
    def _validate_email(self, email: str) -> bool:
        pass
```

#### File Structure

```python
"""
Module docstring describing the purpose of this module.
"""

# 1. Standard library imports
import os
from typing import List, Optional
from datetime import datetime

# 2. Third-party imports
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# 3. Local imports
from app.core.database import get_db
from app.models.request import Request
from app.schemas.request import RequestCreate, RequestResponse
from app.services.request_service import RequestService

# 4. Constants
DEFAULT_PAGE_SIZE = 20

# 5. Router/App initialization
router = APIRouter(prefix="/api/v1/requests", tags=["requests"])

# 6. Endpoints/Functions
@router.post("/", response_model=RequestResponse)
async def create_request(
    request_data: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new request.
    
    Args:
        request_data: Request creation data
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Created request
        
    Raises:
        HTTPException: If validation fails
    """
    service = RequestService(db)
    return await service.create_request(request_data, current_user)
```

#### Type Hints

```python
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

# Always use type hints
def get_user_by_id(user_id: str) -> Optional[User]:
    pass

def create_request(
    data: RequestCreate,
    user: User
) -> Request:
    pass

def filter_requests(
    status: Optional[str] = None,
    work_type: Optional[str] = None,
    limit: int = 20
) -> List[Request]:
    pass

# For complex return types
from typing import Tuple

def process_request(
    request_id: str
) -> Tuple[Request, List[Notification]]:
    pass
```

## Git Workflow

### Branch Naming

```
main                    # Production branch
develop                 # Development branch
feature/user-auth       # Feature branches
bugfix/login-crash      # Bug fix branches
hotfix/payment-issue    # Hotfix branches
release/v1.0.0          # Release branches
```

### Commit Messages

Follow Conventional Commits:

```
type(scope): subject

body (optional)

footer (optional)

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style (formatting)
- refactor: Code refactoring
- test: Tests
- chore: Build/tooling

Examples:
feat(auth): add OTP verification
fix(requests): resolve offline sync issue
docs(api): update endpoint documentation
refactor(services): extract request validation logic
test(auth): add login flow tests
chore(deps): update dependencies
```

### Pull Request Process

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console logs/debugger statements
```

## Testing Standards

### Frontend Testing

```typescript
// Unit tests with Jest & React Testing Library
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';

describe('LoginScreen', () => {
  it('should render login form', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    
    expect(getByPlaceholderText('Phone Number')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });
  
  it('should call login on submit', async () => {
    const mockLogin = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen onLogin={mockLogin} />
    );
    
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '9876543210');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        phone: '9876543210',
        password: 'password123'
      });
    });
  });
});
```

### Backend Testing

```python
# Unit tests with pytest
import pytest
from app.services.request_service import RequestService
from app.schemas.request import RequestCreate

@pytest.fixture
def request_service(db_session):
    return RequestService(db_session)

def test_create_request(request_service, sample_user):
    """Test request creation"""
    request_data = RequestCreate(
        title="Test Request",
        work_type="PAINTING",
        building_area_sqft=1000
    )
    
    request = request_service.create_request(request_data, sample_user)
    
    assert request.title == "Test Request"
    assert request.user_id == sample_user.id
    assert request.status == "SUBMITTED"

def test_create_request_validation(request_service, sample_user):
    """Test request validation"""
    request_data = RequestCreate(
        title="",  # Invalid: empty title
        work_type="PAINTING"
    )
    
    with pytest.raises(ValidationError):
        request_service.create_request(request_data, sample_user)
```

### Test Coverage Goals

- Unit tests: > 80% coverage
- Integration tests: Critical paths covered
- E2E tests: Main user flows covered

## Performance Guidelines

### Frontend Optimization

```typescript
// 1. Use React.memo for expensive components
export const RequestCard = React.memo(({ request }) => {
  return <View>{/* Card content */}</View>;
});

// 2. Use useCallback for functions passed as props
const handlePress = useCallback(() => {
  navigation.navigate('RequestDetail', { id: request.id });
}, [request.id, navigation]);

// 3. Use useMemo for expensive calculations
const filteredRequests = useMemo(() => {
  return requests.filter(r => r.status === selectedStatus);
}, [requests, selectedStatus]);

// 4. Optimize FlatList
<FlatList
  data={requests}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  windowSize={10}
  maxToRenderPerBatch={10}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index
  })}
/>

// 5. Image optimization
<Image
  source={{ uri: imageUrl }}
  resizeMode="cover"
  style={styles.image}
  // Use progressive JPEG
  progressiveRenderingEnabled={true}
/>
```

### Backend Optimization

```python
# 1. Use database indexes
# See DATABASE-DESIGN.md

# 2. Use select_related/joinedload for eager loading
requests = db.query(Request)\
    .options(joinedload(Request.user))\
    .all()

# 3. Paginate large results
def get_requests(
    db: Session,
    skip: int = 0,
    limit: int = 20
) -> List[Request]:
    return db.query(Request)\
        .offset(skip)\
        .limit(limit)\
        .all()

# 4. Use caching for frequent queries
from functools import lru_cache

@lru_cache(maxsize=100)
def get_user_by_id(user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

# 5. Async operations for I/O
import asyncio

async def send_notifications(user_ids: List[str]):
    tasks = [send_notification(user_id) for user_id in user_ids]
    await asyncio.gather(*tasks)
```

## Security Best Practices

### Frontend Security

```typescript
// 1. Secure storage for sensitive data
import * as SecureStore from 'expo-secure-store';

async function saveToken(token: string) {
  await SecureStore.setItemAsync('authToken', token);
}

// 2. Input validation
function validatePhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

// 3. Sanitize user input
import DOMPurify from 'dompurify';

const sanitizedDescription = DOMPurify.sanitize(userInput);

// 4. HTTPS only
const api = axios.create({
  baseURL: 'https://api.contractorconnect.com',
  timeout: 10000
});
```

### Backend Security

```python
# 1. Password hashing
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# 2. Input validation with Pydantic
from pydantic import BaseModel, validator, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    phone: str
    password: str
    
    @validator('phone')
    def validate_phone(cls, v):
        if not re.match(r'^[6-9]\d{9}$', v):
            raise ValueError('Invalid phone number')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

# 3. SQL injection prevention (use ORM)
# Bad
query = f"SELECT * FROM users WHERE id = {user_id}"

# Good
user = db.query(User).filter(User.id == user_id).first()

# 4. CORS configuration
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://contractorconnect.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

## Documentation Standards

### Code Documentation

```typescript
/**
 * Creates a new request in the system.
 * 
 * @param data - The request creation data
 * @param options - Optional configuration
 * @returns Promise resolving to the created request
 * @throws {ValidationError} If data is invalid
 * @throws {NetworkError} If API call fails
 * 
 * @example
 * const request = await createRequest({
 *   title: 'Painting work',
 *   workType: 'PAINTING'
 * });
 */
async function createRequest(
  data: CreateRequestDTO,
  options?: RequestOptions
): Promise<Request> {
  // Implementation
}
```

### API Documentation

Use OpenAPI/Swagger:

```python
@router.post(
    "/",
    response_model=RequestResponse,
    status_code=201,
    summary="Create a new request",
    description="Creates a new construction/repair request",
    responses={
        201: {
            "description": "Request created successfully",
            "model": RequestResponse
        },
        400: {"description": "Invalid request data"},
        401: {"description": "Unauthorized"},
        422: {"description": "Validation error"}
    }
)
async def create_request(
    request_data: RequestCreate = Body(..., example={
        "title": "Painting work required",
        "work_type": "PAINTING",
        "building_area_sqft": 1000
    }),
    current_user: User = Depends(get_current_user)
):
    """Additional endpoint documentation"""
    pass
```

---
*Last Updated: December 28, 2025*
