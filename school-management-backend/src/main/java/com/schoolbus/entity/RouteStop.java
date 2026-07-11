package com.schoolbus.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "route_stops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "stop_order", nullable = false)
    private Integer stopOrder;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(length = 500)
    private String address;

    @Column(name = "estimated_arrival_mins")
    private Integer estimatedArrivalMins;

    @Column(name = "geofence_radius_m")
    @Builder.Default
    private Integer geofenceRadiusM = 100;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @jakarta.persistence.PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (geofenceRadiusM == null) {
            geofenceRadiusM = 100;
        }
    }
}
