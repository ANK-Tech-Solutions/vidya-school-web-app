package com.schoolbus.config;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.websocket")
public class WebSocketProperties {
    private String endpoint = "/ws";
    private List<String> allowedOrigins = new ArrayList<>();
}
