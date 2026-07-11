package com.schoolbus.dto.response;

import com.schoolbus.entity.enums.TripStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record LiveLocationMessage(
        Long tripId,
        Long busId,
        String busNumber,
        BigDecimal latitude,
        BigDecimal longitude,
        BigDecimal speed,
        BigDecimal heading,
        BigDecimal accuracy,
        Instant recordedAt,
        TripStatus tripStatus
) {
}
