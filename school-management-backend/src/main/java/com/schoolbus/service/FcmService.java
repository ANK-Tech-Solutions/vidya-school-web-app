package com.schoolbus.service;

import java.util.Map;
import java.util.Optional;

public interface FcmService {
    Optional<String> sendToToken(String token, String title, String body, Map<String, String> data);
}
