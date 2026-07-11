package com.schoolbus.config;

import com.schoolbus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {
    private static final String SEED_PASSWORD = "Password@123";
    private static final List<String> SEED_USERNAMES = List.of("admin", "driver1", "parent1");
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public ApplicationRunner initializeSeedPasswords() {
        return args -> {
            String encodedPassword = passwordEncoder.encode(SEED_PASSWORD);
            int updated = 0;
            for (String username : SEED_USERNAMES) {
                var user = userRepository.findByUsername(username);
                if (user.isPresent()) {
                    user.get().setPasswordHash(encodedPassword);
                    user.get().setPasswordChangedAt(Instant.now());
                    userRepository.save(user.get());
                    updated++;
                }
            }
            if (updated > 0) log.warn("Reset passwords for {} configured demo user(s)", updated);
        };
    }
}
