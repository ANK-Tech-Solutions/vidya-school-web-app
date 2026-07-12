-- Portal roles: Vehicle Incharge + optional Staff/Workers.

INSERT INTO roles (name, description)
SELECT 'VEHICLE_INCHARGE', 'Fleet / vehicle operations incharge'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'VEHICLE_INCHARGE');

INSERT INTO roles (name, description)
SELECT 'STAFF', 'School staff / workers (optional portal)'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'STAFF');

INSERT INTO users (school_id, username, email, password_hash, first_name, last_name, phone, is_active, created_by, updated_by)
SELECT s.id, 'vehicle1', 'vehicle1@vidyaschool.edu',
       (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1),
       'Fleet', 'Incharge', '+91-9876543220', TRUE, 'SYSTEM', 'SYSTEM'
FROM schools s
WHERE s.code = 'DEMO001'
  AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'vehicle1');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'VEHICLE_INCHARGE'
WHERE u.username = 'vehicle1'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

INSERT INTO users (school_id, username, email, password_hash, first_name, last_name, phone, is_active, created_by, updated_by)
SELECT s.id, 'staff1', 'staff1@vidyaschool.edu',
       (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1),
       'School', 'Staff', '+91-9876543221', TRUE, 'SYSTEM', 'SYSTEM'
FROM schools s
WHERE s.code = 'DEMO001'
  AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'staff1');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'STAFF'
WHERE u.username = 'staff1'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
  );
