package com.schoolbus.dto.request;
import jakarta.validation.constraints.NotBlank;
public record AiChatRequest(@NotBlank String message,String roleHint) {}
