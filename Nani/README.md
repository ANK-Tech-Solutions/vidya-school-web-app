# Nani — Project Knowledge Base

`Nani` is the single home for **diagrams**, **user guides**, **developer guides**, and **SQL scripts** for the
Vidya Bus **School Bus Management System**.

> Vidya Bus is a multi-tenant, role-based school transport platform for administrators, drivers, vehicle
> incharges, teachers, and parents/students. It provides school-scoped administration, trip operations, live
> GPS tracking, notifications, reporting, and an installable PWA.

## What's inside

| Folder | Contents |
| --- | --- |
| [`diagrams/`](diagrams/) | Architecture, ER diagram, role → portal map, and sequence flows (Mermaid) |
| [`user-guides/`](user-guides/) | Step-by-step, example-driven guides for each portal/role |
| [`developer-guides/`](developer-guides/) | Setup, architecture, API reference, DB & migrations, security, deployment |
| [`sql-scripts/`](sql-scripts/) | Schema reference, seed data, provisioning, ops queries, maintenance |

## Tech stack at a glance

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind, Zustand, Leaflet, PWA
- **Backend:** Spring Boot 3.4 / Java 17, Spring Security, JWT, STOMP/SockJS, Actuator
- **Data:** MySQL 8, Flyway migrations, HikariCP
- **Deployment:** Vercel (frontend) + Render (backend) + AWS RDS MySQL

## Roles & portals

| Role | Portal route | Purpose |
| --- | --- | --- |
| `SUPER_ADMIN` | `/platform` | Create schools + school admins (platform owner) |
| `ADMIN` | `/admin` | Manage one school: students, parents, teachers, buses, routes, assignments, vehicle incharges |
| `VEHICLE_INCHARGE` | `/incharge` | Fleet oversight: buses, routes, assignments, live tracking |
| `DRIVER` | `/driver` | Trip controls, GPS sharing, student manifest |
| `TEACHER` | `/teacher` | Academics + fleet-availability live tracking |
| `STUDENT` / `PARENT` | `/student` | Dashboard, attendance, live bus tracking, history |
| `STAFF` | `/staff` | Notices and calendar |

## Demo accounts

Password for all seed users: `Password@123`

| Username | Role |
| --- | --- |
| `superadmin` | SUPER_ADMIN |
| `admin` | ADMIN |
| `vehicle1` | VEHICLE_INCHARGE |
| `teacher1` | TEACHER |
| `driver1` | DRIVER |
| `student1` | STUDENT |
| `parent1` | PARENT |
| `staff1` | STAFF |

## Maintenance contract (keep Nani in sync)

**Whenever code or logic changes, update the affected files in `Nani/` in the same change.** Use this checklist:

| If you change... | Update these Nani files |
| --- | --- |
| DB schema / a Flyway migration (`V*.sql`) | `diagrams/er-diagram.md`, `developer-guides/database-and-migrations.md`, `sql-scripts/*` |
| Roles, routes, or security rules | `diagrams/roles-and-portals.md`, `developer-guides/security-and-auth.md`, `README.md` |
| A REST controller / endpoint | `developer-guides/api-reference.md` and the relevant `user-guides/*` |
| A portal page / feature/UX | The matching `user-guides/*-guide.md` and, if flow changed, `diagrams/flows.md` |
| Deployment config (Docker, Render, Vercel, env vars) | `developer-guides/deployment.md` |

A Cursor rule at `.cursor/rules/keep-nani-in-sync.mdc` reminds future edits to honor this contract.

## Feature roadmap

**Recently shipped**

- **Automatic trip events** — geofence arrivals (`BUS_APPROACHING`), overspeed alerts to admins, and no-show
  detection when the bus passes a student's stop without boarding (`TripEventService`).
- **Driver manifest check-in** — mark students boarded/absent from the driver's Today's Students page.
- **Trip replay** — scrub/playback of a completed trip's GPS breadcrumb at `/incharge/replay`.
- **Audit-log viewer** — every admin/platform/incharge mutation recorded and searchable at `/admin/audit-log`.
- **Analytics dashboard** — on-time %, utilisation, fees, exam averages, and attendance trend at `/admin/analytics`.
- **Exam grading** — teachers enter marks at `/teacher/evaluate`; students/parents see published results.

**Planned (needs external accounts/SDKs — not yet wired)**

- Push (Firebase) completion + multi-channel SMS/WhatsApp/email fallback.
- QR/RFID/face check-in; boarding reconciliation.
- Fees & payments gateway, payroll, timetable builder UI.
- Bulk import/export, native driver app, i18n/accessibility, automated E2E, data-retention jobs.

_Last synced with code: driver scan-to-board now does live camera QR (with a "marked" confirmation chip) and real in-browser face recognition against enrolled student photos (`@vladmandic/face-api`, models in `/public/models`); teacher-marked attendance is the official record (bus boarding shown separately). Prior: geofence/overspeed/no-show, trip replay, audit log, analytics, exam grading._
