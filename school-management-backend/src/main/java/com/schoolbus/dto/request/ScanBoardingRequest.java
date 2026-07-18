package com.schoolbus.dto.request;

import jakarta.validation.constraints.NotBlank;

/** A scanned student identifier (QR payload, NFC/RFID tag, or code from a face/fingerprint terminal). */
public record ScanBoardingRequest(@NotBlank String code, String method) {}
