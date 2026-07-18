# Deployment

Production runs **Frontend on Vercel**, **Backend on Render (Docker)**, and **MySQL on AWS RDS**.
The canonical project doc is [`../../docs/VERCEL_RENDER.md`](../../docs/VERCEL_RENDER.md); this is the summary.

## Backend on Render

The backend is a Docker image driven by `docker-entrypoint.sh`. Render injects a `PORT` env var (often
`10000`) and requires the app to listen on `0.0.0.0:$PORT`.

Key points that make deploys succeed:

- `application.yml` sets `server.address: 0.0.0.0` and `server.port: ${PORT:${SERVER_PORT:8080}}`.
- `docker-entrypoint.sh` binds `-Dserver.address=0.0.0.0 -Dserver.port=$PORT` and logs
  `Binding HTTP server to 0.0.0.0:<port>`.
- Do **not** hard-code `SERVER_PORT` in `Dockerfile` / `render.yaml` / Render dashboard — that breaks Render's
  port detection ("No open ports detected").

### Backend env vars (Render)

| Variable | Value |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` | Full JDBC URL to AWS RDS MySQL |
| `DB_USERNAME`, `DB_PASSWORD`, `DB_SCHEMA` | RDS credentials |
| `JWT_SECRET` | Strong secret |
| `CORS_ALLOWED_ORIGINS` | e.g. `https://*.vercel.app,https://your-domain` |
| (`PORT`) | Injected by Render — leave it alone |

Verify after deploy: `https://YOUR-RENDER-URL/actuator/health` → `{"status":"UP"}`.

> Free Render services spin down when idle; the first request after sleep can take 30–60s.

## Frontend on Vercel

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Your Render backend URL (no trailing slash) |

Build uses the standard Next.js pipeline (`npm ci && npm run build`).

## Database on AWS RDS

- MySQL 8, publicly reachable from Render (or via VPC/security-group rules).
- Flyway migrations run automatically on backend startup.
- See [`../../docs/AWS_RDS_SETUP.md`](../../docs/AWS_RDS_SETUP.md).

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| "No open ports detected" (Render) | Remove any fixed `SERVER_PORT`/`PORT` override; app must bind `0.0.0.0:$PORT`. Logs should show `Binding HTTP server to 0.0.0.0:…`. |
| CORS errors in browser | Add the frontend origin to `CORS_ALLOWED_ORIGINS` (patterns like `https://*.vercel.app` allowed). |
| 401 on every call | `NEXT_PUBLIC_API_URL` wrong, or token expired — check refresh flow. |
| Slow first request | Render free tier cold start. |
