package com.schoolbus.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SchoolRequest(
        @NotBlank @Size(max = 50) String code,
        @NotBlank @Size(max = 200) String name,
        @Size(max = 200) String appName,
        @Size(max = 1000) String appIconUrl,
        @Size(max = 500) String address,
        @Size(max = 100) String city,
        @Size(max = 100) String state,
        @Size(max = 20) String postalCode,
        @Size(max = 100) String country,
        @Size(max = 20) String phone,
        @Email @Size(max = 150) String email,
        @Size(max = 50) String timezone,
        Boolean active) {}
