# Database & migrations

- **Engine:** MySQL 8 (InnoDB, `utf8mb4`), local or AWS RDS.
- **Migrations:** Flyway, run automatically on backend startup from
  `school-management-backend/src/main/resources/db/migration`.
- Never edit an already-applied migration; add a new `V<n>__description.sql`.

## Migration history

| Version | File | What it does |
| --- | --- | --- |
| V1 | `V1__init_schema.sql` | Core schema: schools, roles, users, user_roles, refresh_tokens, parents, drivers, students, buses, routes, route_stops, driver_bus, student_bus, trips, trip_locations, notifications, attendance, settings, audit_logs |
| V2 | `V2__seed_data.sql` | Seed roles (ADMIN/DRIVER/STUDENT/PARENT), demo school `DEMO001`, users `admin`/`driver1`/`parent1`, a driver, parent, student, and settings |
| V3 | `V3__audit_columns.sql` | No-op on MySQL baseline (audit columns already in V1) |
| V4 | `V4__demo_driver_assignments.sql` | Demo driver/bus/route assignments |
| V5 | `V5__sis_branding_academic.sql` | School branding (`app_name`, `app_icon_url`), TEACHER role + `teacher1`/`student1`, academic tables (teachers, notice_board, timetable_slots, class_attendance, homework, study_materials, exams, exam_results, fee_invoices, salary_records, leave_requests, calendar_events) |
| V6 | `V6__fix_timetable_day_of_week_type.sql` | `timetable_slots.day_of_week` → `INT` |
| V7 | `V7__vehicle_incharge_staff_roles.sql` | VEHICLE_INCHARGE + STAFF roles; demo `vehicle1`, `staff1` |
| V8 | `V8__super_admin_platform.sql` | SUPER_ADMIN role + demo `superadmin` (school_id NULL) |
| V9 | `V9__ops_enhancements.sql` | Adds notification types `GEOFENCE`, `OVERSPEED`, `NO_SHOW`; new `trip_stop_events` table (geofence-arrival de-dupe / stop progress log) |
| V10 | `V10__attendance_fingerprint.sql` | Adds `FINGERPRINT` to the `attendance.method` check constraint (driver scan-to-board) |

## Table groups

**Auth & tenancy:** `schools`, `roles`, `users`, `user_roles`, `refresh_tokens`.

**Transport:** `drivers`, `buses`, `routes`, `route_stops`, `driver_bus`, `student_bus`, `trips`,
`trip_locations`, `trip_stop_events`.

**People & academics:** `parents`, `students`, `teachers`, `class_attendance`, `timetable_slots`, `homework`,
`study_materials`, `exams`, `exam_results`, `fee_invoices`, `salary_records`, `leave_requests`.

**Communication & ops:** `notifications`, `notice_board`, `calendar_events`, `attendance`, `settings`,
`audit_logs`.

## Enum-like check constraints

| Column | Allowed values |
| --- | --- |
| `buses.status` | ACTIVE, MAINTENANCE, INACTIVE, RETIRED |
| `student_bus.trip_type` | PICKUP, DROPOFF, BOTH |
| `trips.trip_type` | MORNING, EVENING, SPECIAL |
| `trips.status` | SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, EMERGENCY |
| `attendance.method` | QR, RFID, FACE, FINGERPRINT, MANUAL, GEOFENCE |
| `attendance.event_type` | BOARDING, ALIGHTING, PRESENT, ABSENT |
| `notifications.type` | BUS_STARTED, BUS_APPROACHING, STUDENT_PICKED, STUDENT_DROPPED, TRIP_COMPLETED, EMERGENCY, GENERAL, ATTENDANCE, SYSTEM, GEOFENCE, OVERSPEED, NO_SHOW |
| `class_attendance.status` | PRESENT, ABSENT, LATE, EXCUSED |
| `leave_requests.status` | PENDING, APPROVED, REJECTED, CANCELLED |
| `fee_invoices.status` | DUE, PARTIAL, PAID, WAIVED |

## Multi-tenancy rule

Every school-owned table carries `school_id`. Queries in admin/incharge/driver/teacher/student flows are
filtered by the caller's school. `SUPER_ADMIN` users have `school_id = NULL` and operate cross-tenant only via
`/platform`.

## Operational tables

- **`audit_logs`** (defined in V1) is now populated at runtime by `AuditInterceptor`: every successful
  `POST/PUT/PATCH/DELETE` on `/api/v1/admin/**`, `/api/v1/platform/**`, and `/api/v1/incharge/**` records the
  actor (`user_id`), `school_id`, `action` (`METHOD /path`), controller `entity_type`, `ip_address`, and
  `user_agent`. Read back via `GET /api/v1/admin/audit-logs`.
- **`trip_stop_events`** de-duplicates geofence arrivals: one `ARRIVED` row per `(trip_id, stop_id)`. Written by
  `TripEventService` while ingesting driver GPS, and used to fan out `BUS_APPROACHING` and derive `NO_SHOW`
  alerts. No-shows also write an `attendance` row (`method=GEOFENCE`, `event_type=ABSENT`).

See ready-to-run SQL in [`../sql-scripts/`](../sql-scripts/).
