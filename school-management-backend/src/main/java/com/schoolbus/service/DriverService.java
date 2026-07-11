package com.schoolbus.service;

import com.schoolbus.dto.request.*;
import com.schoolbus.dto.response.*;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DriverService {
    DriverDashboardResponse dashboard();
    DriverProfileResponse profile();
    DriverProfileResponse updateProfile(DriverProfileUpdateRequest request);
    void updateFcmToken(FcmTokenRequest request);
    AssignedBusResponse assignedBus();
    AssignedRouteResponse assignedRoute();
    List<TodayStudentResponse> todayStudents();
    void enableLocation();
    void disableLocation();
    void updateLocation(LocationUpdateRequest request);
    void updateLocation(LocationUpdateRequest request, Long tripId);
    TripResponse startTrip(StartTripRequest request);
    TripResponse endTrip();
    void sendSos(SosRequest request);
    Page<TripResponse> tripHistory(Pageable pageable);
    TripResponse activeTrip();
}
