package com.schoolbus.service;

import com.schoolbus.dto.request.LocationUpdateRequest;
import com.schoolbus.entity.Attendance;
import com.schoolbus.entity.Parent;
import com.schoolbus.entity.RouteStop;
import com.schoolbus.entity.Student;
import com.schoolbus.entity.StudentBus;
import com.schoolbus.entity.Trip;
import com.schoolbus.entity.TripStopEvent;
import com.schoolbus.entity.User;
import com.schoolbus.entity.enums.AttendanceEventType;
import com.schoolbus.entity.enums.AttendanceMethod;
import com.schoolbus.entity.enums.NotificationType;
import com.schoolbus.entity.enums.RoleType;
import com.schoolbus.repository.AttendanceRepository;
import com.schoolbus.repository.RouteStopRepository;
import com.schoolbus.repository.StudentBusRepository;
import com.schoolbus.repository.TripStopEventRepository;
import com.schoolbus.repository.UserRepository;
import com.schoolbus.util.GeoUtils;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/**
 * Derives automatic events from live driver GPS: geofence arrivals (bus approaching a stop),
 * overspeed alerts, and no-show detection (a student's stop was passed without boarding).
 * Invoked from the driver location-update path inside its transaction.
 */
@Service
public class TripEventService {
    /** Alert threshold in km/h. Browser Geolocation reports speed in metres/second. */
    private static final double OVERSPEED_KMH = 60.0;
    private static final Duration OVERSPEED_COOLDOWN = Duration.ofMinutes(5);
    private static final int MIN_GEOFENCE_METERS = 80;
    private static final String ARRIVED = "ARRIVED";

    private final RouteStopRepository routeStops;
    private final StudentBusRepository studentBuses;
    private final TripStopEventRepository tripStopEvents;
    private final AttendanceRepository attendance;
    private final NotificationService notificationService;
    private final UserRepository users;

    // In-memory de-dupe for overspeed alerts (single-instance deployment). Keyed by trip id.
    private final Map<Long, Instant> lastOverspeedAlert = new ConcurrentHashMap<>();

    public TripEventService(RouteStopRepository routeStops, StudentBusRepository studentBuses,
                            TripStopEventRepository tripStopEvents, AttendanceRepository attendance,
                            NotificationService notificationService, UserRepository users) {
        this.routeStops = routeStops;
        this.studentBuses = studentBuses;
        this.tripStopEvents = tripStopEvents;
        this.attendance = attendance;
        this.notificationService = notificationService;
        this.users = users;
    }

    public void process(Trip trip, LocationUpdateRequest request, Instant recordedAt) {
        if (trip == null || request.latitude() == null || request.longitude() == null) {
            return;
        }
        checkOverspeed(trip, request, recordedAt);
        if (trip.getRoute() == null) {
            return;
        }
        List<RouteStop> stops = routeStops.findByRouteIdOrderByStopOrderAsc(trip.getRoute().getId());
        if (stops.isEmpty()) {
            return;
        }
        List<StudentBus> assignedStudents = trip.getRoute() == null
                ? studentBuses.findByBusIdAndActiveTrue(trip.getBus().getId())
                : studentBuses.findByRouteIdAndActiveTrue(trip.getRoute().getId());
        for (RouteStop stop : stops) {
            double distanceM = GeoUtils.distanceKm(stop.getLatitude(), stop.getLongitude(),
                    request.latitude(), request.longitude()) * 1000.0;
            if (Double.isNaN(distanceM)) {
                continue;
            }
            int radius = Math.max(stop.getGeofenceRadiusM() == null ? MIN_GEOFENCE_METERS : stop.getGeofenceRadiusM(),
                    MIN_GEOFENCE_METERS);
            if (distanceM <= radius && !tripStopEvents.existsByTripIdAndStopIdAndEventType(trip.getId(), stop.getId(), ARRIVED)) {
                onStopArrival(trip, stop, stops, assignedStudents);
            }
        }
    }

    private void onStopArrival(Trip trip, RouteStop stop, List<RouteStop> stops, List<StudentBus> assignedStudents) {
        tripStopEvents.save(TripStopEvent.builder()
                .tripId(trip.getId()).stopId(stop.getId()).eventType(ARRIVED).recordedAt(Instant.now()).build());

        // Notify parents whose child is assigned to this stop that the bus has arrived.
        for (StudentBus assignment : assignedStudents) {
            if (assignment.getStop() != null && Objects.equals(assignment.getStop().getId(), stop.getId())) {
                notifyParent(trip, assignment.getStudent(), NotificationType.BUS_APPROACHING,
                        "Bus arriving at " + stop.getName(),
                        "Bus " + trip.getBus().getBusNumber() + " has reached " + stop.getName() + ".");
            }
        }

        // No-show: any earlier stop the bus has now passed whose students never boarded.
        Integer arrivedOrder = stop.getStopOrder();
        if (arrivedOrder == null) {
            return;
        }
        for (StudentBus assignment : assignedStudents) {
            RouteStop studentStop = assignment.getStop();
            if (studentStop == null || studentStop.getStopOrder() == null
                    || studentStop.getStopOrder() >= arrivedOrder) {
                continue;
            }
            Student student = assignment.getStudent();
            boolean boarded = attendance.existsByTripIdAndStudentIdAndEventType(trip.getId(), student.getId(),
                    AttendanceEventType.BOARDING);
            boolean alreadyAbsent = attendance.existsByTripIdAndStudentIdAndEventType(trip.getId(), student.getId(),
                    AttendanceEventType.ABSENT);
            if (boarded || alreadyAbsent) {
                continue;
            }
            attendance.save(Attendance.builder()
                    .school(trip.getSchool()).student(student).trip(trip).bus(trip.getBus())
                    .method(AttendanceMethod.GEOFENCE).eventType(AttendanceEventType.ABSENT)
                    .recordedAt(Instant.now()).notes("Auto no-show: bus passed stop without boarding").build());
            notifyParent(trip, student, NotificationType.NO_SHOW,
                    "Student not on board",
                    student.getFullName() + " did not board at " + studentStop.getName() + ".");
        }
    }

    private void checkOverspeed(Trip trip, LocationUpdateRequest request, Instant recordedAt) {
        if (request.speed() == null) {
            return;
        }
        double kmh = request.speed().doubleValue() * 3.6;
        if (kmh < OVERSPEED_KMH) {
            return;
        }
        Instant last = lastOverspeedAlert.get(trip.getId());
        if (last != null && Duration.between(last, recordedAt).compareTo(OVERSPEED_COOLDOWN) < 0) {
            return;
        }
        lastOverspeedAlert.put(trip.getId(), recordedAt);
        String body = String.format("Bus %s is travelling at %.0f km/h.", trip.getBus().getBusNumber(), kmh);
        users.findBySchoolIdAndRole(trip.getSchool().getId(), RoleType.ADMIN, PageRequest.of(0, 50))
                .forEach(admin -> notificationService.create(trip.getSchool(), admin, null,
                        "Overspeed alert", body, NotificationType.OVERSPEED, "TRIP", trip.getId(),
                        Map.of("tripId", String.valueOf(trip.getId()))));
    }

    private void notifyParent(Trip trip, Student student, NotificationType type, String title, String body) {
        Parent parent = student.getParent();
        if (parent == null) {
            return;
        }
        User user = parent.getUser();
        notificationService.create(trip.getSchool(), user, parent.getFcmToken(), title, body, type,
                "TRIP", trip.getId(), Map.of("tripId", String.valueOf(trip.getId())));
    }
}
