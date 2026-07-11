package com.schoolbus.dto.request;

import com.schoolbus.entity.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BroadcastNotificationRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 1000) String body,
        @NotNull NotificationType type
) {
}
