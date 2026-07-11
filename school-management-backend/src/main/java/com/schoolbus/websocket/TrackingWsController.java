package com.schoolbus.websocket;

import com.schoolbus.dto.request.LocationUpdateRequest;
import com.schoolbus.service.DriverService;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class TrackingWsController {
    private final DriverService driverService;

    @MessageMapping("/driver/location")
    public void updateLocation(@Valid LocationUpdateRequest request,
                               @Header(name = "tripId", required = false) Long tripId,
                               Principal principal) {
        if (!(principal instanceof Authentication authentication)) {
            throw new IllegalArgumentException("Authenticated driver is required");
        }

        SecurityContext previous = SecurityContextHolder.getContext();
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        try {
            SecurityContextHolder.setContext(context);
            driverService.updateLocation(request, tripId);
        } finally {
            SecurityContextHolder.setContext(previous);
        }
    }
}
