-- =============================================================================
-- 01_schema_reference.sql
-- Reference notes for the Flyway-managed MySQL 8 schema.
-- DO NOT run this to create the schema — Flyway (V1..V8) does that on backend boot.
-- =============================================================================

-- Migrations (school-management-backend/src/main/resources/db/migration):
--   V1  init_schema                 core transport + auth tables
--   V2  seed_data                   ADMIN/DRIVER/STUDENT/PARENT roles + DEMO001 school + demo users
--   V3  audit_columns               no-op on MySQL baseline
--   V4  demo_driver_assignments     demo driver/bus/route links
--   V5  sis_branding_academic       branding + TEACHER role + academic SIS tables
--   V6  fix_timetable_day_of_week   day_of_week -> INT
--   V7  vehicle_incharge_staff      VEHICLE_INCHARGE + STAFF roles + demo users
--   V8  super_admin_platform        SUPER_ADMIN role + superadmin (school_id NULL)
--   V9  ops_enhancements            notification types GEOFENCE/OVERSPEED/NO_SHOW + trip_stop_events table
--   V10 attendance_fingerprint      adds FINGERPRINT to attendance.method (driver scan-to-board)

-- Inspect applied migrations:
SELECT version, description, success, installed_on
FROM flyway_schema_history
ORDER BY installed_rank;

-- List all tables:
SHOW TABLES;

-- Core tables (created in V1):
--   schools, roles, users, user_roles, refresh_tokens, parents, drivers, students,
--   buses, routes, route_stops, driver_bus, student_bus, trips, trip_locations,
--   notifications, attendance, settings, audit_logs
-- Academic tables (created in V5):
--   teachers, notice_board, timetable_slots, class_attendance, homework,
--   study_materials, exams, exam_results, fee_invoices, salary_records,
--   leave_requests, calendar_events
-- Ops tables:
--   trip_stop_events (V9)  — geofence arrival log, one ARRIVED row per (trip_id, stop_id)
--   audit_logs (V1)        — now written at runtime by AuditInterceptor for admin/platform/incharge mutations

-- Verify seeded roles:
SELECT name, description FROM roles ORDER BY name;
