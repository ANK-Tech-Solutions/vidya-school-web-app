-- =============================================================================
-- 04_common_queries.sql
-- Read-only operational queries. Safe to run anytime.
-- =============================================================================

-- Users and their roles for a school -----------------------------------------
SELECT u.id, u.username, u.email, u.is_active, GROUP_CONCAT(r.name) AS roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.school_id = (SELECT id FROM schools WHERE code = 'DEMO001')
GROUP BY u.id, u.username, u.email, u.is_active
ORDER BY u.username;

-- Active trips right now with driver + bus + route ---------------------------
SELECT t.id AS trip_id, t.status, t.trip_type, b.bus_number, r.name AS route,
       CONCAT(u.first_name, ' ', u.last_name) AS driver, t.actual_start
FROM trips t
JOIN buses b   ON b.id = t.bus_id
JOIN routes r  ON r.id = t.route_id
JOIN drivers d ON d.id = t.driver_id
JOIN users u   ON u.id = d.user_id
WHERE t.status = 'IN_PROGRESS'
ORDER BY t.actual_start DESC;

-- Latest known position per online driver ------------------------------------
SELECT d.id AS driver_id, CONCAT(u.first_name, ' ', u.last_name) AS driver,
       d.is_online, d.location_enabled, d.last_latitude, d.last_longitude, d.last_location_at
FROM drivers d
JOIN users u ON u.id = d.user_id
WHERE d.is_online = TRUE
ORDER BY d.last_location_at DESC;

-- Route with ordered stops ----------------------------------------------------
SELECT r.code AS route_code, r.name AS route_name, rs.stop_order, rs.name AS stop,
       rs.latitude, rs.longitude, rs.estimated_arrival_mins
FROM routes r
JOIN route_stops rs ON rs.route_id = r.id
WHERE r.school_id = (SELECT id FROM schools WHERE code = 'DEMO001')
ORDER BY r.code, rs.stop_order;

-- Students assigned to a bus (manifest source) -------------------------------
SELECT s.student_code, CONCAT(s.first_name, ' ', s.last_name) AS student,
       b.bus_number, rs.name AS stop, sb.trip_type
FROM student_bus sb
JOIN students s   ON s.id = sb.student_id
JOIN buses b      ON b.id = sb.bus_id
LEFT JOIN route_stops rs ON rs.id = sb.stop_id
WHERE sb.is_active = TRUE
ORDER BY b.bus_number, rs.stop_order;

-- Attendance for a student over the last 30 days -----------------------------
SELECT a.recorded_at, a.event_type, a.method, b.bus_number
FROM attendance a
LEFT JOIN buses b ON b.id = a.bus_id
WHERE a.student_id = :student_id
  AND a.recorded_at >= NOW() - INTERVAL 30 DAY
ORDER BY a.recorded_at DESC;

-- Unread notifications per user ----------------------------------------------
SELECT user_id, COUNT(*) AS unread
FROM notifications
WHERE is_read = FALSE
GROUP BY user_id
ORDER BY unread DESC;

-- Fleet status counts ---------------------------------------------------------
SELECT status, COUNT(*) AS buses
FROM buses
WHERE school_id = (SELECT id FROM schools WHERE code = 'DEMO001')
GROUP BY status;

-- Recent audit trail (who changed what) --------------------------------------
SELECT al.created_at, u.username, al.action, al.entity_type, al.ip_address
FROM audit_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.school_id = (SELECT id FROM schools WHERE code = 'DEMO001')
ORDER BY al.created_at DESC
LIMIT 100;

-- Geofence arrivals recorded for a trip --------------------------------------
SELECT e.recorded_at, rs.stop_order, rs.name
FROM trip_stop_events e
JOIN route_stops rs ON rs.id = e.stop_id
WHERE e.trip_id = :trip_id AND e.event_type = 'ARRIVED'
ORDER BY e.recorded_at;

-- Auto no-show events (bus passed stop without boarding) ---------------------
SELECT a.recorded_at, CONCAT(s.first_name, ' ', s.last_name) AS student, a.trip_id
FROM attendance a
JOIN students s ON s.id = a.student_id
WHERE a.method = 'GEOFENCE' AND a.event_type = 'ABSENT'
  AND a.school_id = (SELECT id FROM schools WHERE code = 'DEMO001')
ORDER BY a.recorded_at DESC;

-- Overspeed alerts raised -----------------------------------------------------
SELECT created_at, title, body FROM notifications
WHERE type = 'OVERSPEED'
  AND school_id = (SELECT id FROM schools WHERE code = 'DEMO001')
ORDER BY created_at DESC;
