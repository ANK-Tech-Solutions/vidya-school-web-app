# Vidya Bus — School Bus Management System

Vidya Bus is a role-based school transport platform for administrators, drivers, and parents/students. It includes school-scoped administration, trip operations, live GPS, notifications, reporting, and an installable PWA.

> Database: **MySQL** (AWS RDS supported). Schema changes are managed by Flyway.

## Delivery phases

| Phase | Delivered capability |
| --- | --- |
| 1 | Project foundation, schema, JWT authentication, UI shell |
| 2 | Admin CRUD, dashboard, bus/route and assignment management |
| 3 | Driver dashboard, profile, assigned bus/route, trip controls |
| 4 | Parent/student dashboard, attendance, and trip history |
| 5 | GPS location capture, REST fallback, STOMP/SockJS live tracking |
| 6 | In-app notifications, broadcasts, optional Firebase Cloud Messaging |
| 7 | Trip, attendance, summary, and driver-performance reports |
| 8 | Offline-capable PWA with service worker and offline fallback |
| 9 | Backend unit tests and frontend CI quality gates |
| 10 | Docker, health checks, CI, and production deployment documentation |

## Architecture

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind, Zustand, Leaflet, PWA
- **Backend:** Spring Boot 3.4 / Java 17, Spring Security, JWT, STOMP/SockJS, Actuator
- **Data:** MySQL 8, Flyway migrations, HikariCP
- **Deployment:** Vercel (frontend) + Render (backend) + AWS RDS MySQL; Docker/Nginx also documented

See [docs/VERCEL_RENDER.md](docs/VERCEL_RENDER.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/API.md](docs/API.md), [docs/ER_DIAGRAM.md](docs/ER_DIAGRAM.md), and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Run locally

### Prerequisites

- Java 17
- Node.js 20+ and npm
- MySQL 8 (local or AWS RDS)

### Backend

```bash
cd school-management-backend
# Copy .env.example to .env and set DB_* values
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

### Frontend

```bash
cd school-management-frontend
# Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:8081)
npm ci
npm run dev
```

- App: http://localhost:3000
- API / Swagger / Health: http://localhost:8081 (or your `SERVER_PORT`)

### Demo accounts

Password for all: `Password@123`

| Username | Role | Area |
| --- | --- | --- |
| `admin` | ADMIN | `/admin` |
| `driver1` | DRIVER | `/driver` |
| `parent1` | PARENT | `/student` |

## Configuration

| Variable | Purpose |
| --- | --- |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `DB_SCHEMA` | MySQL connection |
| `JWT_SECRET` | JWT signing secret (**change in production**) |
| `NEXT_PUBLIC_API_URL` | Browser API base URL |
| `FIREBASE_ENABLED`, `FIREBASE_CREDENTIALS` | Optional FCM |

See [docs/AWS_RDS_SETUP.md](docs/AWS_RDS_SETUP.md) for AWS RDS MySQL setup.

## Quality checks

```bash
cd school-management-backend && ./mvnw -B test
cd school-management-frontend && npm ci && npm run lint && npm run build && npm test
```
