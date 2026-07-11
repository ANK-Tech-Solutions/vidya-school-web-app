package com.schoolbus.dto.response;

import com.schoolbus.entity.enums.TripStatus;

public record DriverDashboardResponse(
        AssignedBusResponse assignedBus,
        AssignedRouteResponse assignedRoute,
        TripResponse activeTrip,
        Boolean locationEnabled,
        Boolean online,
        long todayStudents,
        /** Kept for older clients */
        String busNumber,
        String routeName,
        TripStatus tripStatus,
        Long activeTripId
) {
}
