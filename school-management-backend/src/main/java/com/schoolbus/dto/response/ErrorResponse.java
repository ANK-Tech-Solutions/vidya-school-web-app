package com.schoolbus.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.Map;

@Getter
@Builder
public class ErrorResponse {
    @Builder.Default private final Instant timestamp = Instant.now();
    private final int status;
    private final String error;
    private final String code;
    private final String message;
    private final String path;
    private final Map<String, String> fieldErrors;
    public static ErrorResponse of(int status, String code, String message, String path) {
        return ErrorResponse.builder().status(status).error(code).code(code).message(message).path(path).build();
    }
}
