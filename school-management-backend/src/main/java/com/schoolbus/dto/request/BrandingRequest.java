package com.schoolbus.dto.request;
import jakarta.validation.constraints.NotBlank;
public record BrandingRequest(@NotBlank String appName,@NotBlank String appIconUrl) {}
