package com.schoolbus.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeoUtilsTest {

    @Test
    void calculatesKnownDistanceBetweenNewYorkAndLosAngeles() {
        double distance = GeoUtils.distanceKm(40.7128, -74.0060, 34.0522, -118.2437);

        assertEquals(3_936, distance, 25);
    }

    @Test
    void calculatesZeroDistanceForIdenticalCoordinates() {
        assertEquals(0.0, GeoUtils.distanceKm(12.9716, 77.5946, 12.9716, 77.5946), 0.0001);
    }

    @Test
    void returnsNaNWhenAnyBigDecimalCoordinateIsMissing() {
        double distance = GeoUtils.distanceKm(BigDecimal.valueOf(12.9716), null,
                BigDecimal.valueOf(13.0827), BigDecimal.valueOf(80.2707));

        assertTrue(Double.isNaN(distance));
    }
}
