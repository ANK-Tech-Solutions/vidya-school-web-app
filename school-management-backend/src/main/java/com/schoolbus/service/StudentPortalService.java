package com.schoolbus.service;

import com.schoolbus.dto.response.*;
import com.schoolbus.dto.request.FcmTokenRequest;
import com.schoolbus.entity.*;
import com.schoolbus.entity.enums.TripStatus;
import com.schoolbus.exception.ResourceNotFoundException;
import com.schoolbus.exception.UnauthorizedException;
import com.schoolbus.repository.*;
import com.schoolbus.util.GeoUtils;
import com.schoolbus.util.SecurityUtils;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StudentPortalService {
    private final StudentAccessService access;
    private final StudentBusRepository studentBuses;
    private final DriverBusRepository driverBuses;
    private final TripRepository trips;
    private final TripLocationRepository locations;
    private final AttendanceRepository attendance;
    private final NotificationRepository notifications;
    private final ParentRepository parents;

    public StudentPortalService(StudentAccessService access, StudentBusRepository studentBuses,
            DriverBusRepository driverBuses, TripRepository trips, TripLocationRepository locations,
            AttendanceRepository attendance, NotificationRepository notifications, ParentRepository parents) {
        this.access = access; this.studentBuses = studentBuses; this.driverBuses = driverBuses;
        this.trips = trips; this.locations = locations; this.attendance = attendance; this.notifications = notifications; this.parents = parents;
    }

    public List<ChildStudentResponse> children() {
        return access.getAccessibleStudents().stream().map(ChildStudentResponse::from).toList();
    }
    public StudentProfileResponse profile(Long studentId) { return StudentProfileResponse.from(access.getPrimaryStudent(studentId)); }
    public BusDetailsResponse bus(Long studentId) { return BusDetailsResponse.from(requireAssignment(studentId)); }
    public RouteDetailsResponse route(Long studentId) {
        StudentBus assignment = requireAssignment(studentId);
        if (assignment.getRoute() == null) throw new ResourceNotFoundException("No route is assigned to this student");
        return RouteDetailsResponse.from(assignment.getRoute());
    }
    public DriverDetailsResponse driver(Long studentId) {
        DriverBus assignment = driverBuses.findFirstByBusIdAndActiveTrueOrderByAssignedFromDesc(requireAssignment(studentId).getBus().getId())
                .orElseThrow(() -> new ResourceNotFoundException("No active driver is assigned to this bus"));
        return DriverDetailsResponse.from(assignment.getDriver());
    }
    public StudentDashboardResponse dashboard(Long studentId) {
        Student student = access.getPrimaryStudent(studentId);
        StudentBus assignment = studentBuses.findFirstByStudentIdAndActiveTrueOrderByAssignedFromDesc(student.getId()).orElse(null);
        Trip trip = assignment == null ? null : activeTrip(assignment.getBus().getId());
        TripLocation location = trip == null ? null : locations.findFirstByTripIdOrderByRecordedAtDesc(trip.getId()).orElse(null);
        return new StudentDashboardResponse(ChildStudentResponse.from(student), trip == null ? null : trip.getStatus(),
                assignment == null ? null : assignment.getBus().getBusNumber(),
                trip == null ? driverName(assignment) : trip.getDriver().getUser().getFullName(),
                assignment == null || assignment.getRoute() == null ? null : assignment.getRoute().getName(), null,
                location == null ? null : location.getLatitude(), location == null ? null : location.getLongitude(),
                location == null ? null : location.getRecordedAt());
    }
    public LiveTrackingResponse tracking(Long studentId) {
        Student student = access.getPrimaryStudent(studentId);
        StudentBus assignment = requireAssignment(student.getId());
        Trip trip = activeTrip(assignment.getBus().getId());
        TripLocation location = trip == null ? null : locations.findFirstByTripIdOrderByRecordedAtDesc(trip.getId()).orElse(null);
        BigDecimal lat = location == null ? null : location.getLatitude(), lon = location == null ? null : location.getLongitude();
        Double distance = lat == null ? null : safeDistance(lat, lon, student.getPickupLatitude(), student.getPickupLongitude());
        Integer eta = distance == null || location.getSpeed() == null || location.getSpeed().signum() <= 0 ? null
                : (int) Math.ceil(distance / location.getSpeed().doubleValue() * 60);
        return new LiveTrackingResponse(lat, lon, location == null ? null : location.getSpeed(),
                location == null ? null : location.getHeading(), location == null ? null : location.getRecordedAt(),
                trip == null ? null : trip.getStatus(), student.getSchool().getLatitude(), student.getSchool().getLongitude(),
                student.getPickupLatitude(), student.getPickupLongitude(), distance, eta);
    }
    public Page<AttendanceResponse> attendance(Long studentId, Pageable pageable) {
        return attendance.findByStudentIdOrderByRecordedAtDesc(access.getPrimaryStudent(studentId).getId(), pageable).map(AttendanceResponse::from);
    }
    public Page<TripHistoryResponse> tripHistory(Long studentId, Pageable pageable) {
        return trips.findByBusIdOrderByCreatedAtDesc(requireAssignment(studentId).getBus().getId(), pageable).map(TripHistoryResponse::from);
    }
    public Page<NotificationResponse> notifications(Pageable pageable) {
        Long schoolId = SecurityUtils.getCurrentSchoolId();
        Long userId = SecurityUtils.getCurrentUserIdOptional().orElseThrow(() -> new UnauthorizedException("Authentication is required"));
        return notifications.findBySchoolIdAndUserIdOrSchoolIdAndUserIsNullOrderByCreatedAtDesc(schoolId, userId, schoolId, pageable).map(NotificationResponse::from);
    }
    @Transactional
    public void updateFcmToken(FcmTokenRequest request) {
        Long schoolId = SecurityUtils.getCurrentSchoolId();
        Long userId = SecurityUtils.getCurrentUserIdOptional().orElseThrow(() -> new UnauthorizedException("Authentication is required"));
        Parent parent = parents.findByUserIdAndSchoolId(userId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent profile not found"));
        parent.setFcmToken(request.token());
    }
    @Transactional
    public void markNotificationRead(Long notificationId) {
        Long schoolId = SecurityUtils.getCurrentSchoolId();
        Long userId = SecurityUtils.getCurrentUserIdOptional().orElseThrow(() -> new UnauthorizedException("Authentication is required"));
        Notification notification = notifications.findByIdAndSchoolId(notificationId, schoolId)
                .filter(n -> n.getUser() == null || n.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true); notification.setReadAt(Instant.now());
    }
    private StudentBus requireAssignment(Long studentId) {
        Student student = access.requireStudentAccess(studentId);
        return studentBuses.findFirstByStudentIdAndActiveTrueOrderByAssignedFromDesc(student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No active bus assignment for this student"));
    }
    private Trip activeTrip(Long busId) { return trips.findFirstByBusIdAndStatusOrderByActualStartDesc(busId, TripStatus.IN_PROGRESS).orElse(null); }
    private String driverName(StudentBus assignment) {
        if (assignment == null) return null;
        return driverBuses.findFirstByBusIdAndActiveTrueOrderByAssignedFromDesc(assignment.getBus().getId())
                .map(a -> a.getDriver().getUser().getFullName()).orElse(null);
    }
    private Double safeDistance(BigDecimal lat, BigDecimal lon, BigDecimal targetLat, BigDecimal targetLon) {
        double distance = GeoUtils.distanceKm(lat, lon, targetLat, targetLon);
        return Double.isNaN(distance) ? null : distance;
    }
}
