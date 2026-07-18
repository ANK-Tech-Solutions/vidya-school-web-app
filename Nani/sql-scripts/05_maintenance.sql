-- =============================================================================
-- 05_maintenance.sql
-- Mutating maintenance operations. REVIEW each statement before running.
-- Run inside a transaction where possible and back up first.
-- =============================================================================

-- Reset a user's password to Password@123 ------------------------------------
-- Reuses an existing BCrypt hash for Password@123 (from any seeded demo user).
UPDATE users
SET password_hash = (SELECT password_hash FROM (
        SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1
    ) AS h),
    failed_login_attempts = 0,
    is_locked = FALSE
WHERE username = :username;

-- Deactivate a user (blocks login, keeps history) ----------------------------
UPDATE users SET is_active = FALSE WHERE username = :username;

-- Reactivate a user -----------------------------------------------------------
UPDATE users SET is_active = TRUE WHERE username = :username;

-- Unlock a user after too many failed logins ---------------------------------
UPDATE users SET is_locked = FALSE, failed_login_attempts = 0 WHERE username = :username;

-- Deactivate a school (all its users can no longer sign in via app logic) -----
UPDATE schools SET is_active = FALSE WHERE code = :school_code;

-- Grant a role to a user ------------------------------------------------------
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name = :role_name
WHERE u.username = :username
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Revoke a role from a user ---------------------------------------------------
DELETE ur FROM user_roles ur
JOIN users u ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id
WHERE u.username = :username AND r.name = :role_name;

-- Mark a bus as under maintenance --------------------------------------------
UPDATE buses SET status = 'MAINTENANCE' WHERE plate_number = :plate_number;

-- Clean up expired / revoked refresh tokens (housekeeping) --------------------
DELETE FROM refresh_tokens
WHERE revoked = TRUE OR expires_at < NOW();

-- Trim old trip location breadcrumbs (keep last 30 days) ----------------------
-- Large tables: run in batches on production.
DELETE FROM trip_locations
WHERE recorded_at < NOW() - INTERVAL 30 DAY;

-- End any stuck 'IN_PROGRESS' trips older than 12 hours ----------------------
UPDATE trips
SET status = 'COMPLETED', actual_end = NOW()
WHERE status = 'IN_PROGRESS' AND actual_start < NOW() - INTERVAL 12 HOUR;
