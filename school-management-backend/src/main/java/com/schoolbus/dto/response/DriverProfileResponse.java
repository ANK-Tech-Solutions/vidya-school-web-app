package com.schoolbus.dto.response;

import com.schoolbus.entity.Driver;
import java.time.LocalDate;

public record DriverProfileResponse(
        Long id, String firstName, String lastName, String email, String phone,
        String licenseNumber, LocalDate licenseExpiry, Integer experienceYears,
        String bloodGroup, String emergencyContact, String address, String fcmToken,
        Boolean online, Boolean locationEnabled
) {
    public static DriverProfileResponse from(Driver driver) {
        var user = driver.getUser();
        return new DriverProfileResponse(driver.getId(), user.getFirstName(), user.getLastName(), user.getEmail(),
                user.getPhone(), driver.getLicenseNumber(), driver.getLicenseExpiry(), driver.getExperienceYears(),
                driver.getBloodGroup(), driver.getEmergencyContact(), driver.getAddress(), driver.getFcmToken(),
                driver.getOnline(), driver.getLocationEnabled());
    }
}
