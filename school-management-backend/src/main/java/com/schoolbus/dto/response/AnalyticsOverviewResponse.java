package com.schoolbus.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record AnalyticsOverviewResponse(
        long totalStudents,
        long totalTeachers,
        long activeBuses,
        long driversOnline,
        long tripsTotal,
        long tripsCompleted,
        double onTimePercent,
        long studentsTransported,
        BigDecimal feesInvoiced,
        BigDecimal feesCollected,
        BigDecimal feesOutstanding,
        double examAveragePercent,
        List<DayCount> attendanceTrend) {

    public record DayCount(String date, long present, long absent) {
    }
}
