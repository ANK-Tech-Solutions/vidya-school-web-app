-- Align timetable_slots.day_of_week with Hibernate Integer mapping (INT, not TINYINT).
ALTER TABLE timetable_slots
    MODIFY COLUMN day_of_week INT NOT NULL;
