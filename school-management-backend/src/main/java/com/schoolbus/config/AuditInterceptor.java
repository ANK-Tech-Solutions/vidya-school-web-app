package com.schoolbus.config;

import com.schoolbus.entity.AuditLog;
import com.schoolbus.repository.AuditLogRepository;
import com.schoolbus.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Set;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Records privileged mutations (POST/PUT/PATCH/DELETE on admin, platform, and incharge APIs) into audit_logs.
 * Best-effort: never fails the underlying request.
 */
@Component
public class AuditInterceptor implements HandlerInterceptor {
    private static final Set<String> MUTATIONS = Set.of("POST", "PUT", "PATCH", "DELETE");

    private final AuditLogRepository auditLogs;

    public AuditInterceptor(AuditLogRepository auditLogs) {
        this.auditLogs = auditLogs;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                                @Nullable Exception ex) {
        try {
            if (!MUTATIONS.contains(request.getMethod()) || response.getStatus() >= 400) {
                return;
            }
            String path = request.getRequestURI();
            if (path == null || !(path.startsWith("/api/v1/admin") || path.startsWith("/api/v1/platform")
                    || path.startsWith("/api/v1/incharge"))) {
                return;
            }
            String entityType = handler instanceof HandlerMethod hm ? hm.getBeanType().getSimpleName() : null;
            auditLogs.save(AuditLog.builder()
                    .schoolId(SecurityUtils.getCurrentSchoolIdOptional().orElse(null))
                    .userId(SecurityUtils.getCurrentUserIdOptional().orElse(null))
                    .action(truncate(request.getMethod() + " " + path, 100))
                    .entityType(entityType)
                    .ipAddress(truncate(clientIp(request), 45))
                    .userAgent(truncate(request.getHeader("User-Agent"), 500))
                    .build());
        } catch (RuntimeException ignored) {
            // Auditing must never break the request it is observing.
        }
    }

    private static String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        return forwardedFor == null || forwardedFor.isBlank() ? request.getRemoteAddr() : forwardedFor.split(",", 2)[0].trim();
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
