package com.schoolbus.dto.response;
import com.schoolbus.entity.Route;
import com.schoolbus.entity.RouteStop;
import java.math.BigDecimal;
import java.util.List;
public record RouteDetailsResponse(Long id, String name, String code, String description, BigDecimal distanceKm,
                                   Integer estimatedDurationMins, List<Stop> stops) {
    public record Stop(Long id, String name, Integer order, BigDecimal latitude, BigDecimal longitude, String address, Integer estimatedArrivalMins) { }
    public static RouteDetailsResponse from(Route r) { return new RouteDetailsResponse(r.getId(), r.getName(), r.getCode(), r.getDescription(), r.getDistanceKm(), r.getEstimatedDurationMins(), r.getStops().stream().map(s -> new Stop(s.getId(), s.getName(), s.getStopOrder(), s.getLatitude(), s.getLongitude(), s.getAddress(), s.getEstimatedArrivalMins())).toList()); }
}
