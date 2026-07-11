package com.schoolbus.dto.response;

import com.schoolbus.entity.enums.AttendanceEventType;
import com.schoolbus.entity.enums.AttendanceMethod;

import java.time.Instant;

public record AttendanceReportRow(
        Long attendanceId,
        Instant recordedAt,
        String studentName,
        String studentCode,
        String busNumber,
        Long tripId,
        AttendanceEventType eventType,
        AttendanceMethod method
) {}
