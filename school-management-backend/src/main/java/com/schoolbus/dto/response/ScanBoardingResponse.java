package com.schoolbus.dto.response;

public record ScanBoardingResponse(Long studentId, String name, String method, boolean alreadyBoarded) {}
