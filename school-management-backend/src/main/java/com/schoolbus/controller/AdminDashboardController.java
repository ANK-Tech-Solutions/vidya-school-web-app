package com.schoolbus.controller;
import com.schoolbus.dto.response.*; import com.schoolbus.service.AdminDashboardService; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {
 private final AdminDashboardService service; public AdminDashboardController(AdminDashboardService service){this.service=service;}
 @GetMapping({"", "/stats"}) public ApiResponse<DashboardStatsResponse> stats(){return ApiResponse.success("Dashboard statistics retrieved",service.getStats());}
}
