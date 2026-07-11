package com.schoolbus.dto.request;
import com.schoolbus.entity.enums.BusStatus; import jakarta.validation.constraints.*; import java.time.*;
public record BusRequest(@NotBlank String busNumber,@NotBlank String plateNumber,String make,String model,Integer yearOfMake,@NotNull @Positive Integer capacity,String color,String gpsDeviceId,BusStatus status,LocalDate insuranceExpiry,LocalDate fitnessExpiry) {}
