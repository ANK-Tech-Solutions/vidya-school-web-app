package com.schoolbus.controller;

import com.schoolbus.dto.response.ApiResponse;
import com.schoolbus.dto.response.AttendanceReportRow;
import com.schoolbus.dto.response.DriverPerformanceRow;
import com.schoolbus.dto.response.PageResponse;
import com.schoolbus.dto.response.ReportSummaryResponse;
import com.schoolbus.dto.response.TripReportRow;
import com.schoolbus.service.AdminReportService;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/reports")
public class AdminReportController {
    private final AdminReportService reports;

    public AdminReportController(AdminReportService reports) {
        this.reports = reports;
    }

    @GetMapping("/trips")
    public ApiResponse<PageResponse<TripReportRow>> trips(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(PageResponse.from(reports.trips(from, to, PageRequest.of(page, size))));
    }

    @GetMapping("/attendance")
    public ApiResponse<PageResponse<AttendanceReportRow>> attendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(PageResponse.from(reports.attendance(from, to, PageRequest.of(page, size))));
    }

    @GetMapping("/summary")
    public ApiResponse<ReportSummaryResponse> summary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ApiResponse.success(reports.summary(from, to));
    }

    @GetMapping("/drivers/performance")
    public ApiResponse<List<DriverPerformanceRow>> driverPerformance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ApiResponse.success(reports.driverPerformance(from, to));
    }
}
