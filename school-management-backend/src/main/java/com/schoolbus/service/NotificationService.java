package com.schoolbus.service;

import com.schoolbus.entity.Notification;
import com.schoolbus.entity.School;
import com.schoolbus.entity.User;
import com.schoolbus.entity.enums.NotificationType;
import java.util.Map;

public interface NotificationService {
    Notification create(School school, User user, String fcmToken, String title, String body,
                        NotificationType type, String referenceType, Long referenceId, Map<String, String> data);

    Notification createSchoolWide(School school, String title, String body, NotificationType type,
                                  String referenceType, Long referenceId, Map<String, String> data);

    Notification broadcast(School school, String title, String body, NotificationType type);
}
