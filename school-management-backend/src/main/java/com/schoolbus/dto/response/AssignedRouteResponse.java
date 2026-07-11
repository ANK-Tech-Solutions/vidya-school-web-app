package com.schoolbus.dto.response;

import com.schoolbus.entity.DriverBus;
import com.schoolbus.entity.Route;
import java.util.List;

public record AssignedRouteResponse(
        Long assignmentId,
        Long id,
        String name,
        String code,
        String description,
        java.math.BigDecimal distanceKm,
        Integer estimatedDurationMins,
        List<RouteStopResponse> stops) {
    public static AssignedRouteResponse from(DriverBus assignment) {
        Route route = assignment.getRoute();
        return new AssignedRouteResponse(
                assignment.getId(),
                route.getId(),
                route.getName(),
                route.getCode(),
                route.getDescription(),
                route.getDistanceKm(),
                route.getEstimatedDurationMins(),
                route.getStops().stream().map(RouteStopResponse::from).toList());
    }
}
