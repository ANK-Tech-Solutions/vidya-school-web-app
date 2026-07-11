package com.schoolbus.config;

import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Setter
@ConfigurationProperties(prefix = "app.websocket")
public class WebSocketProperties {

    private String endpoint = "/ws";
    /** Comma-separated origins/patterns; falls back to CORS origins when empty. */
    private String allowedOrigins = "";

    public String getEndpoint() {
        return endpoint;
    }

    public List<String> getAllowedOrigins() {
        if (allowedOrigins == null || allowedOrigins.isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
