package com.schoolbus.controller;

import com.schoolbus.dto.request.BusRequest;
import com.schoolbus.dto.request.RouteRequest;
import com.schoolbus.dto.response.ApiResponse;
import com.schoolbus.dto.response.PageResponse;
import com.schoolbus.service.AdminAssignmentService;
import com.schoolbus.service.AdminCrudService;
import com.schoolbus.service.AdminDashboardService;
import com.schoolbus.service.AdminReportService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/incharge")
public class VehicleInchargeController {
    private final AdminCrudService crud;
    private final AdminAssignmentService assignments;
    private final AdminDashboardService dashboard;
    private final AdminReportService reports;

    public VehicleInchargeController(
            AdminCrudService crud,
            AdminAssignmentService assignments,
            AdminDashboardService dashboard,
            AdminReportService reports) {
        this.crud = crud;
        this.assignments = assignments;
        this.dashboard = dashboard;
        this.reports = reports;
    }

    @GetMapping("/dashboard")
    public ApiResponse<?> dashboard() {
        return ApiResponse.success(dashboard.getStats());
    }

    @GetMapping("/buses")
    public ApiResponse<?> buses(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.success(PageResponse.from(crud.buses(null, PageRequest.of(page, size))));
    }

    @PostMapping("/buses")
    public ApiResponse<?> createBus(@Valid @RequestBody BusRequest request) {
        return ApiResponse.success(crud.createBus(request));
    }

    @PutMapping("/buses/{id}")
    public ApiResponse<?> updateBus(@PathVariable Long id, @Valid @RequestBody BusRequest request) {
        return ApiResponse.success(crud.updateBus(id, request));
    }

    @GetMapping("/routes")
    public ApiResponse<?> routes(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.success(PageResponse.from(crud.routes(null, PageRequest.of(page, size))));
    }

    @PostMapping("/routes")
    public ApiResponse<?> createRoute(@Valid @RequestBody RouteRequest request) {
        return ApiResponse.success(crud.createRoute(request));
    }

    @PutMapping("/routes/{id}")
    public ApiResponse<?> updateRoute(@PathVariable Long id, @Valid @RequestBody RouteRequest request) {
        return ApiResponse.success(crud.updateRoute(id, request));
    }

    @GetMapping("/drivers")
    public ApiResponse<?> drivers(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.success(PageResponse.from(crud.drivers(null, PageRequest.of(page, size))));
    }

    @GetMapping("/assignments")
    public ApiResponse<?> assignments(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.success(PageResponse.from(assignments.list(PageRequest.of(page, size))));
    }

    @GetMapping("/reports/summary")
    public ApiResponse<?> reportSummary() {
        return ApiResponse.success(reports.summary(null, null));
    }
}
