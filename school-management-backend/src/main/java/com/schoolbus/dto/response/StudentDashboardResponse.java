package com.schoolbus.dto.response;

import com.schoolbus.entity.enums.TripStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record StudentDashboardResponse(
        ChildStudentResponse student,
        TripStatus tripStatus,
        String busNumber,
        String driverName,
        String routeName,
        Integer etaMinutes,
        BigDecimal lastLatitude,
        BigDecimal lastLongitude,
        Instant lastUpdated,
        String currentStopName,
        String studentStopName,
        Double distanceRemainingKm,
        Long tripId
) {
}
