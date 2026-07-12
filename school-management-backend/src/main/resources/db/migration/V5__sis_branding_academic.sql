-- School branding + Teacher role + academic SIS modules (multi-tenant via school_id).

ALTER TABLE schools
    ADD COLUMN app_name VARCHAR(200) NOT NULL DEFAULT 'ANK-School-managment' AFTER name,
    ADD COLUMN app_icon_url VARCHAR(1000) NOT NULL DEFAULT 'https://drive.google.com/uc?export=view&id=1oThTuOXW8fvrXUJHNDRBARkgc10Qg5lV' AFTER logo_url;

UPDATE schools
SET app_name = 'ANK-School-managment',
    app_icon_url = 'https://drive.google.com/uc?export=view&id=1oThTuOXW8fvrXUJHNDRBARkgc10Qg5lV'
WHERE app_name IS NULL OR app_name = '' OR app_icon_url IS NULL OR app_icon_url = '';

INSERT INTO roles (name, description)
SELECT 'TEACHER', 'School teacher'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'TEACHER');

UPDATE settings
SET setting_value = 'ANK-School-managment'
WHERE setting_key = 'app.name' AND school_id IS NULL;

INSERT INTO settings (school_id, setting_key, setting_value, value_type, description, is_public)
SELECT NULL, 'app.icon_url', 'https://drive.google.com/uc?export=view&id=1oThTuOXW8fvrXUJHNDRBARkgc10Qg5lV', 'STRING', 'Default application icon URL', TRUE
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'app.icon_url' AND school_id IS NULL);

CREATE TABLE teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    school_id BIGINT NOT NULL,
    employee_code VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    subjects VARCHAR(500),
    join_date DATE,
    phone_extension VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT uk_teachers_user UNIQUE (user_id),
    CONSTRAINT uk_teachers_code UNIQUE (school_id, employee_code),
    CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_teachers_school FOREIGN KEY (school_id) REFERENCES schools (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_teachers_school ON teachers (school_id);

CREATE TABLE notice_board (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    audience VARCHAR(30) NOT NULL DEFAULT 'ALL',
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    created_by_user_id BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_notice_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_notice_user FOREIGN KEY (created_by_user_id) REFERENCES users (id),
    CONSTRAINT chk_notice_audience CHECK (audience IN ('ALL', 'STUDENTS', 'TEACHERS', 'PARENTS', 'STAFF')),
    CONSTRAINT chk_notice_priority CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_notice_school ON notice_board (school_id, published_at);

CREATE TABLE timetable_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    grade VARCHAR(20) NOT NULL,
    section VARCHAR(20) NOT NULL,
    day_of_week TINYINT NOT NULL,
    period_no INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    teacher_id BIGINT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_tt_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_tt_teacher FOREIGN KEY (teacher_id) REFERENCES teachers (id),
    CONSTRAINT uk_tt_slot UNIQUE (school_id, grade, section, day_of_week, period_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_tt_class ON timetable_slots (school_id, grade, section);

CREATE TABLE class_attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    teacher_id BIGINT,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    remarks VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_ca_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_ca_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_ca_teacher FOREIGN KEY (teacher_id) REFERENCES teachers (id),
    CONSTRAINT uk_ca_day UNIQUE (student_id, attendance_date),
    CONSTRAINT chk_ca_status CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_ca_school_date ON class_attendance (school_id, attendance_date);

CREATE TABLE homework (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    grade VARCHAR(20) NOT NULL,
    section VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE,
    attachment_url VARCHAR(1000),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_hw_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_hw_teacher FOREIGN KEY (teacher_id) REFERENCES teachers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_hw_class ON homework (school_id, grade, section);

CREATE TABLE study_materials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    grade VARCHAR(20) NOT NULL,
    section VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_url VARCHAR(1000) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_sm_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_sm_teacher FOREIGN KEY (teacher_id) REFERENCES teachers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE exams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    exam_type VARCHAR(50) NOT NULL DEFAULT 'UNIT',
    grade VARCHAR(20) NOT NULL,
    section VARCHAR(20),
    subject VARCHAR(100) NOT NULL,
    exam_date DATE NOT NULL,
    max_marks DECIMAL(8,2) NOT NULL DEFAULT 100,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_exam_school FOREIGN KEY (school_id) REFERENCES schools (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_exams_school ON exams (school_id, exam_date);

CREATE TABLE exam_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    exam_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    marks_obtained DECIMAL(8,2) NOT NULL,
    grade_letter VARCHAR(10),
    remarks VARCHAR(500),
    evaluated_by_teacher_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_er_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_er_exam FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE,
    CONSTRAINT fk_er_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_er_teacher FOREIGN KEY (evaluated_by_teacher_id) REFERENCES teachers (id),
    CONSTRAINT uk_er UNIQUE (exam_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE fee_invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DUE',
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_fee_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_fee_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT chk_fee_status CHECK (status IN ('DUE', 'PARTIAL', 'PAID', 'WAIVED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_fee_student ON fee_invoices (school_id, student_id);

CREATE TABLE salary_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    month_label VARCHAR(20) NOT NULL,
    gross_amount DECIMAL(12,2) NOT NULL,
    deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    paid_on DATE,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_sal_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_sal_teacher FOREIGN KEY (teacher_id) REFERENCES teachers (id),
    CONSTRAINT uk_sal UNIQUE (teacher_id, month_label),
    CONSTRAINT chk_sal_status CHECK (status IN ('PENDING', 'PAID', 'HOLD'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    requester_user_id BIGINT NOT NULL,
    requester_role VARCHAR(20) NOT NULL,
    student_id BIGINT,
    teacher_id BIGINT,
    leave_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    admin_remark VARCHAR(500),
    reviewed_by_user_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_leave_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_leave_user FOREIGN KEY (requester_user_id) REFERENCES users (id),
    CONSTRAINT fk_leave_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_leave_teacher FOREIGN KEY (teacher_id) REFERENCES teachers (id),
    CONSTRAINT fk_leave_reviewer FOREIGN KEY (reviewed_by_user_id) REFERENCES users (id),
    CONSTRAINT chk_leave_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_leave_school ON leave_requests (school_id, status);

CREATE TABLE calendar_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    end_date DATE,
    event_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    audience VARCHAR(30) NOT NULL DEFAULT 'ALL',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_cal_school FOREIGN KEY (school_id) REFERENCES schools (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_cal_school ON calendar_events (school_id, event_date);

-- Demo teacher (password Password@123 — same bcrypt style as other seeds updated at runtime by app if needed)
INSERT INTO users (school_id, username, email, password_hash, first_name, last_name, phone, is_active, created_by, updated_by)
SELECT s.id, 'teacher1', 'teacher1@vidyaschool.edu',
       (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1),
       'Ananya', 'Iyer', '+91-9876543213', TRUE, 'SYSTEM', 'SYSTEM'
FROM schools s
WHERE s.code = 'DEMO001'
  AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'teacher1');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'TEACHER'
WHERE u.username = 'teacher1'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

INSERT INTO teachers (user_id, school_id, employee_code, department, subjects, join_date, is_active, created_by, updated_by)
SELECT u.id, u.school_id, 'TCH001', 'Academics', 'Mathematics,Science', CURDATE(), TRUE, 'SYSTEM', 'SYSTEM'
FROM users u
WHERE u.username = 'teacher1'
  AND NOT EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = u.id);

INSERT INTO users (school_id, username, email, password_hash, first_name, last_name, phone, is_active, created_by, updated_by)
SELECT s.id, 'student1', 'student1@vidyaschool.edu',
       (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1),
       'Aarav', 'Sharma', '+91-9876543214', TRUE, 'SYSTEM', 'SYSTEM'
FROM schools s
WHERE s.code = 'DEMO001'
  AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'student1');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'STUDENT'
WHERE u.username = 'student1'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

UPDATE students st
JOIN users u ON u.username = 'student1'
SET st.user_id = u.id
WHERE st.student_code = 'STU001' AND st.user_id IS NULL;

INSERT INTO notice_board (school_id, title, body, audience, priority, created_by_user_id, created_by, updated_by)
SELECT s.id, 'Welcome to ANK School Management',
       'Your school portal is ready. Check timetable, fees, notices, and live bus tracking from your dashboard.',
       'ALL', 'HIGH', u.id, 'SYSTEM', 'SYSTEM'
FROM schools s
JOIN users u ON u.username = 'admin' AND u.school_id = s.id
WHERE s.code = 'DEMO001'
  AND NOT EXISTS (SELECT 1 FROM notice_board n WHERE n.school_id = s.id AND n.title = 'Welcome to ANK School Management');

INSERT INTO calendar_events (school_id, title, description, event_date, event_type, audience, created_by, updated_by)
SELECT s.id, 'Parent-Teacher Meeting', 'Discuss student progress with class teachers.',
       DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'MEETING', 'ALL', 'SYSTEM', 'SYSTEM'
FROM schools s
WHERE s.code = 'DEMO001'
  AND NOT EXISTS (SELECT 1 FROM calendar_events c WHERE c.school_id = s.id AND c.title = 'Parent-Teacher Meeting');
