package com.schoolbus.service;

import com.schoolbus.dto.request.LoginRequest;
import com.schoolbus.dto.response.AuthResponse;
import com.schoolbus.dto.response.UserResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request, String ipAddress, String deviceInfo);
    AuthResponse refresh(String refreshToken, String ipAddress, String deviceInfo);
    void logout(String refreshToken);
    UserResponse getCurrentUser();
}
