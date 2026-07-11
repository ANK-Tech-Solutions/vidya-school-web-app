package com.schoolbus.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "trip_locations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;
    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;
    @Column(precision = 10, scale = 2)
    private BigDecimal accuracy;
    @Column(precision = 10, scale = 2)
    private BigDecimal heading;
    @Column(precision = 10, scale = 2)
    private BigDecimal speed;
    @Column(precision = 10, scale = 2)
    private BigDecimal altitude;
    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;
    @Column(name = "synced_at", nullable = false)
    private Instant syncedAt;

    @PrePersist
    void onCreate() {
        if (syncedAt == null) syncedAt = Instant.now();
    }
}
