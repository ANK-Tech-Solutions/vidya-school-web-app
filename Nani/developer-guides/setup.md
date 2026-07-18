# Local setup

## Prerequisites

- Java 17
- Node.js 20+ and npm
- MySQL 8 (local or AWS RDS)

## Backend

```bash
cd school-management-backend
# Copy .env.example to .env and set DB_* values (DB_URL, DB_USERNAME, DB_PASSWORD, DB_SCHEMA)
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
```

- On boot, **Flyway** applies migrations `V1..V8` to create the schema and seed demo data.
- API base: `http://localhost:8081` (or your `SERVER_PORT`) with base path `/api/v1`.
- Health: `http://localhost:8081/actuator/health` → `{"status":"UP"}`.

### Key backend env vars

| Variable | Purpose |
| --- | --- |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `DB_SCHEMA` | MySQL connection |
| `JWT_SECRET` | JWT signing secret (**change in production**) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins |
| `SERVER_PORT` / `PORT` | HTTP port (Render injects `PORT`) |
| `FIREBASE_ENABLED`, `FIREBASE_CREDENTIALS` | Optional Firebase Cloud Messaging |

## Frontend

```bash
cd school-management-frontend
# Set NEXT_PUBLIC_API_URL in .env.local, e.g. http://localhost:8081
npm ci
npm run dev
```

- App: `http://localhost:3000`

## Quality gates

```bash
# backend
cd school-management-backend && ./mvnw -B test

# frontend
cd school-management-frontend && npm ci && npm run lint && npm run build && npm test
```

## Demo logins

All seed users use `Password@123`: `superadmin`, `admin`, `vehicle1`, `teacher1`, `driver1`, `student1`,
`parent1`, `staff1`.
