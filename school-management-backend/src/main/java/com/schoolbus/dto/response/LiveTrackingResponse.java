package com.schoolbus.dto.response;
import com.schoolbus.entity.enums.TripStatus;
import java.math.BigDecimal;
import java.time.Instant;
public record LiveTrackingResponse(BigDecimal latitude, BigDecimal longitude, BigDecimal speed, BigDecimal heading,
                                   Instant lastUpdated, TripStatus tripStatus, BigDecimal schoolLatitude,
                                   BigDecimal schoolLongitude, BigDecimal pickupLatitude, BigDecimal pickupLongitude,
                                   Double distanceRemaining, Integer etaMinutes) { }
