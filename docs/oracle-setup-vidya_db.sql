-- Run as SYS / SYSTEM (or a DBA user) if the application user does not exist yet.
-- Adjust password and tablespace as needed.

-- 1) Create user/schema (skip if vidya_db already exists)
CREATE USER vidya_db IDENTIFIED BY "vidya_db"
  DEFAULT TABLESPACE users
  TEMPORARY TABLESPACE temp
  QUOTA UNLIMITED ON users;

GRANT CONNECT, RESOURCE TO vidya_db;
GRANT CREATE VIEW, CREATE SEQUENCE, CREATE PROCEDURE, CREATE TRIGGER TO vidya_db;

-- Optional (Flyway create-schemas / some Oracle versions)
-- GRANT CREATE USER TO vidya_db;

-- 2) Confirm you are looking at the right schema after app start:
--    CONNECT vidya_db/"vidya_db"@//localhost:1521/YOUR_SERVICE
--    SELECT table_name FROM user_tables ORDER BY 1;
