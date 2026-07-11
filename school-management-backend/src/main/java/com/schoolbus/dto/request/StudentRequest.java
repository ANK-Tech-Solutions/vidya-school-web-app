package com.schoolbus.dto.request;
import jakarta.validation.constraints.*; import java.math.*; import java.time.*;
public record StudentRequest(@NotBlank String studentCode,@NotBlank String firstName,@NotBlank String lastName,String grade,String section,String gender,LocalDate dateOfBirth,Long parentId,String pickupAddress,BigDecimal pickupLatitude,BigDecimal pickupLongitude,String dropAddress,BigDecimal dropLatitude,BigDecimal dropLongitude,String rfidTag,Boolean active) {}
