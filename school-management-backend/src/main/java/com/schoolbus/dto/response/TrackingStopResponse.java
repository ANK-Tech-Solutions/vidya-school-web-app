package com.schoolbus.dto.response;

import com.schoolbus.entity.RouteStop;
import java.math.BigDecimal;

public record TrackingStopResponse(
        Long id,
        String name,
        Integer stopOrder,
        BigDecimal latitude,
        BigDecimal longitude,
        String address,
        Integer estimatedArrivalMins) {
    public static TrackingStopResponse from(RouteStop stop) {
        return new TrackingStopResponse(
                stop.getId(),
                stop.getName(),
                stop.getStopOrder(),
                stop.getLatitude(),
                stop.getLongitude(),
                stop.getAddress(),
                stop.getEstimatedArrivalMins());
    }
}
