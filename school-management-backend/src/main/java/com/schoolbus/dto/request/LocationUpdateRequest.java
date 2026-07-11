package com.schoolbus.dto.request;

import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonAlias;
import java.math.BigDecimal;
import java.time.Instant;

public record LocationUpdateRequest(
        @NotNull BigDecimal latitude,
        @NotNull BigDecimal longitude,
        BigDecimal accuracy,
        BigDecimal heading,
        BigDecimal speed,
        BigDecimal altitude,
        @JsonAlias("timestamp") Instant recordedAt
) {
}
