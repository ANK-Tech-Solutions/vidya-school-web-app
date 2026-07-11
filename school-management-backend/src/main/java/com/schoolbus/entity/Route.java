package com.schoolbus.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "routes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Route extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(length = 500)
    private String description;

    @Column(name = "start_latitude", precision = 10, scale = 7)
    private BigDecimal startLatitude;

    @Column(name = "start_longitude", precision = 10, scale = 7)
    private BigDecimal startLongitude;

    @Column(name = "end_latitude", precision = 10, scale = 7)
    private BigDecimal endLatitude;

    @Column(name = "end_longitude", precision = 10, scale = 7)
    private BigDecimal endLongitude;

    @Column(name = "estimated_duration_mins")
    private Integer estimatedDurationMins;

    @Column(name = "distance_km", precision = 8, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stopOrder ASC")
    @Builder.Default
    private List<RouteStop> stops = new ArrayList<>();

    public void addStop(RouteStop stop) {
        stops.add(stop);
        stop.setRoute(this);
    }

    public void clearStops() {
        stops.forEach(stop -> stop.setRoute(null));
        stops.clear();
    }
}
