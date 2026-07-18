package com.schoolbus.controller;

import com.schoolbus.dto.response.AnalyticsOverviewResponse;
import com.schoolbus.dto.response.ApiResponse;
import com.schoolbus.service.AdminAnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/analytics")
public class AdminAnalyticsController {
    private final AdminAnalyticsService analytics;

    public AdminAnalyticsController(AdminAnalyticsService analytics) {
        this.analytics = analytics;
    }

    @GetMapping("/overview")
    public ApiResponse<AnalyticsOverviewResponse> overview() {
        return ApiResponse.success(analytics.overview());
    }
}
