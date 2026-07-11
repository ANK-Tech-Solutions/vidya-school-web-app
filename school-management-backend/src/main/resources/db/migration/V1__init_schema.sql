-- MySQL 8 schema for the School Bus Management System.
-- All tables use InnoDB and utf8mb4 for transactional integrity and Unicode support.

CREATE TABLE schools (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(50) NOT NULL, name VARCHAR(200) NOT NULL,
    address VARCHAR(500), city VARCHAR(100), state VARCHAR(100), postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India', phone VARCHAR(20), email VARCHAR(150),
    latitude DECIMAL(10,7), longitude DECIMAL(10,7), logo_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata', is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100), updated_by VARCHAR(100),
    CONSTRAINT uk_schools_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_schools_active ON schools (is_active);
CREATE INDEX idx_schools_name ON schools (name);

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) NOT NULL, description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_roles_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, school_id BIGINT, username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL, password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, phone VARCHAR(20),
    avatar_url VARCHAR(500), is_active BOOLEAN NOT NULL DEFAULT TRUE, is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP NULL, password_changed_at TIMESTAMP NULL, failed_login_attempts INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100), updated_by VARCHAR(100),
    CONSTRAINT uk_users_username UNIQUE (username), CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES schools (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_users_school ON users (school_id);
CREATE INDEX idx_users_active ON users (is_active);
CREATE INDEX idx_users_email ON users (email);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL, role_id BIGINT NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_user_roles_role ON user_roles (role_id);

CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL, revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, device_info VARCHAR(255), ip_address VARCHAR(45),
    CONSTRAINT uk_refresh_tokens_token UNIQUE (token),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens (expires_at);

CREATE TABLE parents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, school_id BIGINT NOT NULL,
    relationship VARCHAR(50), address VARCHAR(500), emergency_contact VARCHAR(20), fcm_token VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100), updated_by VARCHAR(100),
    CONSTRAINT uk_parents_user UNIQUE (user_id),
    CONSTRAINT fk_parents_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_parents_school FOREIGN KEY (school_id) REFERENCES schools (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_parents_school ON parents (school_id);

CREATE TABLE drivers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, school_id BIGINT NOT NULL,
    license_number VARCHAR(50) NOT NULL, license_expiry DATE, experience_years INT, blood_group VARCHAR(10),
    emergency_contact VARCHAR(20), address VARCHAR(500), is_online BOOLEAN NOT NULL DEFAULT FALSE,
    location_enabled BOOLEAN NOT NULL DEFAULT FALSE, last_latitude DECIMAL(10,7),
    last_longitude DECIMAL(10,7), last_location_at TIMESTAMP NULL, fcm_token VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100), updated_by VARCHAR(100),
    CONSTRAINT uk_drivers_user UNIQUE (user_id), CONSTRAINT uk_drivers_license UNIQUE (license_number),
    CONSTRAINT fk_drivers_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_drivers_school FOREIGN KEY (school_id) REFERENCES schools (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_drivers_school ON drivers (school_id);
CREATE INDEX idx_drivers_online ON drivers (is_online);

CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT, school_id BIGINT NOT NULL, parent_id BIGINT,
    student_code VARCHAR(50) NOT NULL, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL,
    grade VARCHAR(20), section VARCHAR(20), date_of_birth DATE, gender VARCHAR(20), blood_group VARCHAR(10),
    photo_url VARCHAR(500), pickup_address VARCHAR(500), pickup_latitude DECIMAL(10,7),
    pickup_longitude DECIMAL(10,7), drop_address VARCHAR(500), drop_latitude DECIMAL(10,7),
    drop_longitude DECIMAL(10,7), rfid_tag VARCHAR(100), qr_code VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100), updated_by VARCHAR(100),
    CONSTRAINT uk_students_code UNIQUE (school_id, student_code), CONSTRAINT uk_students_rfid UNIQUE (rfid_tag),
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_students_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_students_parent FOREIGN KEY (parent_id) REFERENCES parents (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_students_school ON students (school_id);
CREATE INDEX idx_students_parent ON students (parent_id);
CREATE INDEX idx_students_grade ON students (grade, section);

CREATE TABLE buses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, school_id BIGINT NOT NULL, bus_number VARCHAR(50) NOT NULL,
    plate_number VARCHAR(50) NOT NULL, make VARCHAR(100), model VARCHAR(100), year_of_make INT,
    capacity INT NOT NULL, color VARCHAR(50), gps_device_id VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', insurance_expiry DATE, fitness_expiry DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100), updated_by VARCHAR(100),
    CONSTRAINT uk_buses_number UNIQUE (school_id, bus_number), CONSTRAINT uk_buses_plate UNIQUE (plate_number),
    CONSTRAINT fk_buses_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT chk_buses_status CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'INACTIVE', 'RETIRED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_buses_school ON buses (school_id);
CREATE INDEX idx_buses_status ON buses (status);

CREATE TABLE routes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, school_id BIGINT NOT NULL, name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL, description VARCHAR(500), start_latitude DECIMAL(10,7),
    start_longitude DECIMAL(10,7), end_latitude DECIMAL(10,7), end_longitude DECIMAL(10,7),
    estimated_duration_mins INT, distance_km DECIMAL(8,2), is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100), updated_by VARCHAR(100),
    CONSTRAINT uk_routes_code UNIQUE (school_id, code),
    CONSTRAINT fk_routes_school FOREIGN KEY (school_id) REFERENCES schools (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_routes_school ON routes (school_id);

CREATE TABLE route_stops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, route_id BIGINT NOT NULL, name VARCHAR(200) NOT NULL,
    stop_order INT NOT NULL, latitude DECIMAL(10,7) NOT NULL, longitude DECIMAL(10,7) NOT NULL,
    address VARCHAR(500), estimated_arrival_mins INT, geofence_radius_m INT DEFAULT 100,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_route_stops_order UNIQUE (route_id, stop_order),
    CONSTRAINT fk_route_stops_route FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_route_stops_route ON route_stops (route_id);

CREATE TABLE driver_bus (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, driver_id BIGINT NOT NULL, bus_id BIGINT NOT NULL, route_id BIGINT,
    assigned_from DATE NOT NULL, assigned_to DATE, is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100), updated_by VARCHAR(100),
    CONSTRAINT fk_driver_bus_driver FOREIGN KEY (driver_id) REFERENCES drivers (id),
    CONSTRAINT fk_driver_bus_bus FOREIGN KEY (bus_id) REFERENCES buses (id),
    CONSTRAINT fk_driver_bus_route FOREIGN KEY (route_id) REFERENCES routes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_driver_bus_driver ON driver_bus (driver_id);
CREATE INDEX idx_driver_bus_bus ON driver_bus (bus_id);
CREATE INDEX idx_driver_bus_active ON driver_bus (is_active);

CREATE TABLE student_bus (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, student_id BIGINT NOT NULL, bus_id BIGINT NOT NULL,
    route_id BIGINT, stop_id BIGINT, trip_type VARCHAR(20) NOT NULL DEFAULT 'BOTH',
    assigned_from DATE NOT NULL, assigned_to DATE, is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100), updated_by VARCHAR(100),
    CONSTRAINT fk_student_bus_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_student_bus_bus FOREIGN KEY (bus_id) REFERENCES buses (id),
    CONSTRAINT fk_student_bus_route FOREIGN KEY (route_id) REFERENCES routes (id),
    CONSTRAINT fk_student_bus_stop FOREIGN KEY (stop_id) REFERENCES route_stops (id),
    CONSTRAINT chk_student_bus_type CHECK (trip_type IN ('PICKUP', 'DROPOFF', 'BOTH'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_student_bus_student ON student_bus (student_id);
CREATE INDEX idx_student_bus_bus ON student_bus (bus_id);
CREATE INDEX idx_student_bus_active ON student_bus (is_active);

CREATE TABLE trips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, school_id BIGINT NOT NULL, bus_id BIGINT NOT NULL,
    driver_id BIGINT NOT NULL, route_id BIGINT NOT NULL, trip_type VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED', scheduled_start TIMESTAMP NULL,
    actual_start TIMESTAMP NULL, actual_end TIMESTAMP NULL, start_latitude DECIMAL(10,7),
    start_longitude DECIMAL(10,7), end_latitude DECIMAL(10,7), end_longitude DECIMAL(10,7),
    total_distance_km DECIMAL(8,2), students_picked INT DEFAULT 0, students_dropped INT DEFAULT 0,
    notes VARCHAR(1000), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100), updated_by VARCHAR(100),
    CONSTRAINT fk_trips_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_trips_bus FOREIGN KEY (bus_id) REFERENCES buses (id),
    CONSTRAINT fk_trips_driver FOREIGN KEY (driver_id) REFERENCES drivers (id),
    CONSTRAINT fk_trips_route FOREIGN KEY (route_id) REFERENCES routes (id),
    CONSTRAINT chk_trips_type CHECK (trip_type IN ('MORNING', 'EVENING', 'SPECIAL')),
    CONSTRAINT chk_trips_status CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EMERGENCY'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_trips_school ON trips (school_id);
CREATE INDEX idx_trips_bus ON trips (bus_id);
CREATE INDEX idx_trips_driver ON trips (driver_id);
CREATE INDEX idx_trips_status ON trips (status);
CREATE INDEX idx_trips_start ON trips (actual_start);

CREATE TABLE trip_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, trip_id BIGINT NOT NULL, latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL, accuracy DECIMAL(10,2), heading DECIMAL(6,2),
    speed DECIMAL(8,2), altitude DECIMAL(10,2), recorded_at TIMESTAMP NOT NULL,
    synced_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trip_locations_trip FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_trip_locations_trip ON trip_locations (trip_id);
CREATE INDEX idx_trip_locations_recorded ON trip_locations (recorded_at);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, school_id BIGINT NOT NULL, user_id BIGINT,
    title VARCHAR(200) NOT NULL, body VARCHAR(1000) NOT NULL, type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50), reference_id BIGINT, is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_via VARCHAR(50) DEFAULT 'IN_APP', fcm_message_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, read_at TIMESTAMP NULL,
    CONSTRAINT fk_notifications_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT chk_notifications_type CHECK (type IN ('BUS_STARTED', 'BUS_APPROACHING', 'STUDENT_PICKED', 'STUDENT_DROPPED', 'TRIP_COMPLETED', 'EMERGENCY', 'GENERAL', 'ATTENDANCE', 'SYSTEM'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_school ON notifications (school_id);
CREATE INDEX idx_notifications_read ON notifications (is_read);
CREATE INDEX idx_notifications_created ON notifications (created_at);

CREATE TABLE attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, school_id BIGINT NOT NULL, student_id BIGINT NOT NULL,
    trip_id BIGINT, bus_id BIGINT, method VARCHAR(30) NOT NULL, event_type VARCHAR(30) NOT NULL,
    recorded_at TIMESTAMP NOT NULL, latitude DECIMAL(10,7), longitude DECIMAL(10,7),
    device_id VARCHAR(100), raw_payload TEXT, verified_by BIGINT, notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_attendance_trip FOREIGN KEY (trip_id) REFERENCES trips (id),
    CONSTRAINT fk_attendance_bus FOREIGN KEY (bus_id) REFERENCES buses (id),
    CONSTRAINT fk_attendance_verifier FOREIGN KEY (verified_by) REFERENCES users (id),
    CONSTRAINT chk_attendance_method CHECK (method IN ('QR', 'RFID', 'FACE', 'MANUAL', 'GEOFENCE')),
    CONSTRAINT chk_attendance_event CHECK (event_type IN ('BOARDING', 'ALIGHTING', 'PRESENT', 'ABSENT'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_attendance_student ON attendance (student_id);
CREATE INDEX idx_attendance_trip ON attendance (trip_id);
CREATE INDEX idx_attendance_recorded ON attendance (recorded_at);
CREATE INDEX idx_attendance_method ON attendance (method);

CREATE TABLE settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, school_id BIGINT, setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT, value_type VARCHAR(30) NOT NULL DEFAULT 'STRING', description VARCHAR(500),
    is_public BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_settings_key UNIQUE (school_id, setting_key),
    CONSTRAINT fk_settings_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT chk_settings_type CHECK (value_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_settings_school ON settings (school_id);

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, school_id BIGINT, user_id BIGINT, action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100), entity_id BIGINT, old_values TEXT, new_values TEXT, ip_address VARCHAR(45),
    user_agent VARCHAR(500), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs (created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
