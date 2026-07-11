package com.schoolbus.dto.response;

import com.schoolbus.entity.enums.TripStatus;

public record DriverDashboardResponse(
        String busNumber, String routeName, TripStatus tripStatus,
        Boolean locationEnabled, Boolean online, long studentsToday, Long activeTripId
) {
}
