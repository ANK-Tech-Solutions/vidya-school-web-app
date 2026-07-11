package com.schoolbus.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@ConditionalOnProperty(prefix = "app.firebase", name = "enabled", havingValue = "true")
public class FirebaseConfig {
    @Value("${app.firebase.credentials-path:}")
    private String credentialsPath;

    private FirebaseApp firebaseApp;

    @PostConstruct
    void initialize() {
        if (credentialsPath == null || credentialsPath.isBlank()) {
            log.warn("Firebase is enabled but FIREBASE_CREDENTIALS is not configured; push notifications will be skipped");
            return;
        }
        try (InputStream credentials = credentialsStream(credentialsPath)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(credentials))
                    .build();
            firebaseApp = FirebaseApp.getApps().isEmpty()
                    ? FirebaseApp.initializeApp(options)
                    : FirebaseApp.getInstance();
            log.info("Firebase Admin SDK initialized");
        } catch (IOException | RuntimeException exception) {
            log.warn("Firebase could not be initialized; push notifications will be skipped", exception);
        }
    }

    public Optional<FirebaseApp> getFirebaseApp() {
        return Optional.ofNullable(firebaseApp);
    }

    private InputStream credentialsStream(String value) throws IOException {
        if (value.trim().startsWith("{")) {
            return new ByteArrayInputStream(value.getBytes(StandardCharsets.UTF_8));
        }
        return new FileInputStream(value);
    }
}
