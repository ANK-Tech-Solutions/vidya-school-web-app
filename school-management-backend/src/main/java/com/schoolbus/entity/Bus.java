package com.schoolbus.entity;

import com.schoolbus.entity.enums.BusStatus;
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

import java.time.LocalDate;

@Entity
@Table(name = "buses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bus extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(name = "bus_number", nullable = false, length = 50)
    private String busNumber;

    @Column(name = "plate_number", nullable = false, unique = true, length = 50)
    private String plateNumber;

    @Column(length = 100)
    private String make;

    @Column(length = 100)
    private String model;

    @Column(name = "year_of_make")
    private Integer yearOfMake;

    @Column(nullable = false)
    private Integer capacity;

    @Column(length = 50)
    private String color;

    @Column(name = "gps_device_id", length = 100)
    private String gpsDeviceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private BusStatus status = BusStatus.ACTIVE;

    @Column(name = "insurance_expiry")
    private LocalDate insuranceExpiry;

    @Column(name = "fitness_expiry")
    private LocalDate fitnessExpiry;
}
