# Getting started

## 1. Open the app

- **Local development:** http://localhost:3000
- **Production:** your Vercel URL (e.g. `https://<your-app>.vercel.app`)

## 2. Log in

1. Go to `/login`.
2. Enter your **username** and **password**.
3. You're redirected automatically to the right portal for your role.

### Demo accounts

All seed users share the password `Password@123`.

| Username | Role | Lands on |
| --- | --- | --- |
| `superadmin` | SUPER_ADMIN | `/platform` |
| `admin` | ADMIN | `/admin` |
| `vehicle1` | VEHICLE_INCHARGE | `/incharge` |
| `teacher1` | TEACHER | `/teacher` |
| `driver1` | DRIVER | `/driver` |
| `student1` | STUDENT | `/student` |
| `parent1` | PARENT | `/student` |
| `staff1` | STAFF | `/staff` |

> **Example:** Log in as `superadmin` / `Password@123` → you land on the Platform portal where you can create
> schools and school admins.

## 3. Find your way around

- The **left sidebar** shows only the sections your role can access.
- The **top bar** shows your school branding and your account menu (with sign out).
- Sessions stay signed in via a refresh token; if your access token expires it renews silently.

## 4. Install as an app (optional)

On mobile Chrome/Safari, choose **Add to Home Screen**. The driver portal opens in a standalone window that's
better for on-the-road use.

## Troubleshooting login

| Symptom | Fix |
| --- | --- |
| "Invalid credentials" | Check username/password; demo password is `Password@123`. |
| Redirected back to `/login` | Session expired — sign in again. |
| Wrong portal after login | Your highest-priority role decides the home route (see roles diagram). |
