package com.schoolbus.dto.response;

public record DashboardStatsResponse(long driversOnline, long totalStudents, long totalParents,
                                     long totalDrivers, long activeBuses, long runningTrips,
                                     long completedTripsToday, long unreadNotifications) { }
