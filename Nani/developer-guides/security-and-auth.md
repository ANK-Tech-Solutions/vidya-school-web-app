# Security & authentication

## Authentication

- **Stateless JWT.** `POST /api/v1/auth/login` verifies the username + BCrypt password and returns an
  **access token** (short-lived JWT) and a **refresh token** (persisted in `refresh_tokens`).
- `JwtAuthenticationFilter` validates the bearer token on each request and populates the security context.
- `POST /api/v1/auth/refresh` issues a new access token; `POST /api/v1/auth/logout` revokes a refresh token.
- Passwords are hashed with `BCryptPasswordEncoder`.
- Session policy is **STATELESS**; CSRF is disabled (token-based API).

## Authorization (path rules)

From `SecurityConfig`:

| Path | Access |
| --- | --- |
| `/`, `/api/v1/auth/**`, `/actuator/health`, Swagger/api-docs | Public |
| `/api/v1/public/**` | Public |
| `/ws/**` | Public (WebSocket handshake) |
| `/api/v1/admin/buses/**`, `/routes/**`, `/drivers/**`, `/assignments/**` | **Denied** — fleet ownership is Vehicle Incharge's, not Admin |
| `/api/v1/platform/**` | `SUPER_ADMIN` |
| `/api/v1/admin/**` | `ADMIN` |
| `/api/v1/incharge/**` | `VEHICLE_INCHARGE` |
| `/api/v1/driver/**` | `DRIVER` |
| `/api/v1/teacher/**` | `TEACHER` |
| `/api/v1/staff/**` | `STAFF` |
| `/api/v1/student/**` | `STUDENT` or `PARENT` |
| `OPTIONS /**` | Public (CORS preflight) |
| anything else | Authenticated |

> **Important:** fleet management (buses, routes, drivers, driver/student assignments) is served under
> `/api/v1/incharge/**` for `VEHICLE_INCHARGE`. The matching `/api/v1/admin/*` fleet paths are explicitly
> denied. Admins create vehicle incharges (`/api/v1/admin/vehicle-incharges`) who then own the fleet.

## Multi-tenant scoping

- Non-super-admin users belong to one `school_id`. `SecurityUtils.getCurrentSchoolId()` resolves it and
  repositories filter by it (`findBySchoolId...`, `findByIdAndSchoolId`).
- `SUPER_ADMIN` has `school_id = NULL` and only operates cross-tenant via `/platform`.

## CORS

- Configured via `CorsProperties` (`CORS_ALLOWED_ORIGINS`). Origin **patterns** are supported, e.g.
  `https://*.vercel.app` to cover preview + production frontends. Credentials/methods/headers are configurable.

## Roles

Seeded roles: `SUPER_ADMIN`, `ADMIN`, `VEHICLE_INCHARGE`, `DRIVER`, `TEACHER`, `STUDENT`, `PARENT`, `STAFF`
(`user_roles` is many-to-many). Frontend uses `ROLE_HOME_PRIORITY` in `src/lib/constants.ts` to pick the home
route when a user holds multiple roles.
