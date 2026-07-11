package com.schoolbus.controller;

import com.schoolbus.dto.request.BroadcastNotificationRequest;
import com.schoolbus.dto.response.ApiResponse;
import com.schoolbus.dto.response.NotificationResponse;
import com.schoolbus.dto.response.PageResponse;
import com.schoolbus.service.AdminNotificationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/notifications")
public class AdminNotificationController {

    private final AdminNotificationService service;

    public AdminNotificationController(AdminNotificationService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<PageResponse<NotificationResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(service.list(PageRequest.of(page, size)));
    }

    @GetMapping("/recent")
    public ApiResponse<List<NotificationResponse>> recent(@RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.success(service.listRecent(limit));
    }

    @PostMapping("/broadcast")
    public ApiResponse<NotificationResponse> broadcast(@Valid @RequestBody BroadcastNotificationRequest request) {
        return ApiResponse.success("Notification broadcast", service.broadcast(request));
    }
}
