# Production deployment guide

## Recommended: Vercel + Render + AWS RDS

For the usual cloud setup (Next.js on Vercel, Spring Boot on Render, MySQL on AWS RDS), follow **[VERCEL_RENDER.md](VERCEL_RENDER.md)**.

That guide covers env vars (`NEXT_PUBLIC_API_URL`, `CORS_ALLOWED_ORIGINS`, `DB_*`, `JWT_SECRET`), health checks, and common CORS/cold-start issues.

## Alternative: self-hosted / Docker + Nginx

Use the Spring Boot backend and Next.js frontend as separate services. Put an HTTPS reverse proxy in front so browsers use one public origin:

```text
https://bus.example.com/       -> Next.js :3000
https://bus.example.com/api/   -> Spring Boot :8080
https://bus.example.com/ws/    -> Spring Boot :8080 (WebSocket/SockJS)
```

The provided `docker-compose.yml` is a local/reference stack. It intentionally publishes Oracle, backend, and frontend ports for development. In production, remove database and backend host port mappings, use a private Docker network, and expose only Nginx ports 80/443.

## Oracle Database Free container

`gvenzl/oracle-free:23-slim` is used with a persistent `oracle_data` volume and the `FREEPDB1` pluggable database. Before first startup, set distinct strong values for:

- `ORACLE_PASSWORD` — administrative database password
- `APP_USER` and `APP_USER_PASSWORD` — application account
- backend `DB_USERNAME`, `DB_PASSWORD`, and `DB_SCHEMA`

Oracle Free has resource and feature limits. It is suitable for small deployments and demos, but establish tested backups, capacity alerts, and a restore procedure before production use. Keep the database volume on durable storage; `docker compose down -v` destroys local volumes.

Flyway runs on backend startup with `ddl-auto: validate`. Back up Oracle before deploying a migration and run migrations against a staging copy first.

## Backend

Build the JAR locally:

```bash
cd school-management-backend
./mvnw -B -DskipTests package
java -jar target/*.jar
```

Or build/run the Docker image:

```bash
docker build -t vidya-backend ./school-management-backend
docker run --env-file .env.production -p 8080:8080 vidya-backend
```

Set `SPRING_PROFILES_ACTIVE=prod`, database settings, `JWT_SECRET`, and the public CORS origin. The backend image exposes `/actuator/health`; Compose uses it as a health check. Keep the endpoint reachable only from trusted internal monitoring where possible.

## Frontend

The PWA configuration does **not** enable Next.js `output: "standalone"`. The frontend Dockerfile therefore copies production dependencies and `.next`, then runs:

```bash
npm run start
```

Build the public API URL into the image:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://bus.example.com \
  -t vidya-frontend ./school-management-frontend
```

`NEXT_PUBLIC_API_URL` is a build-time browser variable, not a runtime switch. With the sample Nginx configuration, use the same public origin (`https://bus.example.com`) so `/api` and `/ws` remain same-origin. `next start` needs a Node runner; serving `.next` directly from Nginx is not supported. Nginx serves TLS and proxies to that runner.

## HTTPS and reverse proxy

Copy and adapt [nginx.conf](nginx.conf). Provide certificates through Certbot, your cloud load balancer, or an organization-managed certificate process. The configuration forwards `/api/`, Swagger, Actuator, and `/ws/`, including WebSocket upgrade headers.

Set `CORS_ALLOWED_ORIGINS=https://bus.example.com` (used for both REST CORS and WebSocket). Origin patterns such as `https://*.vercel.app` are supported via `setAllowedOriginPatterns`.

## Secrets

Do not place production passwords, JWT secrets, Firebase credentials, or certificate keys in Git, image layers, or Compose files.

- Use Docker/Compose secrets, your cloud secret manager, or CI/CD-injected environment variables.
- Generate a random 256-bit-or-longer `JWT_SECRET`; rotate it deliberately because rotation invalidates active tokens.
- Mount Firebase service-account JSON read-only and set `FIREBASE_CREDENTIALS` to its mounted path.
- Restrict secret-file permissions and rotate database, Firebase, and TLS credentials on a schedule.

An `.env.production` file is acceptable only when it is outside version control, access-restricted, and backed up securely.

## Health checks and operations

- Oracle: the supplied `healthcheck.sh` gate delays backend startup.
- Backend: `GET /actuator/health` returns the liveness/readiness signal used by Compose.
- Frontend: Compose checks the Next.js HTTP response.
- Monitor container restarts, database disk usage, Hikari connection saturation, health status, and application logs.

Use a rolling or blue/green process for backend upgrades. Verify health and a login/critical API flow before directing traffic to a new version.

## Scaling

The backend's in-memory STOMP simple broker is appropriate for one instance. Multiple backend replicas require **sticky sessions** at the load balancer for SockJS/WebSocket connections; all clients on a single trip also need a coherent broadcast path. A future production scale-out should replace the simple broker and local rate-limit/session assumptions with shared infrastructure such as Redis (and/or an external STOMP broker), and make location fan-out distributed.

Scale frontend runners horizontally behind Nginx or a load balancer. Size backend replicas and `DB_POOL_SIZE` against Oracle's connection limit; increasing pod/container count without reducing per-instance pool size can exhaust the database.
