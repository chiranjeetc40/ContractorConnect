# Project Roadmap & Milestones

## Timeline Overview

```
Phase 1 (MVP)          Phase 2               Phase 3
10 weeks              8 weeks               10 weeks
│                     │                     │
├─ Setup (2w)         ├─ Payment (2w)       ├─ Work Tracking (3w)
├─ Auth (2w)          ├─ Quotation (2w)     ├─ Ratings (3w)
├─ Requests-User (2w) ├─ Inspection (2w)    ├─ Admin Panel (3w)
├─ Requests-Con (2w)  └─ Analytics (2w)     └─ iOS App (1w)
├─ Notifications (1w)
└─ Testing (1w)
```

## Phase 1: MVP (Weeks 1-10)

### Milestone 1.1: Foundation Ready (Week 2)
**Goal**: Development environment operational

- [x] Backend API structure initialized
- [x] Database schema created
- [x] Mobile app initialized with navigation
- [x] CI/CD pipeline configured
- [x] Documentation complete

**Success Criteria**:
- ✓ Backend server runs locally
- ✓ Mobile app builds successfully
- ✓ Database migrations work
- ✓ All developers onboarded

---

### Milestone 1.2: Users Can Register (Week 4)
**Goal**: Complete authentication system

**Features**:
- User registration (Society User & Contractor)
- Phone OTP verification
- Login/Logout
- Profile management
- Language selection

**Success Criteria**:
- ✓ Users can register with OTP
- ✓ Users can login successfully
- ✓ JWT tokens generated and validated
- ✓ Profile CRUD operations work
- ✓ Both English and Marathi work

**Blockers to Address**:
- SMS/OTP service provider setup
- Secure token storage implementation

---

### Milestone 1.3: Users Can Submit Requests (Week 6)
**Goal**: Society users can create repair requests

**Features**:
- Multi-step request form
- Form validation
- Photo upload
- Offline request creation
- Request list view
- Request detail view

**Success Criteria**:
- ✓ User completes request form flow
- ✓ Photos upload successfully
- ✓ Request created offline syncs when online
- ✓ User can view their requests
- ✓ User can edit before contractor reviews

**Blockers to Address**:
- File storage setup (S3 or local)
- Offline sync strategy implementation

---

### Milestone 1.4: Contractors Can View Requests (Week 8)
**Goal**: Contractors can see and manage requests

**Features**:
- Contractor dashboard
- Request list with filters
- Search functionality
- Request detail view
- Mark as reviewed
- Basic analytics

**Success Criteria**:
- ✓ Contractor sees all incoming requests
- ✓ Filters work correctly
- ✓ Search returns relevant results
- ✓ Can mark requests as reviewed
- ✓ Analytics show accurate data

---

### Milestone 1.5: Real-time Notifications (Week 9)
**Goal**: Users receive timely updates

**Features**:
- Push notifications (FCM)
- Email notifications
- In-app notification center
- Notification preferences

**Success Criteria**:
- ✓ Contractor gets push on new request
- ✓ User gets email confirmation
- ✓ Notification opens relevant screen
- ✓ Users can configure preferences
- ✓ > 95% delivery rate

**Blockers to Address**:
- Firebase project setup
- SMTP server configuration
- Deep linking implementation

---

### Milestone 1.6: Production Launch (Week 10)
**Goal**: App available on Play Store

**Activities**:
- Complete testing (unit, integration, E2E)
- Bug fixes and optimizations
- Security audit
- Performance testing
- Play Store submission
- Production deployment

**Success Criteria**:
- ✓ All tests passing (>80% coverage)
- ✓ < 1% crash rate in staging
- ✓ API response time < 2s
- ✓ App approved on Play Store
- ✓ Production environment stable

---

## Phase 2: Enhanced Features (Weeks 11-18)

### Milestone 2.1: Payment Integration (Week 12)
**Goal**: Users can pay ₹500 fee

**Features**:
- Paytm gateway integration
- Payment flow UI
- Payment status tracking
- Receipt generation

**Success Criteria**:
- ✓ Payment completes successfully
- ✓ Payment failures handled gracefully
- ✓ Receipts generated
- ✓ > 90% payment success rate

---

### Milestone 2.2: Quotation System (Week 14)
**Goal**: Contractors can send quotations

**Features**:
- Quotation builder
- Line item management
- GST calculation
- PDF generation
- Accept/Reject flow

**Success Criteria**:
- ✓ Contractor creates quotation
- ✓ PDF generated correctly
- ✓ User receives quotation
- ✓ Accept/Reject works

---

### Milestone 2.3: Site Inspection (Week 16)
**Goal**: Engineers can conduct inspections

**Features**:
- Schedule inspection
- Assign engineer
- Inspection checklist
- Photo documentation
- Report generation

**Success Criteria**:
- ✓ Inspection scheduled
- ✓ Engineer receives task
- ✓ Photos uploaded from field
- ✓ Report generated

---

### Milestone 2.4: Advanced Analytics (Week 18)
**Goal**: Comprehensive reporting

**Features**:
- Enhanced dashboard
- Custom reports
- Export to PDF/Excel
- Scheduled reports

**Success Criteria**:
- ✓ Reports generate accurately
- ✓ Export works
- ✓ Charts display correctly

---

## Phase 3: Advanced Features (Weeks 19-28)

### Milestone 3.1: Work Progress Tracking (Week 21)
**Features**:
- Work allocation
- Progress milestones
- Progress photos
- Completion workflow

---

### Milestone 3.2: Ratings & Reviews (Week 24)
**Features**:
- Rating system
- Review management
- Contractor profiles
- Dispute resolution

---

### Milestone 3.3: Platform Administration (Week 27)
**Features**:
- Super admin dashboard
- User management
- System configuration
- Audit logs

---

### Milestone 3.4: iOS Launch (Week 28)
**Features**:
- iOS app development
- App Store submission
- Platform parity

---

## Critical Path

```
Setup → Auth → Request (User) → Request (Contractor) → Notifications → Launch
  ↓       ↓         ↓                   ↓                    ↓           ↓
Week 2  Week 4   Week 6              Week 8              Week 9     Week 10

Cannot proceed to next without completing previous milestone
```

## Risk Register

### High Priority Risks

| Risk | Phase | Impact | Mitigation | Status |
|------|-------|--------|------------|--------|
| OTP service unavailable | 1 | High | Have backup provider | 🟡 Monitor |
| Offline sync conflicts | 1 | High | Implement conflict resolution | 🟢 Addressed |
| Payment gateway issues | 2 | High | Extensive testing | 🔴 Plan needed |
| Play Store rejection | 1 | High | Follow guidelines strictly | 🟢 Addressed |

### Medium Priority Risks

| Risk | Phase | Impact | Mitigation | Status |
|------|-------|--------|------------|--------|
| Performance issues | 1 | Medium | Optimization, caching | 🟡 Monitor |
| Low user adoption | 1 | Medium | User testing, feedback | 🟡 Monitor |
| Third-party API limits | 1 | Medium | Rate limiting, quotas | 🟢 Addressed |

## Dependencies

### External Dependencies

| Dependency | Required By | Status | Notes |
|------------|-------------|--------|-------|
| SMS/OTP Provider | Week 3 | 🔴 Pending | Need to select provider |
| Firebase Project | Week 9 | 🔴 Pending | Need Google account |
| AWS/Storage | Week 5 | 🔴 Pending | For photo storage |
| SMTP Server | Week 9 | 🔴 Pending | For email notifications |
| Paytm Merchant | Week 11 | 🔴 Pending | Phase 2 requirement |
| Play Store Account | Week 10 | 🔴 Pending | For app submission |

### Internal Dependencies

| From | To | Dependency | Impact |
|------|-----|------------|--------|
| Auth | All Features | User identity | Blocking |
| Database | All Features | Data storage | Blocking |
| API | Mobile App | Backend services | Blocking |
| Offline Storage | Request Creation | Local data | Blocking |

## Resource Allocation

### Team Structure (Recommended)

```
Project Manager (1)
    │
    ├─ Backend Team (2)
    │   ├─ API Development
    │   └─ Database & Services
    │
    ├─ Frontend Team (2)
    │   ├─ UI Development
    │   └─ State Management & Offline
    │
    ├─ QA Engineer (1)
    │   └─ Testing & Quality
    │
    └─ DevOps (0.5)
        └─ CI/CD & Deployment
```

### Time Allocation by Phase

**Phase 1 (10 weeks)**:
- Backend: 40%
- Frontend: 40%
- Testing: 15%
- DevOps: 5%

**Phase 2 (8 weeks)**:
- Backend: 35%
- Frontend: 45%
- Testing: 15%
- DevOps: 5%

## Key Performance Indicators (KPIs)

### Development KPIs

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Sprint Velocity | 40 story points | - | - |
| Code Coverage | > 80% | - | - |
| Bug Resolution Time | < 48 hours | - | - |
| API Response Time | < 2s | - | - |
| Build Success Rate | > 95% | - | - |

### Business KPIs (Post-Launch)

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Active Users | 100 | 500 | 2000 |
| Requests Submitted | 50 | 200 | 1000 |
| Contractor Registrations | 20 | 100 | 300 |
| App Rating | > 4.0 | > 4.2 | > 4.5 |
| Crash Rate | < 1% | < 0.5% | < 0.2% |

## Communication Plan

### Daily
- Stand-up meetings (15 min)
- Blocker discussions
- Quick sync on Slack

### Weekly
- Sprint planning (Monday)
- Code review sessions
- Demo to stakeholders (Friday)

### Biweekly
- Sprint retrospective
- Architecture review
- Documentation update

### Monthly
- Stakeholder presentation
- Roadmap review
- Budget review

## Decision Log

| Date | Decision | Rationale | Owner |
|------|----------|-----------|-------|
| 2025-12-28 | Use FastAPI for backend | Modern, fast, great docs | Team |
| 2025-12-28 | React Native for mobile | Cross-platform, JS ecosystem | Team |
| 2025-12-28 | Offline-first architecture | Poor connectivity in target areas | Team |
| 2025-12-28 | Fixed ₹500 payment (Phase 2) | Simplify MVP, add later | Stakeholder |
| 2025-12-28 | PostgreSQL for database | Robust, scalable, feature-rich | Team |

---

## Next Review Date: Week 2 (After Foundation Milestone)

**Review Focus**:
- Technical setup complete?
- Team velocity established?
- Any blockers identified?
- Timeline adjustments needed?

---

*Last Updated: December 28, 2025*
