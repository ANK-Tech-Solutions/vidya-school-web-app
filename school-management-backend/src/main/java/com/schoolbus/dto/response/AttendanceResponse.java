package com.schoolbus.dto.response;
import com.schoolbus.entity.Attendance;
import com.schoolbus.entity.enums.AttendanceEventType;
import com.schoolbus.entity.enums.AttendanceMethod;
import java.time.Instant;
public record AttendanceResponse(Long id, Long tripId, Long busId, AttendanceMethod method,
                                 AttendanceEventType eventType, Instant recordedAt, String notes) {
    public static AttendanceResponse from(Attendance a) { return new AttendanceResponse(a.getId(), a.getTrip()==null?null:a.getTrip().getId(), a.getBus()==null?null:a.getBus().getId(), a.getMethod(), a.getEventType(), a.getRecordedAt(), a.getNotes()); }
}
