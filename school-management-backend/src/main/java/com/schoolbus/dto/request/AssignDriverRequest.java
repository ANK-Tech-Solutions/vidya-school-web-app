package com.schoolbus.dto.request;
import jakarta.validation.constraints.*;
public record AssignDriverRequest(@NotNull Long driverId,@NotNull Long busId,Long routeId) {}
