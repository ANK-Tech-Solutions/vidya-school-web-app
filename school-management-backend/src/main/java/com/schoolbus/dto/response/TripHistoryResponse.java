package com.schoolbus.dto.response;
import com.schoolbus.entity.Trip;
import com.schoolbus.entity.enums.TripStatus;
import com.schoolbus.entity.enums.TripType;
import java.time.Instant;
public record TripHistoryResponse(Long id, String busNumber, String driverName, String routeName, TripType tripType,
                                  TripStatus status, Instant scheduledStart, Instant actualStart, Instant actualEnd) {
    public static TripHistoryResponse from(Trip t) { return new TripHistoryResponse(t.getId(), t.getBus().getBusNumber(), t.getDriver().getUser().getFullName(), t.getRoute().getName(), t.getTripType(), t.getStatus(), t.getScheduledStart(), t.getActualStart(), t.getActualEnd()); }
}
