package com.schoolbus.dto.response;

import com.schoolbus.entity.enums.TripStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record TripReplayResponse(
        Long tripId,
        String busNumber,
        String driverName,
        String routeName,
        TripStatus status,
        Instant startedAt,
        Instant endedAt,
        BigDecimal totalDistanceKm,
        List<TrackingStopResponse> stops,
        List<Point> points) {

    public record Point(BigDecimal latitude, BigDecimal longitude, BigDecimal speed, BigDecimal heading,
                        Instant recordedAt) {
    }
}
