package com.schoolbus.util;

import com.schoolbus.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {
    private SecurityUtils() { }
    public static Optional<String> getCurrentUsernameOptional() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) return Optional.empty();
        return Optional.ofNullable(authentication.getName());
    }
    public static String getCurrentUsername() { return getCurrentUsernameOptional().orElseThrow(() -> new IllegalStateException("No authenticated user")); }
    public static Optional<Long> getCurrentUserIdOptional() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal
                ? Optional.of(principal.getId()) : Optional.empty();
    }

    public static Long getCurrentSchoolId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal
                && principal.getSchoolId() != null) {
            return principal.getSchoolId();
        }
        throw new IllegalStateException("Authenticated user has no school context");
    }

    public static Optional<Long> getCurrentSchoolIdOptional() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.ofNullable(principal.getSchoolId());
        }
        return Optional.empty();
    }
}
