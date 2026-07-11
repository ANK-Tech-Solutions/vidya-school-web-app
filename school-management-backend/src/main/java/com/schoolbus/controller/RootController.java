package com.schoolbus.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
                "service", "Vidya Bus API",
                "status", "UP",
                "health", "/actuator/health",
                "login", "/api/v1/auth/login",
                "docs", "/swagger-ui.html");
    }
}
