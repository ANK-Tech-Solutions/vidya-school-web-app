package com.schoolbus.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Records that a bus (trip) reached a stop's geofence, used to de-duplicate arrival notifications. */
@Entity
@Table(name = "trip_stop_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripStopEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trip_id", nullable = false)
    private Long tripId;

    @Column(name = "stop_id", nullable = false)
    private Long stopId;

    @Column(name = "event_type", nullable = false, length = 30)
    private String eventType;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @PrePersist
    void onCreate() {
        if (recordedAt == null) {
            recordedAt = Instant.now();
        }
    }
}
