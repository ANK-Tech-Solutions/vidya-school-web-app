package com.schoolbus.dto.response;

import com.schoolbus.entity.School;

public record SchoolResponse(
        Long id,
        String code,
        String name,
        String appName,
        String appIconUrl,
        String address,
        String city,
        String state,
        String postalCode,
        String country,
        String phone,
        String email,
        String timezone,
        Boolean active) {
    public static SchoolResponse from(School s) {
        return new SchoolResponse(
                s.getId(),
                s.getCode(),
                s.getName(),
                s.getAppName(),
                s.getAppIconUrl(),
                s.getAddress(),
                s.getCity(),
                s.getState(),
                s.getPostalCode(),
                s.getCountry(),
                s.getPhone(),
                s.getEmail(),
                s.getTimezone(),
                s.getActive());
    }
}
