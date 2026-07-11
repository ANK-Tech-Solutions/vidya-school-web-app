package com.schoolbus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record DriverAddStopRequest(
        @NotBlank String name,
        @NotNull BigDecimal latitude,
        @NotNull BigDecimal longitude,
        String address,
        Integer geofenceRadiusM
) {
}
