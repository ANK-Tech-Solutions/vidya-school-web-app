package com.schoolbus.service.impl;

import com.schoolbus.dto.request.LoginRequest;
import com.schoolbus.dto.response.AuthResponse;
import com.schoolbus.dto.response.UserResponse;
import com.schoolbus.entity.RefreshToken;
import com.schoolbus.entity.User;
import com.schoolbus.exception.ResourceNotFoundException;
import com.schoolbus.exception.UnauthorizedException;
import com.schoolbus.repository.RefreshTokenRepository;
import com.schoolbus.repository.UserRepository;
import com.schoolbus.security.UserPrincipal;
import com.schoolbus.security.jwt.JwtTokenProvider;
import com.schoolbus.service.AuthService;
import com.schoolbus.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress, String deviceInfo) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(request.getUsername(), request.getPassword()));
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findByUsername(principal.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            user.setLastLoginAt(Instant.now());
            user.setFailedLoginAttempts(0);
            String refreshToken = jwtTokenProvider.createRefreshToken(principal);
            saveRefreshToken(user, refreshToken, ipAddress, deviceInfo);
            log.info("User {} logged in", user.getUsername());
            return authResponse(principal, user, refreshToken);
        } catch (AuthenticationException exception) {
            userRepository.findByUsername(request.getUsername()).ifPresent(user -> {
                int failures = user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts();
                user.setFailedLoginAttempts(failures + 1);
            });
            log.warn("Failed login attempt for username {}", request.getUsername());
            throw new UnauthorizedException("Invalid username or password");
        }
    }

    @Override
    @Transactional
    public AuthResponse refresh(String refreshToken, String ipAddress, String deviceInfo) {
        if (!jwtTokenProvider.isValidRefreshToken(refreshToken)) throw new UnauthorizedException("Invalid or expired refresh token");
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Refresh token is not recognized"));
        if (!storedToken.isValid()) throw new UnauthorizedException("Refresh token has expired or was revoked");
        User user = storedToken.getUser();
        if (!Boolean.TRUE.equals(user.getActive()) || Boolean.TRUE.equals(user.getLocked()))
            throw new UnauthorizedException("User account is unavailable");
        storedToken.setRevoked(true);
        UserPrincipal principal = UserPrincipal.from(user);
        String replacement = jwtTokenProvider.createRefreshToken(principal);
        saveRefreshToken(user, replacement, ipAddress, deviceInfo);
        log.info("Refresh token rotated for user {}", user.getUsername());
        return authResponse(principal, user, replacement);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
            token.setRevoked(true);
            log.info("User {} logged out", token.getUser().getUsername());
        });
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserIdOptional()
                .orElseThrow(() -> new UnauthorizedException("Authentication is required"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponse.from(user);
    }

    private void saveRefreshToken(User user, String token, String ipAddress, String deviceInfo) {
        refreshTokenRepository.save(RefreshToken.builder().user(user).token(token)
                .expiresAt(jwtTokenProvider.getExpiration(token)).revoked(false).createdAt(Instant.now())
                .ipAddress(truncate(ipAddress, 45)).deviceInfo(truncate(deviceInfo, 255)).build());
    }

    private AuthResponse authResponse(UserPrincipal principal, User user, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(jwtTokenProvider.createAccessToken(principal))
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(UserResponse.from(user))
                .build();
    }

    private String truncate(String value, int maximumLength) {
        return value == null ? null : value.substring(0, Math.min(value.length(), maximumLength));
    }
}
