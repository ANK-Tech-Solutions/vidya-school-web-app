package com.schoolbus.dto.request;
import jakarta.validation.constraints.*;
public record AssignStudentRequest(@NotNull Long studentId,Long routeId,Long busId) {}
