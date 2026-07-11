package com.schoolbus.service.impl;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.schoolbus.config.FirebaseConfig;
import com.schoolbus.service.FcmService;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class FcmServiceImpl implements FcmService {
    private final ObjectProvider<FirebaseConfig> firebaseConfig;

    public FcmServiceImpl(ObjectProvider<FirebaseConfig> firebaseConfig) {
        this.firebaseConfig = firebaseConfig;
    }

    @Override
    public Optional<String> sendToToken(String token, String title, String body, Map<String, String> data) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        FirebaseConfig config = firebaseConfig.getIfAvailable();
        if (config == null || config.getFirebaseApp().isEmpty()) {
            log.debug("FCM push skipped because Firebase is disabled or unconfigured");
            return Optional.empty();
        }
        try {
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                    .putAllData(data == null ? Map.of() : data)
                    .build();
            return Optional.of(FirebaseMessaging.getInstance(config.getFirebaseApp().get()).send(message));
        } catch (Exception exception) {
            log.warn("FCM push could not be delivered", exception);
            return Optional.empty();
        }
    }
}
