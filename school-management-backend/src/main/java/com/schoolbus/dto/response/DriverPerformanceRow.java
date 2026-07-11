package com.schoolbus.dto.response;

import java.math.BigDecimal;

public record DriverPerformanceRow(
        Long driverId,
        String driverName,
        long completedTrips,
        BigDecimal distanceKm,
        long emergencies
) {}
