package com.schoolbus.dto.response;

import com.schoolbus.entity.Driver;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record DriverResponse(
        Long id,
        Long userId,
        String username,
        String email,
        String firstName,
        String lastName,
        String phone,
        String licenseNumber,
        LocalDate licenseExpiry,
        Integer experienceYears,
        String bloodGroup,
        String emergencyContact,
        String address,
        Boolean online,
        Boolean locationEnabled,
        Boolean active,
        BigDecimal lastLatitude,
        BigDecimal lastLongitude,
        Instant lastLocationAt) {
    public static DriverResponse from(Driver d) {
        var u = d.getUser();
        return new DriverResponse(
                d.getId(),
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.getPhone(),
                d.getLicenseNumber(),
                d.getLicenseExpiry(),
                d.getExperienceYears(),
                d.getBloodGroup(),
                d.getEmergencyContact(),
                d.getAddress(),
                d.getOnline(),
                d.getLocationEnabled(),
                u.getActive(),
                d.getLastLatitude(),
                d.getLastLongitude(),
                d.getLastLocationAt());
    }
}
