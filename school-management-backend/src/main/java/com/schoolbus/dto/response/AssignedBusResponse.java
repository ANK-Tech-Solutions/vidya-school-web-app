package com.schoolbus.dto.response;

import com.schoolbus.entity.Bus;
import com.schoolbus.entity.DriverBus;
import com.schoolbus.entity.enums.BusStatus;
import java.time.LocalDate;

public record AssignedBusResponse(Long assignmentId, Long id, String busNumber, String plateNumber,
                                  Integer capacity, BusStatus status, LocalDate assignedFrom) {
    public static AssignedBusResponse from(DriverBus assignment) {
        Bus bus = assignment.getBus();
        return new AssignedBusResponse(assignment.getId(), bus.getId(), bus.getBusNumber(), bus.getPlateNumber(),
                bus.getCapacity(), bus.getStatus(), assignment.getAssignedFrom());
    }
}
