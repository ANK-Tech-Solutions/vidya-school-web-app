package com.schoolbus.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
    private final String accessToken;
    private final String refreshToken;
    @Builder.Default private final String tokenType = "Bearer";
    private final long expiresIn;
    private final UserResponse user;
}
