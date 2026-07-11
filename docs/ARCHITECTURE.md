# Architecture

Vidya Bus uses a browser frontend, a Spring Boot API, a STOMP/SockJS live-update channel, and Oracle Free. The backend is school-scoped: services derive the authenticated user and operate only within that user's school context.

## Layered backend

```mermaid
flowchart TB
  UI[Next.js PWA]
  UI -->|HTTPS REST| C[Controllers]
  UI -->|STOMP/SockJS| WS[WebSocket controller]
  C --> SEC[Spring Security / JWT filter]
  WS --> WSA[WebSocket auth interceptor]
  SEC --> S[Application services]
  WSA --> S
  S --> R[Spring Data repositories]
  S --> N[Notification / FCM service]
  S --> B[Live tracking broker]
  R --> DB[(Oracle Free)]
  B -->|/topic/trips/{id}/location| UI
  B -->|/topic/school/{id}/buses| UI
  N --> FCM[Firebase Cloud Messaging\noptional]
```

- **Controllers** expose versioned REST endpoints and validate request DTOs.
- **Security** authenticates bearer tokens and enforces role/school access before business operations.
- **Services** contain domain rules for assignments, trips, tracking, reporting, and notifications.
- **Repositories/entities** map to Oracle tables. Flyway owns DDL; Hibernate validates it at startup.
- **WebSocket** uses STOMP over SockJS at `/ws`, with app messages under `/app` and subscriptions under `/topic`.

## Authentication flow

```mermaid
sequenceDiagram
  participant Browser
  participant API as Spring Boot API
  participant DB as Oracle
  Browser->>API: POST /api/v1/auth/login (username, password)
  API->>DB: Load active user, roles, and password hash
  DB-->>API: User record
  API-->>Browser: Access JWT + refresh token
  Browser->>API: API request + Authorization: Bearer access JWT
  API->>API: Validate signature, expiry, roles, school context
  API-->>Browser: Role-authorized response
  Browser->>API: POST /api/v1/auth/refresh (refresh token)
  API->>DB: Validate unrevoked, unexpired refresh token
  API-->>Browser: Rotated/current token response
  Browser->>API: POST /api/v1/auth/logout
  API->>DB: Revoke refresh token
```

Access tokens are short-lived (15 minutes by default); refresh tokens default to seven days. Production deployments must replace the development `JWT_SECRET`.

## Live tracking flow

```mermaid
sequenceDiagram
  participant Driver as Driver PWA
  participant API as Driver API
  participant DB as Oracle
  participant Broker as STOMP broker
  participant Parent as Parent PWA
  Driver->>API: POST /driver/trips/start
  API->>DB: Create active trip
  Driver->>API: POST /driver/location or SEND /app/driver/location
  API->>API: Verify DRIVER and active trip
  API->>DB: Update driver position and append trip location
  API->>Broker: Publish trip and school bus messages
  Broker-->>Parent: /topic/trips/{tripId}/location
  Broker-->>Parent: /topic/school/{schoolId}/buses
  Parent->>API: GET /student/tracking (fallback)
  API-->>Parent: Latest persisted position
```

The frontend falls back to periodic REST tracking when its live connection fails. The current broker is in-memory; see the scaling notes in [DEPLOYMENT.md](DEPLOYMENT.md) before running multiple backend replicas.
