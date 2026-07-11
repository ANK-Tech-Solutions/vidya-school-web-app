package com.schoolbus.dto.request;
import jakarta.validation.constraints.*; import java.math.*;
public record RouteStopRequest(@NotBlank String name,@NotNull Integer stopOrder,@NotNull BigDecimal latitude,@NotNull BigDecimal longitude,String address,Integer estimatedArrivalMins,Integer geofenceRadiusM) {}
