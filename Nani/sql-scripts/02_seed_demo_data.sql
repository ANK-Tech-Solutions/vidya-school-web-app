-- =============================================================================
-- 02_seed_demo_data.sql
-- Reference copy of the demo seed applied by Flyway (V2/V5/V7/V8).
-- Idempotent: guarded with WHERE NOT EXISTS so it is safe to re-run.
-- Demo password for every user is Password@123 (BCrypt).
-- =============================================================================

-- Roles ----------------------------------------------------------------------
INSERT INTO roles (name, description)
SELECT * FROM (
  SELECT 'SUPER_ADMIN'      AS name, 'Platform administrator' AS description UNION ALL
  SELECT 'ADMIN',           'School administrator with full access' UNION ALL
  SELECT 'VEHICLE_INCHARGE', 'Fleet / vehicle operations incharge' UNION ALL
  SELECT 'DRIVER',          'Bus driver' UNION ALL
  SELECT 'TEACHER',         'School teacher' UNION ALL
  SELECT 'STUDENT',         'Student user' UNION ALL
  SELECT 'PARENT',          'Parent / guardian' UNION ALL
  SELECT 'STAFF',           'School staff / workers'
) r
WHERE NOT EXISTS (SELECT 1 FROM roles x WHERE x.name = r.name);

-- Demo school ----------------------------------------------------------------
INSERT INTO schools (code, name, address, city, state, postal_code, country, phone, email,
                     latitude, longitude, timezone, is_active, created_by, updated_by)
SELECT 'DEMO001', 'Vidya International School', '123 Education Lane', 'Bengaluru', 'Karnataka',
       '560001', 'India', '+91-80-12345678', 'admin@vidyaschool.edu',
       12.9716000, 77.5946000, 'Asia/Kolkata', TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE code = 'DEMO001');

-- Demo users (password_hash copied from an existing user = Password@123) ------
-- Pattern used across V5/V7/V8: reuse the 'admin' hash so all demo logins match.
-- (V2 inserts admin/driver1/parent1 directly with the BCrypt hash for Password@123.)

-- Example: super admin (school_id NULL)
INSERT INTO users (school_id, username, email, password_hash, first_name, last_name, phone, is_active, created_by, updated_by)
SELECT NULL, 'superadmin', 'superadmin@ank.tech',
       (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1),
       'Platform', 'Super Admin', '+91-9000000000', TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'superadmin');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name = 'SUPER_ADMIN'
WHERE u.username = 'superadmin'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- The full seed also creates: admin (ADMIN), driver1 (DRIVER), parent1 (PARENT),
-- teacher1 (TEACHER), student1 (STUDENT), vehicle1 (VEHICLE_INCHARGE), staff1 (STAFF),
-- plus a demo driver, parent, student, notice, and calendar event.
-- See migrations V2, V5, V7, V8 for the authoritative inserts.

-- Verify demo logins:
SELECT u.username, GROUP_CONCAT(r.name) AS roles, u.school_id
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.username IN ('superadmin','admin','vehicle1','teacher1','driver1','student1','parent1','staff1')
GROUP BY u.id, u.username, u.school_id
ORDER BY u.username;
