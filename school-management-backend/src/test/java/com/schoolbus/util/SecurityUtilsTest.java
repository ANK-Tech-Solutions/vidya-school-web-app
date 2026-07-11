package com.schoolbus.util;

import com.schoolbus.entity.Role;
import com.schoolbus.entity.School;
import com.schoolbus.entity.User;
import com.schoolbus.entity.enums.RoleType;
import com.schoolbus.security.UserPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SecurityUtilsTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void returnsAuthenticatedUserDetails() {
        School school = School.builder().id(42L).build();
        User user = User.builder()
                .id(7L)
                .school(school)
                .username("driver.lee")
                .passwordHash("hash")
                .firstName("Lee")
                .lastName("Driver")
                .email("lee@example.com")
                .roles(Set.of(Role.builder().name(RoleType.DRIVER).build()))
                .build();
        UserPrincipal principal = UserPrincipal.from(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));

        assertEquals("driver.lee", SecurityUtils.getCurrentUsername());
        assertEquals(7L, SecurityUtils.getCurrentUserIdOptional().orElseThrow());
        assertEquals(42L, SecurityUtils.getCurrentSchoolId());
    }

    @Test
    void returnsEmptyAndThrowsWithoutAuthentication() {
        assertFalse(SecurityUtils.getCurrentUsernameOptional().isPresent());
        assertFalse(SecurityUtils.getCurrentUserIdOptional().isPresent());
        assertFalse(SecurityUtils.getCurrentSchoolIdOptional().isPresent());
        assertThrows(IllegalStateException.class, SecurityUtils::getCurrentUsername);
        assertThrows(IllegalStateException.class, SecurityUtils::getCurrentSchoolId);
    }
}
