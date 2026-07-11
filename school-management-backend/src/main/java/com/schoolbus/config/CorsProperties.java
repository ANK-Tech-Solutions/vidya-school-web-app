package com.schoolbus.config;

import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Setter
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    /**
     * Comma-separated origins or patterns, e.g.
     * http://localhost:3000,https://my-app.vercel.app,https://*.vercel.app
     */
    private String allowedOrigins = "http://localhost:3000,http://127.0.0.1:3000";
    private String allowedMethods = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
    private String allowedHeaders = "*";
    private boolean allowCredentials = true;
    private long maxAge = 3600;

    public List<String> getAllowedOrigins() {
        return split(allowedOrigins);
    }

    public List<String> getAllowedMethods() {
        return split(allowedMethods);
    }

    public List<String> getAllowedHeaders() {
        return split(allowedHeaders);
    }

    public boolean isAllowCredentials() {
        return allowCredentials;
    }

    public long getMaxAge() {
        return maxAge;
    }

    private static List<String> split(String value) {
        if (value == null || value.isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
