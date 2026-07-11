package com.schoolbus.service;

import com.schoolbus.dto.response.AttendanceReportRow;
import com.schoolbus.dto.response.DriverPerformanceRow;
import com.schoolbus.dto.response.ReportSummaryResponse;
import com.schoolbus.dto.response.TripReportRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface AdminReportService {
    Page<TripReportRow> trips(LocalDate from, LocalDate to, Pageable pageable);
    Page<AttendanceReportRow> attendance(LocalDate from, LocalDate to, Pageable pageable);
    ReportSummaryResponse summary(LocalDate from, LocalDate to);
    List<DriverPerformanceRow> driverPerformance(LocalDate from, LocalDate to);
}
