package com.schoolbus.dto.request;
import jakarta.validation.constraints.*; import java.time.*;
public record DriverRequest(@NotBlank String username,@Email @NotBlank String email,String password,@NotBlank String firstName,@NotBlank String lastName,String phone,@NotBlank String licenseNumber,LocalDate licenseExpiry,Integer experienceYears,String bloodGroup,String emergencyContact,String address,Boolean active) {}
