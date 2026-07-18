package com.schoolbus.controller;

import com.schoolbus.dto.request.*;
import com.schoolbus.dto.response.*;
import com.schoolbus.service.DriverService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/driver")
public class DriverController {
    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping("/dashboard")
    public ApiResponse<DriverDashboardResponse> dashboard() {
        return ApiResponse.success(driverService.dashboard());
    }

    @GetMapping("/profile")
    public ApiResponse<DriverProfileResponse> profile() {
        return ApiResponse.success(driverService.profile());
    }

    @PutMapping("/profile")
    public ApiResponse<DriverProfileResponse> updateProfile(@RequestBody DriverProfileUpdateRequest request) {
        return ApiResponse.success("Profile updated", driverService.updateProfile(request));
    }

    @PutMapping("/fcm-token")
    public ApiResponse<Void> updateFcmToken(@Valid @RequestBody FcmTokenRequest request) {
        driverService.updateFcmToken(request);
        return ApiResponse.success("FCM token updated", null);
    }

    @GetMapping("/bus")
    public ApiResponse<AssignedBusResponse> bus() {
        return ApiResponse.success(driverService.assignedBus());
    }

    @GetMapping("/route")
    public ApiResponse<AssignedRouteResponse> route() {
        return ApiResponse.success(driverService.assignedRoute());
    }

    @GetMapping("/students/today")
    public ApiResponse<List<TodayStudentResponse>> studentsToday() {
        return ApiResponse.success(driverService.todayStudents());
    }

    /** Compatibility alias for older clients. */
    @GetMapping("/students")
    public ApiResponse<List<TodayStudentResponse>> studentsAlias() {
        return studentsToday();
    }

    @PostMapping("/location/enable")
    public ApiResponse<Void> enableLocation() {
        driverService.enableLocation();
        return ApiResponse.success("Location sharing enabled", null);
    }

    @PostMapping("/location/disable")
    public ApiResponse<Void> disableLocation() {
        driverService.disableLocation();
        return ApiResponse.success("Location sharing disabled", null);
    }

    @PostMapping("/location")
    public ApiResponse<Void> updateLocation(@Valid @RequestBody LocationUpdateRequest request) {
        driverService.updateLocation(request);
        return ApiResponse.success("Location updated", null);
    }

    @PostMapping({"/trips/start", "/trip/start"})
    public ResponseEntity<ApiResponse<TripResponse>> startTrip(@RequestBody(required = false) StartTripRequest request) {
        StartTripRequest body = request == null ? new StartTripRequest(null) : request;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Trip started", driverService.startTrip(body)));
    }

    @PostMapping({"/trips/end", "/trip/end"})
    public ApiResponse<TripResponse> endTrip() {
        return ApiResponse.success("Trip completed", driverService.endTrip());
    }

    @PostMapping({"/trips/sos", "/trip/sos"})
    public ApiResponse<Void> sos(@RequestBody(required = false) SosRequest request) {
        driverService.sendSos(request == null ? new SosRequest(null, null, null) : request);
        return ApiResponse.success("Emergency alert sent", null);
    }

    @GetMapping("/trips/history")
    public ApiResponse<PageResponse<TripResponse>> history(@RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(PageResponse.from(driverService.tripHistory(PageRequest.of(page, size))));
    }

    @GetMapping({"/trips/active", "/trip/current"})
    public ApiResponse<TripResponse> activeTrip() {
        return ApiResponse.success(driverService.activeTrip());
    }

    @PostMapping("/route/stops")
    public ResponseEntity<ApiResponse<RouteStopResponse>> addStop(@Valid @RequestBody DriverAddStopRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stop added", driverService.addStopFromLocation(request)));
    }

    @PostMapping("/students/{studentId}/board")
    public ApiResponse<Void> markBoarded(@PathVariable Long studentId) {
        driverService.markBoarding(studentId, true);
        return ApiResponse.success("Student marked as boarded", null);
    }

    @PostMapping("/students/{studentId}/absent")
    public ApiResponse<Void> markAbsent(@PathVariable Long studentId) {
        driverService.markBoarding(studentId, false);
        return ApiResponse.success("Student marked as absent", null);
    }

    @PostMapping("/students/scan")
    public ApiResponse<ScanBoardingResponse> scan(@Valid @RequestBody ScanBoardingRequest request) {
        ScanBoardingResponse result = driverService.scanBoarding(request.code(), request.method());
        String message = result.alreadyBoarded() ? result.name() + " was already on board" : result.name() + " boarded";
        return ApiResponse.success(message, result);
    }
}
