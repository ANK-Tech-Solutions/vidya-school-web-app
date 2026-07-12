# Deploy: Vercel (frontend) + Render (backend)

This guide deploys:

| Service | Platform | Source folder |
| --- | --- | --- |
| Next.js UI | **Vercel** | `school-management-frontend` |
| Spring Boot API | **Render** | `school-management-backend` |
| MySQL | **AWS RDS** (already in use) | `vidya_db` |

```text
Browser  →  https://your-app.vercel.app
                │
                │  NEXT_PUBLIC_API_URL
                ▼
         https://vidya-school-backend.onrender.com
                │
                ▼
         AWS RDS MySQL (vidya_db)
```

---

## 0. Before you start

1. Push latest code to GitHub `development` (or `main`).
2. AWS RDS security group must allow inbound **TCP 3306** from the internet (or Render IPs).  
   For demos, many teams temporarily allow `0.0.0.0/0` on 3306 with a strong password. Prefer locking this down later.
3. Have ready:
   - `DB_URL` (JDBC)
   - `DB_USERNAME` / `DB_PASSWORD`
   - A long random `JWT_SECRET` (32+ characters)

Example JDBC URL:

```text
jdbc:mysql://smart-home-db.XXXX.ap-southeast-2.rds.amazonaws.com:3306/vidya_db?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

---

## 1. Deploy backend on Render

### Option A — Blueprint (`render.yaml`)

1. Open [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
2. Connect `ANK-Tech-Solutions/vidya-school-web-app`
3. Select branch `development`
4. Apply `render.yaml`
5. Fill secret env vars when prompted (see table below)

### Option B — Manual Web Service

1. **New** → **Web Service** → connect the GitHub repo  
2. Settings:
   - **Root Directory:** `school-management-backend`
   - **Runtime:** Docker
   - **Dockerfile Path:** `./Dockerfile`
   - **Instance type:** Free (or Starter for always-on)
3. **Health Check Path:** `/actuator/health`

### Environment variables (Render)

| Key | Example / notes |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` | Full JDBC URL to AWS RDS |
| `DB_USERNAME` | RDS user |
| `DB_PASSWORD` | RDS password |
| `DB_SCHEMA` | `vidya_db` |
| `JWT_SECRET` | Long random secret |
| `CORS_ALLOWED_ORIGINS` | `https://YOUR_VERCEL_DOMAIN.vercel.app,https://*.vercel.app,http://localhost:3000` |

4. Deploy and wait until status is **Live**
5. Copy the service URL, e.g. `https://vidya-school-backend.onrender.com`
6. Confirm: `https://YOUR-RENDER-URL/actuator/health` → `{"status":"UP"}`

> Free Render services **spin down** after idle time. First request after sleep can take 30–60s.
>
> If deploy fails with **“No open ports detected”**: in the Render dashboard, **delete** any `SERVER_PORT` / fixed `PORT` override and redeploy. The app must listen on Render’s injected `$PORT` at `0.0.0.0`. Logs should show `Binding HTTP server to 0.0.0.0:…` and `Tomcat started on port(s): …`.

---

## 2. Deploy frontend on Vercel

1. Open [Vercel](https://vercel.com/) → **Add New Project** → import `vidya-school-web-app`
2. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `school-management-frontend` (click Edit)
   - **Branch:** `development`
3. **Environment Variables:**

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://YOUR-RENDER-URL` (no trailing slash) |

4. Deploy
5. Copy the Vercel URL, e.g. `https://vidya-school-web-app.vercel.app`

### Update Render CORS after Vercel URL is known

In Render → backend → Environment, set:

```text
CORS_ALLOWED_ORIGINS=https://vidya-school-web-app.vercel.app,https://*.vercel.app,http://localhost:3000
```

Redeploy the backend (or restart) so CORS picks up the change.

---

## 3. Smoke test

Use the **production** domain (`https://your-app.vercel.app`), not a preview URL like `https://vidya-school-web-xxxxx-….vercel.app`.

Preview URLs often show **“Log in to Vercel”** because [Deployment Protection / Vercel Authentication](https://vercel.com/docs/deployment-protection) is on. To open previews publicly: Project → **Deployment Protection** → disable Vercel Authentication (or add a [Protection Exception](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/deployment-protection-exceptions)).

1. Open the production Vercel URL  
2. Login: `admin` / `Password@123`  
3. Confirm admin dashboard loads  
4. Try `driver1` and `parent1`  
5. If login fails, check browser Network tab for API calls to Render and CORS errors. Ensure Render has:
   `CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://*.vercel.app,http://localhost:3000`

---

## 4. Common issues

| Problem | Fix |
| --- | --- |
| Backend can't connect to MySQL | Open RDS SG port 3306; verify JDBC URL / password |
| CORS blocked in browser | Set `CORS_ALLOWED_ORIGINS` to your exact Vercel URL + `https://*.vercel.app` |
| Frontend calls localhost | Rebuild Vercel with correct `NEXT_PUBLIC_API_URL` (build-time var) |
| API slow first time | Render free tier cold start — wait and retry |
| WebSocket / live map flaky | Free Render may idle; upgrade plan or rely on REST polling fallback |
| 502 from Render | Check Render logs; ensure health check `/actuator/health` passes |

---

## 5. Optional: custom domains

- **Vercel:** Project → Settings → Domains  
- **Render:** Service → Settings → Custom Domain  
- Then set `CORS_ALLOWED_ORIGINS` to include `https://your-domain.com` and rebuild frontend with `NEXT_PUBLIC_API_URL=https://api.your-domain.com`

---

## Security checklist

- [ ] Strong RDS password; avoid committing `.env`
- [ ] Unique production `JWT_SECRET`
- [ ] Restrict RDS SG when possible
- [ ] Change or disable demo users in production
- [ ] Prefer Render paid plan for production uptime
