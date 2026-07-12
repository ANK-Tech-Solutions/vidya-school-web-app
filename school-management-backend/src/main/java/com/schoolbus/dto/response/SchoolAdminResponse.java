package com.schoolbus.dto.response;

import com.schoolbus.entity.User;

public record SchoolAdminResponse(
        Long id,
        Long userId,
        Long schoolId,
        String schoolCode,
        String schoolName,
        String username,
        String email,
        String firstName,
        String lastName,
        String phone,
        Boolean active) {
    public static SchoolAdminResponse from(User u) {
        var school = u.getSchool();
        return new SchoolAdminResponse(
                u.getId(),
                u.getId(),
                school == null ? null : school.getId(),
                school == null ? null : school.getCode(),
                school == null ? null : school.getName(),
                u.getUsername(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.getPhone(),
                u.getActive());
    }
}
