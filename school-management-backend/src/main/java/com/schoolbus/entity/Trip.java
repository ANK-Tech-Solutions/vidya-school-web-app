package com.schoolbus.entity;

import com.schoolbus.entity.enums.TripStatus;
import com.schoolbus.entity.enums.TripType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @Enumerated(EnumType.STRING)
    @Column(name = "trip_type", nullable = false, length = 20)
    private TripType tripType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private TripStatus status = TripStatus.SCHEDULED;

    @Column(name = "scheduled_start")
    private Instant scheduledStart;

    @Column(name = "actual_start")
    private Instant actualStart;

    @Column(name = "actual_end")
    private Instant actualEnd;

    @Column(name = "start_latitude", precision = 10, scale = 7)
    private BigDecimal startLatitude;

    @Column(name = "start_longitude", precision = 10, scale = 7)
    private BigDecimal startLongitude;

    @Column(name = "end_latitude", precision = 10, scale = 7)
    private BigDecimal endLatitude;

    @Column(name = "end_longitude", precision = 10, scale = 7)
    private BigDecimal endLongitude;

    @Column(name = "total_distance_km", precision = 8, scale = 2)
    private BigDecimal totalDistanceKm;

    @Column(name = "students_picked")
    @Builder.Default
    private Integer studentsPicked = 0;

    @Column(name = "students_dropped")
    @Builder.Default
    private Integer studentsDropped = 0;

    @Column(length = 1000)
    private String notes;
}
