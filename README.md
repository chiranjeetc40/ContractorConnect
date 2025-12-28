# ContractorConnect

A comprehensive mobile application connecting building societies with civil work contractors.

## Project Structure

```
ContractorConnect/
├── backend/              # Python FastAPI backend
├── mobile/               # React Native mobile app
├── docs/                 # Project documentation
├── scripts/              # Utility scripts
└── README.md            # This file
```

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 13+
- Redis 6+
- Android Studio (for mobile development)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Configure .env with your settings
alembic upgrade head
uvicorn app.main:app --reload
```

### Mobile App Setup
```bash
cd mobile
npm install
cp .env.example .env
# Configure .env with your settings
npm run android
```

## Documentation

Complete documentation is available in the [docs/](./docs) folder:
- [Executive Summary](./docs/EXECUTIVE-SUMMARY.md)
- [Quick Start Guide](./docs/00-QUICK-START.md)
- [API Documentation](./docs/07-API-SPECIFICATION.md)
- [Implementation Progress](./docs/PROJECT-CHECKLIST.md)

## Development Status

**Current Phase**: Phase 1 - Week 1 (Project Setup)  
**Progress**: Setting up backend and mobile infrastructure

See [PROJECT-CHECKLIST.md](./docs/PROJECT-CHECKLIST.md) for detailed progress.

## Tech Stack

**Backend**: Python FastAPI, PostgreSQL, Redis, SQLAlchemy  
**Mobile**: React Native, TypeScript, Redux Toolkit, WatermelonDB  
**DevOps**: GitHub Actions, Docker

## License

Proprietary - All rights reserved

---
*Last Updated: December 28, 2025*
