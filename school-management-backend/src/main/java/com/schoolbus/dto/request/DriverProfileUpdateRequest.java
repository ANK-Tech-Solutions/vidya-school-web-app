package com.schoolbus.dto.request;

public record DriverProfileUpdateRequest(
        String phone,
        String emergencyContact,
        String address,
        String bloodGroup,
        String fcmToken
) {
}
