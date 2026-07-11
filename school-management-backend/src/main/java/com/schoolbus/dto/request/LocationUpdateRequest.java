package com.schoolbus.dto.request;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;

public record LocationUpdateRequest(
        @NotNull BigDecimal latitude,
        @NotNull BigDecimal longitude,
        BigDecimal accuracy,
        BigDecimal heading,
        BigDecimal speed,
        BigDecimal altitude,
        Instant recordedAt
) {
}
