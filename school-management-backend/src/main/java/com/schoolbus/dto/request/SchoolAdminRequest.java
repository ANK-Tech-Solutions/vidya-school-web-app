package com.schoolbus.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SchoolAdminRequest(
        @NotNull Long schoolId,
        @NotBlank @Size(max = 100) String username,
        @NotBlank @Email @Size(max = 150) String email,
        @Size(max = 100) String password,
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @Size(max = 20) String phone) {}
