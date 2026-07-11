package com.schoolbus.dto.response;

import com.schoolbus.entity.Notification;
import com.schoolbus.entity.enums.NotificationType;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        String title,
        String body,
        String message,
        NotificationType type,
        String referenceType,
        Long referenceId,
        Boolean read,
        Instant createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getBody(),
                n.getBody(),
                n.getType(),
                n.getReferenceType(),
                n.getReferenceId(),
                n.getRead(),
                n.getCreatedAt()
        );
    }
}
