-- Platform SUPER_ADMIN for creating schools and school admins.

INSERT INTO roles (name, description)
SELECT 'SUPER_ADMIN', 'Platform administrator — manage schools and school admins'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'SUPER_ADMIN');

INSERT INTO users (school_id, username, email, password_hash, first_name, last_name, phone, is_active, created_by, updated_by)
SELECT NULL, 'superadmin', 'superadmin@ank.tech',
       (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1),
       'Platform', 'Super Admin', '+91-9000000000', TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'superadmin');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'SUPER_ADMIN'
WHERE u.username = 'superadmin'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
  );
