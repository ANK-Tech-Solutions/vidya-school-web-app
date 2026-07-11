package com.schoolbus.dto.request;
import jakarta.validation.Valid; import jakarta.validation.constraints.*; import java.math.*; import java.util.*;
public record RouteRequest(@NotBlank String name,@NotBlank String code,String description,BigDecimal startLatitude,BigDecimal startLongitude,BigDecimal endLatitude,BigDecimal endLongitude,Integer estimatedDurationMins,BigDecimal distanceKm,Boolean active,List<@Valid RouteStopRequest> stops) {}
