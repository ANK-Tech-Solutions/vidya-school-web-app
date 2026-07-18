package com.schoolbus.dto.response;

import java.time.Instant;

public record AuditLogResponse(
        Long id,
        String action,
        String entityType,
        Long entityId,
        Long userId,
        String username,
        String ipAddress,
        Instant createdAt) {
}
