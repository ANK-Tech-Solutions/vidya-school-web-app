# API reference

Base path: `/api/v1`. All responses use the `ApiResponse<T>` envelope; list endpoints return `PageResponse<T>`
and accept `page` and `size` query params. Authenticate with `Authorization: Bearer <accessToken>` (except
auth + public endpoints).

## Auth (`/auth`)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/login` | Log in, returns access + refresh tokens and user |
| POST | `/auth/refresh` | Exchange refresh token for a new access token |
| POST | `/auth/logout` | Revoke a refresh token |
| GET | `/auth/me` | Current user profile + roles |

## Platform — SUPER_ADMIN (`/platform`)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/platform/schools` | List schools |
| POST | `/platform/schools` | Create school |
| PUT | `/platform/schools/{id}` | Update school |
| PATCH | `/platform/schools/{id}/deactivate` | Deactivate school |
| GET | `/platform/admins` | List school admins |
| POST | `/platform/admins` | Create school admin (ADMIN role) |
| PATCH | `/platform/admins/{id}/deactivate` | Deactivate admin |

## Admin (`/admin`)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/admin/dashboard` and `/admin/dashboard/stats` | Dashboard statistics |
| — | `/admin/students`, `/admin/parents`, `/admin/teachers` | Manage people (CRUD) |
| GET/POST/PATCH | `/admin/vehicle-incharges`, `/admin/vehicle-incharges/{id}/deactivate` | Manage fleet managers |
| — | `/admin/buses`, `/admin/routes` | Fleet & routes (CRUD) |
| — | `/admin/assignments` | Driver–bus and student–bus assignments |
| — | `/admin/notifications` | Broadcasts |
| — | `/admin/reports` | Reports |
| GET | `/admin/analytics/overview` | KPIs: on-time %, utilisation, students transported, fees invoiced/collected/outstanding, exam average, 7-day attendance trend |
| GET | `/admin/audit-logs` | Paged audit trail; optional `action` filter |

## Vehicle incharge (`/incharge`)

Buses, routes, drivers, assignments, tracking, and reports scoped to the incharge's school
(via `VehicleInchargeController`).

| Method | Path | Description |
| --- | --- | --- |
| GET | `/incharge/trips/{tripId}/replay` | Trip playback: ordered GPS breadcrumb points + route stops + trip meta |

## Driver (`/driver`)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/driver/students/today` (alias `/driver/students`) | Today's manifest (incl. `studentCode` + `photoUrl` for scan/face matching) |
| POST | `/driver/trips/start` (alias `/driver/trip/start`) | Start trip |
| POST | `/driver/trips/end` (alias `/driver/trip/end`) | End trip |
| POST | `/driver/trips/sos` (alias `/driver/trip/sos`) | Raise SOS |
| GET | `/driver/trips/active` (alias `/driver/trip/current`) | Current active trip |
| POST | `/driver/location` | Push GPS fix (lat/lng/speed/heading) — triggers geofence, overspeed & no-show events |
| POST | `/driver/students/{studentId}/board` | Mark a student boarded (writes attendance, notifies parent) |
| POST | `/driver/students/{studentId}/absent` | Mark a student absent for the active trip |
| POST | `/driver/students/scan` | Board by scanned code `{ code, method }` — matches QR / RFID-NFC tag / student code; `method` ∈ `QR,NFC,RFID,FACE,FINGERPRINT,MANUAL` |

## Teacher (`/teacher`) — AcademicController

Dashboard, attendance, notices, and `trackingStats` (online drivers, running trips, active buses, and each
driver's route with stops). Academics: `GET/POST /teacher/homework`, `/teacher/study-materials`,
`GET /teacher/exams`, `GET /teacher/students?grade=&section=`, and
`PUT /teacher/exams/{examId}/results/{studentId}` (grade entry, used by the `/teacher/evaluate` page).

## Student / parent (`/student` via StudentController)

Dashboard, tracking snapshot (`LiveTrackingResponse` with `stops[]`, current/next/your stop, ETA),
attendance, trip history, notifications. Academics reads under `/student/academic/*` include
`homework`, `exams`, `exam-results` (Results page), `timetable`, `fees`, `notices`, `calendar`, `leaves`.

## Public

`PublicBrandingController` exposes school branding (app name/icon) without auth; `RootController` and
`/actuator/health` for status.

> Keep this file in sync whenever a controller mapping changes.
