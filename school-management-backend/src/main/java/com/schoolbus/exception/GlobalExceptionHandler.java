package com.schoolbus.exception;

import com.schoolbus.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException exception, HttpServletRequest request) {
        return response(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, exception.getMessage(), request, null);
    }

    @ExceptionHandler({BadRequestException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<ErrorResponse> handleBadRequest(Exception exception, HttpServletRequest request) {
        String message = exception instanceof BadRequestException ? exception.getMessage() : "Malformed request body";
        return response(HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST, message, request, null);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException exception, HttpServletRequest request) {
        return response(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, exception.getMessage(), request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError error : exception.getBindingResult().getFieldErrors()) errors.putIfAbsent(error.getField(), error.getDefaultMessage());
        return response(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, "Validation failed", request, errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException exception, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, exception.getMessage(), request, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception exception, HttpServletRequest request) {
        log.error("Unhandled exception for {}", request.getRequestURI(), exception);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, "An unexpected error occurred", request, null);
    }

    private ResponseEntity<ErrorResponse> response(HttpStatus status, ErrorCode code, String message,
                                                    HttpServletRequest request, Map<String, String> fieldErrors) {
        ErrorResponse body = ErrorResponse.builder().status(status.value()).error(status.getReasonPhrase()).code(code.name())
                .message(message).path(request.getRequestURI()).fieldErrors(fieldErrors).build();
        return ResponseEntity.status(status).body(body);
    }
}
