-- Operational enhancements:
--   * new notification types for geofence arrival, overspeed, and no-show alerts
--   * trip_stop_events table to de-duplicate geofence arrivals and log stop progress

ALTER TABLE notifications DROP CHECK chk_notifications_type;
ALTER TABLE notifications ADD CONSTRAINT chk_notifications_type CHECK (
    type IN ('BUS_STARTED', 'BUS_APPROACHING', 'STUDENT_PICKED', 'STUDENT_DROPPED', 'TRIP_COMPLETED',
             'EMERGENCY', 'GENERAL', 'ATTENDANCE', 'SYSTEM', 'GEOFENCE', 'OVERSPEED', 'NO_SHOW')
);

CREATE TABLE trip_stop_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    stop_id BIGINT NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tse_trip FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
    CONSTRAINT fk_tse_stop FOREIGN KEY (stop_id) REFERENCES route_stops (id),
    CONSTRAINT uk_tse UNIQUE (trip_id, stop_id, event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_tse_trip ON trip_stop_events (trip_id);
