package com.schoolbus.dto.response;

import com.schoolbus.entity.Trip;
import com.schoolbus.entity.enums.TripStatus;
import com.schoolbus.entity.enums.TripType;
import java.time.Instant;

public record TripResponse(Long id, Long busId, String busNumber, Long routeId, String routeName,
                           TripType tripType, TripStatus status, Instant scheduledStart,
                           Instant actualStart, Instant actualEnd, Integer studentsPicked, Integer studentsDropped) {
    public static TripResponse from(Trip trip) {
        return new TripResponse(trip.getId(), trip.getBus().getId(), trip.getBus().getBusNumber(),
                trip.getRoute().getId(), trip.getRoute().getName(), trip.getTripType(), trip.getStatus(),
                trip.getScheduledStart(), trip.getActualStart(), trip.getActualEnd(),
                trip.getStudentsPicked(), trip.getStudentsDropped());
    }
}
