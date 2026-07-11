package com.schoolbus.dto.response;

import com.schoolbus.entity.enums.TripStatus;
import com.schoolbus.entity.enums.TripType;

import java.math.BigDecimal;
import java.time.Instant;

public record TripReportRow(
        Long tripId,
        Instant startedAt,
        Instant endedAt,
        String busNumber,
        String driverName,
        String routeName,
        TripType tripType,
        TripStatus status,
        BigDecimal distanceKm,
        Integer studentsPicked,
        Integer studentsDropped
) {}
