package com.schoolbus.dto.request;

import com.schoolbus.entity.enums.TripType;

public record StartTripRequest(TripType tripType) {
}
