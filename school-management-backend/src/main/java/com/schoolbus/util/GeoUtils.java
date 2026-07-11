package com.schoolbus.util;

import com.schoolbus.entity.RouteStop;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

public final class GeoUtils {
    private static final double EARTH_RADIUS_KM = 6371.0088;
    private static final double DEFAULT_SPEED_KMH = 25.0;

    private GeoUtils() {
    }

    public static double distanceKm(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return Double.NaN;
        }
        return distanceKm(lat1.doubleValue(), lon1.doubleValue(), lat2.doubleValue(), lon2.doubleValue());
    }

    public static double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /** Browser Geolocation speed is m/s; convert for ETA. */
    public static Integer etaMinutes(Double distanceKm, BigDecimal speedMetersPerSecond) {
        if (distanceKm == null || Double.isNaN(distanceKm) || distanceKm < 0) {
            return null;
        }
        double speedKmh = DEFAULT_SPEED_KMH;
        if (speedMetersPerSecond != null && speedMetersPerSecond.doubleValue() > 0.5) {
            speedKmh = Math.max(speedMetersPerSecond.doubleValue() * 3.6, 5.0);
        }
        return (int) Math.max(1, Math.ceil(distanceKm / speedKmh * 60.0));
    }

    public static RouteStop nearestStop(List<RouteStop> stops, BigDecimal lat, BigDecimal lon) {
        if (stops == null || stops.isEmpty() || lat == null || lon == null) {
            return null;
        }
        return stops.stream()
                .min(Comparator.comparingDouble(stop -> distanceKm(lat, lon, stop.getLatitude(), stop.getLongitude())))
                .orElse(null);
    }

    public static RouteStop resolveCurrentStop(List<RouteStop> orderedStops, BigDecimal lat, BigDecimal lon) {
        RouteStop nearest = nearestStop(orderedStops, lat, lon);
        if (nearest == null) {
            return null;
        }
        double distanceM = distanceKm(lat, lon, nearest.getLatitude(), nearest.getLongitude()) * 1000.0;
        int radius = nearest.getGeofenceRadiusM() == null ? 100 : nearest.getGeofenceRadiusM();
        if (distanceM <= Math.max(radius, 80)) {
            return nearest;
        }
        // Outside geofence: treat previous stop as "current" progress when moving toward a later stop
        int index = orderedStops.indexOf(nearest);
        if (index > 0) {
            return orderedStops.get(index - 1);
        }
        return nearest;
    }

    public static RouteStop nextStop(List<RouteStop> orderedStops, RouteStop current) {
        if (orderedStops == null || orderedStops.isEmpty()) {
            return null;
        }
        if (current == null) {
            return orderedStops.get(0);
        }
        int index = orderedStops.indexOf(current);
        if (index < 0 || index >= orderedStops.size() - 1) {
            return null;
        }
        return orderedStops.get(index + 1);
    }
}
