package com.schoolbus.dto.request;

import java.math.BigDecimal;

public record SosRequest(String message, BigDecimal latitude, BigDecimal longitude) {
}
