package com.schoolbus.controller;

import com.schoolbus.dto.response.ApiResponse;
import com.schoolbus.dto.response.AuditLogResponse;
import com.schoolbus.dto.response.PageResponse;
import com.schoolbus.repository.AuditLogRepository;
import com.schoolbus.util.SecurityUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
public class AdminAuditController {
    private final AuditLogRepository auditLogs;

    public AdminAuditController(AuditLogRepository auditLogs) {
        this.auditLogs = auditLogs;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<AuditLogResponse>> list(
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        String filter = action == null || action.isBlank() ? null : action.trim();
        return ApiResponse.success(PageResponse.from(
                auditLogs.search(SecurityUtils.getCurrentSchoolId(), filter, PageRequest.of(page, size))));
    }
}
