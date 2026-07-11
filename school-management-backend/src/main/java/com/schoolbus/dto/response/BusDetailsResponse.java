package com.schoolbus.dto.response;
import com.schoolbus.entity.Bus;
import com.schoolbus.entity.StudentBus;
public record BusDetailsResponse(Long id, String busNumber, String plateNumber, String make, String model,
                                 Integer capacity, String color, String status, Long routeId, String routeName,
                                 Long stopId, String stopName) {
    public static BusDetailsResponse from(StudentBus a) { Bus b=a.getBus(); return new BusDetailsResponse(b.getId(), b.getBusNumber(), b.getPlateNumber(), b.getMake(), b.getModel(), b.getCapacity(), b.getColor(), b.getStatus().name(), a.getRoute()==null?null:a.getRoute().getId(), a.getRoute()==null?null:a.getRoute().getName(), a.getStop()==null?null:a.getStop().getId(), a.getStop()==null?null:a.getStop().getName()); }
}
