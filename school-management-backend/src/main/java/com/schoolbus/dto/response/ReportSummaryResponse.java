package com.schoolbus.dto.response;

public record ReportSummaryResponse(
        long totalTrips,
        long completedTrips,
        long emergencyTrips,
        long totalAttendance,
        long activeBuses,
        long studentsTransported
) {}
