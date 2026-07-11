package com.schoolbus.controller;

import com.schoolbus.dto.request.FcmTokenRequest;
import com.schoolbus.dto.response.*;
import com.schoolbus.service.StudentPortalService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/student")
public class StudentController {
    private final StudentPortalService service;
    public StudentController(StudentPortalService service) { this.service = service; }

    @GetMapping("/dashboard")
    public ApiResponse<StudentDashboardResponse> dashboard(@RequestParam(required = false) Long studentId) { return ApiResponse.success(service.dashboard(studentId)); }
    @GetMapping("/children")
    public ApiResponse<List<ChildStudentResponse>> children() { return ApiResponse.success(service.children()); }
    @GetMapping("/profile")
    public ApiResponse<StudentProfileResponse> profile(@RequestParam(required = false) Long studentId) { return ApiResponse.success(service.profile(studentId)); }
    @GetMapping("/bus")
    public ApiResponse<BusDetailsResponse> bus(@RequestParam(required = false) Long studentId) { return ApiResponse.success(service.bus(studentId)); }
    @GetMapping("/driver")
    public ApiResponse<DriverDetailsResponse> driver(@RequestParam(required = false) Long studentId) { return ApiResponse.success(service.driver(studentId)); }
    @GetMapping("/route")
    public ApiResponse<RouteDetailsResponse> route(@RequestParam(required = false) Long studentId) { return ApiResponse.success(service.route(studentId)); }
    @GetMapping("/tracking")
    public ApiResponse<LiveTrackingResponse> tracking(@RequestParam(required = false) Long studentId) { return ApiResponse.success(service.tracking(studentId)); }
    @GetMapping("/attendance")
    public ApiResponse<PageResponse<AttendanceResponse>> attendance(@RequestParam(required = false) Long studentId,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(PageResponse.from(service.attendance(studentId, PageRequest.of(page, size))));
    }
    @GetMapping("/trips/history")
    public ApiResponse<PageResponse<TripHistoryResponse>> tripHistory(@RequestParam(required = false) Long studentId,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(PageResponse.from(service.tripHistory(studentId, PageRequest.of(page, size))));
    }
    @GetMapping("/notifications")
    public ApiResponse<PageResponse<NotificationResponse>> notifications(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(PageResponse.from(service.notifications(PageRequest.of(page, size))));
    }
    @PutMapping("/fcm-token")
    public ApiResponse<Void> updateFcmToken(@Valid @RequestBody FcmTokenRequest request) {
        service.updateFcmToken(request);
        return ApiResponse.success("FCM token updated", null);
    }
    @PatchMapping("/notifications/{id}/read")
    public ApiResponse<Void> markNotificationRead(@PathVariable Long id) {
        service.markNotificationRead(id);
        return ApiResponse.success("Notification marked as read", null);
    }
}
