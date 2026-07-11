package com.schoolbus.security.jwt;

import com.schoolbus.config.JwtProperties;
import com.schoolbus.entity.Role;
import com.schoolbus.entity.User;
import com.schoolbus.entity.enums.RoleType;
import com.schoolbus.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret("ChangeThisToAVeryLongSecureSecretKeyForProductionUseAtLeast256BitsLong!!");
        properties.setAccessTokenExpirationMs(900_000);
        properties.setRefreshTokenExpirationMs(604_800_000);
        properties.setIssuer("school-bus-management");
        jwtTokenProvider = new JwtTokenProvider(properties);
        jwtTokenProvider.initialize();
    }

    @Test
    void createsAndValidatesAccessToken() {
        UserPrincipal principal = principal();
        String token = jwtTokenProvider.createAccessToken(principal);

        assertTrue(jwtTokenProvider.isValidAccessToken(token));
        assertEquals("admin", jwtTokenProvider.getUsername(token));
    }

    @Test
    void createsRefreshTokenThatIsNotAcceptedAsAccessToken() {
        String token = jwtTokenProvider.createRefreshToken(principal());

        assertTrue(jwtTokenProvider.isValidRefreshToken(token));
        assertFalse(jwtTokenProvider.isValidAccessToken(token));
    }

    @Test
    void rejectsMalformedTokens() {
        assertFalse(jwtTokenProvider.isValidAccessToken("not.a.jwt"));
        assertFalse(jwtTokenProvider.isValidRefreshToken("not.a.jwt"));
    }

    private UserPrincipal principal() {
        User user = User.builder()
                .id(1L)
                .username("admin")
                .passwordHash("hash")
                .firstName("System")
                .lastName("Admin")
                .email("admin@test.com")
                .active(true)
                .locked(false)
                .roles(Set.of(Role.builder().name(RoleType.ADMIN).build()))
                .build();
        return UserPrincipal.from(user);
    }
}
