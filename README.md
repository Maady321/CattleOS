# CattleOS — Production-Grade Dairy SaaS 🚀

CattleOS is a comprehensive, enterprise-quality platform designed for cattle farmers in Kerala, India. It provides advanced tracking for cattle health, milk production, breeding cycles, and more.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts, Zustand.
- **Backend**: FastAPI, PostgreSQL, SQLAlchemy, Redis, Celery.
- **Infrastructure**: Docker, Docker Compose.
- **Design**: Holstein Friesian inspired Luxury UI.

## Features

- **Digital Cattle Passport**: QR-ready profiles for every animal.
- **Health Management**: Vaccination schedules and medicine reminders via Celery.
- **Analytics**: Real-time milk production trends and feed cost analysis.
- **Localization**: Full support for Malayalam and English.
- **PWA Support**: Installable on mobile devices.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (for local frontend dev)
- Python 3.11 (for local backend dev)

### Running with Docker
1. Copy `.env.example` to `.env`.
2. Run `docker-compose up --build`.
3. Access the frontend at `http://localhost:3000` and the API docs at `http://localhost:8000/docs`.

### Local Development

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Architecture
The project follows a modular architecture:
- **Routers**: API entry points.
- **Services**: Business logic.
- **Models**: Database schema using SQLAlchemy & Pydantic.
- **Tasks**: Background processing with Celery.

## Testing
Run tests using pytest:
```bash
cd backend
pytest
```
