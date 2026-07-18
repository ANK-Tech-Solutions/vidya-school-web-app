-- =============================================================================
-- 03_provisioning_examples.sql
-- Worked examples for provisioning a new school end-to-end via SQL.
-- Prefer the app UI/API for real provisioning; use this for demos/bootstrapping.
-- All new users get the Password@123 hash (copied from an existing user).
-- Idempotent guards included. Adjust codes/names before running.
-- =============================================================================

SET @school_code := 'GREENWOOD01';
SET @pwd := (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1);

-- 1) Create the school ---------------------------------------------------------
INSERT INTO schools (code, name, city, state, country, phone, email, timezone, is_active, created_by, updated_by)
SELECT @school_code, 'Greenwood High', 'Bengaluru', 'Karnataka', 'India',
       '+91-80-99990000', 'office@greenwood.edu', 'Asia/Kolkata', TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE code = @school_code);

SET @sid := (SELECT id FROM schools WHERE code = @school_code);

-- 2) Create the school ADMIN ---------------------------------------------------
INSERT INTO users (school_id, username, email, password_hash, first_name, last_name, phone, is_active, created_by, updated_by)
SELECT @sid, 'gw_admin', 'admin@greenwood.edu', @pwd, 'Grace', 'Wood', '+91-9000000001', TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'gw_admin');
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name = 'ADMIN'
WHERE u.username = 'gw_admin'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- 3) Create a VEHICLE_INCHARGE (owns the fleet) --------------------------------
INSERT INTO users (school_id, username, email, password_hash, first_name, last_name, phone, is_active, created_by, updated_by)
SELECT @sid, 'gw_fleet', 'fleet@greenwood.edu', @pwd, 'Frank', 'Lee', '+91-9000000002', TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'gw_fleet');
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name = 'VEHICLE_INCHARGE'
WHERE u.username = 'gw_fleet'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- 4) Create a DRIVER (+ driver profile) ---------------------------------------
INSERT INTO users (school_id, username, email, password_hash, first_name, last_name, phone, is_active, created_by, updated_by)
SELECT @sid, 'gw_driver', 'driver@greenwood.edu', @pwd, 'Dev', 'Rao', '+91-9000000003', TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'gw_driver');
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name = 'DRIVER'
WHERE u.username = 'gw_driver'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);
INSERT INTO drivers (user_id, school_id, license_number, is_online, location_enabled, created_by, updated_by)
SELECT u.id, @sid, 'KA05-2024-7654321', FALSE, FALSE, 'SYSTEM', 'SYSTEM'
FROM users u WHERE u.username = 'gw_driver'
  AND NOT EXISTS (SELECT 1 FROM drivers d WHERE d.user_id = u.id);

-- 5) Create a BUS --------------------------------------------------------------
INSERT INTO buses (school_id, bus_number, plate_number, capacity, status, created_by, updated_by)
SELECT @sid, 'GW-01', 'KA05MJ1234', 40, 'ACTIVE', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM buses WHERE plate_number = 'KA05MJ1234');

-- 6) Create a ROUTE + STOPS ----------------------------------------------------
INSERT INTO routes (school_id, name, code, is_active, created_by, updated_by)
SELECT @sid, 'North Loop', 'RT-N1', TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM routes WHERE school_id = @sid AND code = 'RT-N1');
SET @rid := (SELECT id FROM routes WHERE school_id = @sid AND code = 'RT-N1');

INSERT INTO route_stops (route_id, name, stop_order, latitude, longitude, estimated_arrival_mins)
SELECT * FROM (
  SELECT @rid AS route_id, 'Stop A' AS name, 1 AS stop_order, 12.9800000 AS latitude, 77.6100000 AS longitude, 5  AS estimated_arrival_mins UNION ALL
  SELECT @rid, 'Stop B', 2, 12.9850000, 77.6200000, 12 UNION ALL
  SELECT @rid, 'School Gate', 3, 12.9716000, 77.5946000, 25
) s
WHERE NOT EXISTS (SELECT 1 FROM route_stops rs WHERE rs.route_id = @rid AND rs.stop_order = s.stop_order);

-- 7) Assign DRIVER -> BUS (+ route) -------------------------------------------
INSERT INTO driver_bus (driver_id, bus_id, route_id, assigned_from, is_primary, is_active, created_by, updated_by)
SELECT d.id, b.id, @rid, CURDATE(), TRUE, TRUE, 'SYSTEM', 'SYSTEM'
FROM drivers d
JOIN users u ON u.id = d.user_id AND u.username = 'gw_driver'
JOIN buses b ON b.plate_number = 'KA05MJ1234'
WHERE NOT EXISTS (SELECT 1 FROM driver_bus db WHERE db.driver_id = d.id AND db.bus_id = b.id AND db.is_active = TRUE);

-- 8) (Optional) Assign a STUDENT -> BUS + STOP --------------------------------
-- Requires an existing student in this school; example only:
-- INSERT INTO student_bus (student_id, bus_id, route_id, stop_id, trip_type, assigned_from, is_active, created_by, updated_by)
-- SELECT :student_id, b.id, @rid, rs.id, 'BOTH', CURDATE(), TRUE, 'SYSTEM', 'SYSTEM'
-- FROM buses b JOIN route_stops rs ON rs.route_id = @rid AND rs.stop_order = 1
-- WHERE b.plate_number = 'KA05MJ1234';

SELECT 'Provisioning complete for' AS note, @school_code AS school;
