package com.schoolbus.controller;

import com.schoolbus.dto.request.AssignDriverRequest;
import com.schoolbus.dto.request.AssignStudentRequest;
import com.schoolbus.dto.request.BusRequest;
import com.schoolbus.dto.request.DriverRequest;
import com.schoolbus.dto.request.RouteRequest;
import com.schoolbus.dto.response.ApiResponse;
import com.schoolbus.dto.response.PageResponse;
import com.schoolbus.service.AdminAssignmentService;
import com.schoolbus.service.AdminCrudService;
import com.schoolbus.service.AdminDashboardService;
import com.schoolbus.service.AdminReportService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.schoolbus.dto.request.RouteStopRequest;

/**
 * Full fleet ownership for Vehicle Incharge (buses, drivers, routes, assignments, tracking stats, reports).
 */
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
    public ApiResponse<?> buses(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.success(PageResponse.from(crud.buses(search, PageRequest.of(page, size))));
    }

    @PostMapping("/buses")
    public ResponseEntity<ApiResponse<?>> createBus(@Valid @RequestBody BusRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(crud.createBus(request)));
    }

    @PutMapping("/buses/{id}")
    public ApiResponse<?> updateBus(@PathVariable Long id, @Valid @RequestBody BusRequest request) {
        return ApiResponse.success(crud.updateBus(id, request));
    }

    @PatchMapping("/buses/{id}/deactivate")
    public ApiResponse<Void> deactivateBus(@PathVariable Long id) {
        crud.deactivateBus(id);
        return ApiResponse.success("Bus deactivated", null);
    }

    @GetMapping("/routes")
    public ApiResponse<?> routes(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.success(PageResponse.from(crud.routes(search, PageRequest.of(page, size))));
    }

    @PostMapping("/routes")
    public ResponseEntity<ApiResponse<?>> createRoute(@Valid @RequestBody RouteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(crud.createRoute(request)));
    }

    @PutMapping("/routes/{id}")
    public ApiResponse<?> updateRoute(@PathVariable Long id, @Valid @RequestBody RouteRequest request) {
        return ApiResponse.success(crud.updateRoute(id, request));
    }

    @PatchMapping("/routes/{id}/deactivate")
    public ApiResponse<Void> deactivateRoute(@PathVariable Long id) {
        crud.deactivateRoute(id);
        return ApiResponse.success("Route deactivated", null);
    }

    @PostMapping("/routes/{routeId}/stops")
    public ResponseEntity<ApiResponse<?>> addStop(@PathVariable Long routeId, @Valid @RequestBody RouteStopRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(crud.addRouteStop(routeId, request)));
    }

    @PutMapping("/routes/{routeId}/stops/{stopId}")
    public ApiResponse<?> updateStop(
            @PathVariable Long routeId, @PathVariable Long stopId, @Valid @RequestBody RouteStopRequest request) {
        return ApiResponse.success(crud.updateRouteStop(routeId, stopId, request));
    }

    @DeleteMapping("/routes/{routeId}/stops/{stopId}")
    public ApiResponse<Void> deleteStop(@PathVariable Long routeId, @PathVariable Long stopId) {
        crud.deleteRouteStop(routeId, stopId);
        return ApiResponse.success("Stop deleted", null);
    }

    @GetMapping("/drivers")
    public ApiResponse<?> drivers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.success(PageResponse.from(crud.drivers(search, PageRequest.of(page, size))));
    }

    @PostMapping("/drivers")
    public ResponseEntity<ApiResponse<?>> createDriver(@Valid @RequestBody DriverRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(crud.createDriver(request)));
    }

    @PutMapping("/drivers/{id}")
    public ApiResponse<?> updateDriver(@PathVariable Long id, @Valid @RequestBody DriverRequest request) {
        return ApiResponse.success(crud.updateDriver(id, request));
    }

    @PatchMapping("/drivers/{id}/deactivate")
    public ApiResponse<Void> deactivateDriver(@PathVariable Long id) {
        crud.deactivateDriver(id);
        return ApiResponse.success("Driver deactivated", null);
    }

    @GetMapping("/students")
    public ApiResponse<?> students(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.success(PageResponse.from(crud.students(search, null, PageRequest.of(page, size))));
    }

    @GetMapping("/assignments")
    public ApiResponse<?> assignments(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.success(PageResponse.from(assignments.list(PageRequest.of(page, size))));
    }

    @PostMapping("/assignments/drivers")
    public ResponseEntity<ApiResponse<?>> assignDriver(@Valid @RequestBody AssignDriverRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(assignments.driver(request)));
    }

    @PostMapping("/assignments/students")
    public ResponseEntity<ApiResponse<?>> assignStudent(@Valid @RequestBody AssignStudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(assignments.student(request)));
    }

    @PatchMapping("/assignments/{id}/deactivate")
    public ApiResponse<Void> deactivateAssignment(@PathVariable Long id, @RequestParam(required = false) String type) {
        assignments.deactivate(id, type);
        return ApiResponse.success("Assignment deactivated", null);
    }

    @GetMapping("/reports/summary")
    public ApiResponse<?> reportSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ApiResponse.success(reports.summary(from, to));
    }

    @GetMapping("/reports/trips")
    public ApiResponse<?> reportTrips(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.success(PageResponse.from(reports.trips(from, to, PageRequest.of(page, size))));
    }
}
