# ContractorConnect - Quick Start Guide

## Project Summary

**ContractorConnect** is a mobile-first platform that connects building societies with civil work contractors. The app simplifies the process of requesting quotations for repair and construction work.

### Key Features (Phase 1)
- ✅ Self-service registration with OTP verification
- ✅ Multi-step request submission form
- ✅ Offline-first architecture with auto-sync
- ✅ Real-time push and email notifications
- ✅ Role-based access (Society Users & Contractors)
- ✅ Multi-language support (English & Marathi)
- ✅ Analytics dashboard for contractors
- ✅ Photo upload capability

### Technology Stack
- **Mobile**: React Native + TypeScript
- **Backend**: Python FastAPI
- **Database**: PostgreSQL
- **Storage**: AWS S3 / Local
- **Cache**: Redis
- **Notifications**: Firebase Cloud Messaging

---

## Documentation Index

### Planning & Requirements
1. **[Project Overview](./01-PROJECT-OVERVIEW.md)** - Vision, problem statement, target users
2. **[Requirements Specification](./02-REQUIREMENTS.md)** - Functional and non-functional requirements
3. **[User Roles & Permissions](./04-USER-ROLES.md)** - Role definitions and permission matrix

### Architecture & Design
4. **[System Architecture](./03-ARCHITECTURE.md)** - High-level architecture, patterns, RBAC
5. **[Application Flow](./05-APP-FLOW.md)** - User journeys, screen flows, state machines
6. **[Database Design](./06-DATABASE-DESIGN.md)** - Entity relationships, schemas, indexes
7. **[API Specification](./07-API-SPECIFICATION.md)** - Complete API reference

### Development
8. **[Development Guidelines](./13-DEV-GUIDELINES.md)** - Code standards, testing, security
9. **[Implementation Phases](./14-IMPLEMENTATION-PHASES.md)** - Phased rollout plan

### Additional Documentation
10. **[UI/UX Guidelines](./08-UI-UX-GUIDELINES.md)** - Design system (To be created)
11. **[Security & Authentication](./09-SECURITY.md)** - Security measures (To be created)
12. **[Offline Functionality](./10-OFFLINE-SUPPORT.md)** - Offline-first implementation (To be created)
13. **[Notifications System](./11-NOTIFICATIONS.md)** - Push and email notifications (To be created)
14. **[Localization](./12-LOCALIZATION.md)** - Multi-language support (To be created)
15. **[Testing Strategy](./15-TESTING-STRATEGY.md)** - Test plans (To be created)

---

## User Flow Overview

### Society User Journey

```
1. Download App → 2. Register (OTP) → 3. Login
        ↓
4. Create Request (Fill Form) → 5. Upload Photos → 6. Submit
        ↓
7. Receive Confirmation → 8. Track Status → 9. Get Quotation (Phase 2)
        ↓
10. Make Payment (Phase 2) → 11. Work Begins (Phase 3)
```

### Contractor Journey

```
1. Download App → 2. Register as Contractor → 3. Login
        ↓
4. View Dashboard → 5. See New Requests → 6. Review Details
        ↓
7. Mark as Reviewed → 8. Schedule Inspection (Phase 2)
        ↓
9. Create Quotation (Phase 2) → 10. Track Work (Phase 3)
```

---

## Key Architectural Decisions

### 1. Offline-First Approach
- Local database (WatermelonDB) stores all data
- Sync queue manages pending operations
- Automatic background sync when online
- Conflict resolution strategy for data consistency

**Why?** Many areas in India have poor connectivity. Users should be able to create requests anytime.

### 2. Feature-Based Architecture
- Each feature is self-contained module
- Clear boundaries between features
- Easy to add/remove features
- Parallel development possible

**Why?** Better maintainability and scalability as project grows.

### 3. Role-Based Access Control (RBAC)
- Granular permissions system
- Easy to add new roles
- Permission checking at UI and API level
- Future-proof for complex scenarios

**Why?** App will have multiple user types with different needs.

### 4. Multi-Language from Day 1
- i18n integrated from start
- English and Marathi support
- Easy to add more languages
- All strings externalized

**Why?** Target market includes non-English speakers. Easier to implement now than retrofit.

### 5. JWT-Based Authentication
- Stateless authentication
- Access + Refresh token pattern
- Automatic token refresh
- Session management

**Why?** Scalable, secure, mobile-friendly authentication.

---

## Database Schema Overview

### Core Tables

**users** - User accounts (society users, contractors, admins)
- Stores authentication, profile, preferences
- Role-based access control

**requests** - Construction/repair requests
- Created by society users
- Viewed by contractors
- Complete work specifications
- Status tracking

**request_photos** - Photos attached to requests
- Multiple photos per request
- Upload metadata

**request_timeline** - Status change history
- Audit trail for each request
- Who did what when

**notifications** - Push and email notifications
- Read/unread status
- Delivery tracking

**sessions** - User sessions
- Device information
- Security tracking

---

## API Architecture

### RESTful Design
```
GET    /api/v1/requests       - List requests
POST   /api/v1/requests       - Create request
GET    /api/v1/requests/:id   - Get request
PUT    /api/v1/requests/:id   - Update request
DELETE /api/v1/requests/:id   - Delete/Cancel request
```

### Authentication Flow
```
1. User enters credentials
2. Backend validates
3. Returns JWT tokens (access + refresh)
4. Client stores securely (KeyChain/KeyStore)
5. Include in Authorization header for API calls
6. Refresh when access token expires
```

### Error Handling
- Consistent error format
- Detailed error codes
- Validation errors with field-level details
- Proper HTTP status codes

---

## Security Measures

### Authentication
- ✅ Password hashing (bcrypt)
- ✅ JWT with short expiry
- ✅ Refresh token rotation
- ✅ OTP for phone verification
- ✅ Session management

### Data Protection
- ✅ HTTPS only
- ✅ Input validation (client + server)
- ✅ SQL injection prevention (ORM)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Rate limiting

### Mobile Security
- ✅ Secure storage (KeyChain/KeyStore)
- ✅ Certificate pinning
- ✅ Biometric authentication (future)
- ✅ App obfuscation

---

## Development Workflow

### Git Workflow
```
main (production) ← release/v1.0.0 ← develop ← feature/user-auth
```

### Code Review Process
1. Create feature branch
2. Implement feature
3. Write tests
4. Create pull request
5. Code review
6. Merge to develop

### Deployment Pipeline
```
Push to develop → Run tests → Build → Deploy to staging
                                              ↓
                               Test on staging
                                              ↓
                    Push to main → Deploy to production
```

---

## Testing Strategy

### Test Pyramid

```
        ╱ E2E Tests ╲           Few, slow, expensive
       ╱─────────────╲
      ╱ Integration   ╲        Some, medium speed
     ╱─────────────────╲
    ╱   Unit Tests      ╲      Many, fast, cheap
   ╱─────────────────────╲
```

### Coverage Goals
- **Unit Tests**: > 80% code coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows

---

## Phase 1 Implementation Timeline

### Week 1-2: Setup (Foundation)
- Project initialization
- Development environment
- CI/CD pipeline

### Week 3-4: Authentication (Core)
- Registration & login
- OTP verification
- Profile management

### Week 5-6: Request Management - User Side (Core)
- Create request form
- Request list & detail
- Offline support

### Week 7-8: Request Management - Contractor Side (Core)
- Request dashboard
- Filters & search
- Analytics

### Week 9: Notifications (Core)
- Push notifications
- Email notifications
- In-app notification center

### Week 10: Testing & Launch (Polish)
- Bug fixes
- Performance optimization
- Production deployment

---

## Success Metrics (Phase 1)

### Technical Metrics
- [ ] < 1% crash rate
- [ ] < 2s API response time (p95)
- [ ] > 95% notification delivery
- [ ] > 80% test coverage
- [ ] < 50MB app size

### Business Metrics
- [ ] 100+ active users
- [ ] 50+ requests submitted
- [ ] > 4.0 star rating
- [ ] < 5% user drop-off in onboarding

---

## Next Steps (Getting Started)

### For Backend Development:
1. Review [API Specification](./07-API-SPECIFICATION.md)
2. Review [Database Design](./06-DATABASE-DESIGN.md)
3. Review [Development Guidelines](./13-DEV-GUIDELINES.md)
4. Set up Python environment
5. Initialize FastAPI project structure

### For Frontend Development:
1. Review [Application Flow](./05-APP-FLOW.md)
2. Review [System Architecture](./03-ARCHITECTURE.md)
3. Review [Development Guidelines](./13-DEV-GUIDELINES.md)
4. Set up React Native environment
5. Initialize project with TypeScript

### For Project Management:
1. Review [Implementation Phases](./14-IMPLEMENTATION-PHASES.md)
2. Set up project tracking (Jira/Trello)
3. Create sprint plans
4. Assign tasks to team members

---

## Questions & Clarifications

### Answered
✅ User registration - Self-created with OTP, no approval needed  
✅ Payment - Fixed ₹500 via Paytm, Phase 2  
✅ Notifications - Push + Email  
✅ Admin app - Yes, mobile app for contractors/admins  
✅ Offline support - Yes, with sync when online  
✅ Languages - English + Marathi  
✅ Flow - Phase 1 focuses on request submission and viewing

### Pending (To discuss with stakeholders)
- ❓ Specific Paytm integration requirements (merchant ID, etc.)
- ❓ Email SMTP service provider preference
- ❓ AWS account details for S3 storage
- ❓ Firebase project setup for notifications
- ❓ Domain names for staging and production
- ❓ App store developer accounts

---

## Contact & Support

**Project Lead**: [To be assigned]  
**Backend Lead**: [To be assigned]  
**Frontend Lead**: [To be assigned]  
**QA Lead**: [To be assigned]

**Documentation Location**: `docs/` folder in repository  
**Last Updated**: December 28, 2025

---

## Appendix: Glossary

**Society User** - Building owner or resident who submits repair requests  
**Contractor** - Service provider who receives and fulfills requests  
**Request** - A repair/construction work requirement submitted by society user  
**Quotation** - Price estimate for the work provided by contractor  
**OTP** - One-Time Password for phone verification  
**JWT** - JSON Web Token for authentication  
**RBAC** - Role-Based Access Control for permissions  
**API** - Application Programming Interface  
**MVP** - Minimum Viable Product (Phase 1)

---

*This documentation is a living document and will be updated as the project evolves.*
