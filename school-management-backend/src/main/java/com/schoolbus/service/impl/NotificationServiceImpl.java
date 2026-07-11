package com.schoolbus.service.impl;

import com.schoolbus.entity.Notification;
import com.schoolbus.entity.Driver;
import com.schoolbus.entity.Parent;
import com.schoolbus.entity.School;
import com.schoolbus.entity.User;
import com.schoolbus.entity.enums.NotificationType;
import com.schoolbus.repository.NotificationRepository;
import com.schoolbus.repository.DriverRepository;
import com.schoolbus.repository.ParentRepository;
import com.schoolbus.service.FcmService;
import com.schoolbus.service.NotificationService;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notifications;
    private final FcmService fcmService;
    private final ParentRepository parents;
    private final DriverRepository drivers;

    public NotificationServiceImpl(NotificationRepository notifications, FcmService fcmService,
                                   ParentRepository parents, DriverRepository drivers) {
        this.notifications = notifications;
        this.fcmService = fcmService;
        this.parents = parents;
        this.drivers = drivers;
    }

    @Override
    @Transactional
    public Notification create(School school, User user, String fcmToken, String title, String body,
                               NotificationType type, String referenceType, Long referenceId, Map<String, String> data) {
        Notification notification = notifications.save(Notification.builder()
                .school(school).user(user).title(title).body(body).type(type)
                .referenceType(referenceType).referenceId(referenceId).build());
        Map<String, String> payload = new HashMap<>(data == null ? Map.of() : data);
        payload.put("notificationId", String.valueOf(notification.getId()));
        payload.putIfAbsent("type", type.name());
        fcmService.sendToToken(fcmToken, title, body, payload).ifPresent(messageId -> {
            notification.setSentVia("IN_APP,FCM");
            notification.setFcmMessageId(messageId);
        });
        return notification;
    }

    @Override
    @Transactional
    public Notification createSchoolWide(School school, String title, String body, NotificationType type,
                                         String referenceType, Long referenceId, Map<String, String> data) {
        return create(school, null, null, title, body, type, referenceType, referenceId, data);
    }

    @Override
    @Transactional
    public Notification broadcast(School school, String title, String body, NotificationType type) {
        Notification notification = createSchoolWide(school, title, body, type, "SCHOOL", school.getId(), Map.of());
        parents.findBySchoolId(school.getId()).forEach(parent ->
                fcmService.sendToToken(parent.getFcmToken(), title, body, Map.of("notificationId", String.valueOf(notification.getId()), "type", type.name())));
        drivers.findBySchoolId(school.getId()).forEach(driver ->
                fcmService.sendToToken(driver.getFcmToken(), title, body, Map.of("notificationId", String.valueOf(notification.getId()), "type", type.name())));
        return notification;
    }
}
