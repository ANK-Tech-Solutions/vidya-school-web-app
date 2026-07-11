package com.schoolbus.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Lightweight in-memory rate limiter for auth endpoints (Phase 1).
 * Replace with distributed limiter (Redis / Bucket4j) for multi-instance production.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int AUTH_LIMIT_PER_MINUTE = 10;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path == null || !path.startsWith("/api/v1/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String key = clientKey(request);
        Window window = windows.compute(key, (k, existing) -> {
            long minute = Instant.now().getEpochSecond() / 60;
            if (existing == null || existing.minute != minute) {
                return new Window(minute, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (window.count.get() > AUTH_LIMIT_PER_MINUTE) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Too many authentication attempts. Try again shortly.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        String ip = forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",", 2)[0].trim();
        return ip + "|" + request.getRequestURI();
    }

    private record Window(long minute, AtomicInteger count) {}
}
