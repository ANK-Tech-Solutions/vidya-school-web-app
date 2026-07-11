package com.schoolbus.service.impl;

import com.schoolbus.dto.request.*;
import com.schoolbus.dto.response.*;
import com.schoolbus.entity.*;
import com.schoolbus.entity.enums.*;
import com.schoolbus.exception.BadRequestException;
import com.schoolbus.exception.ResourceNotFoundException;
import com.schoolbus.repository.*;
import com.schoolbus.service.DriverService;
import com.schoolbus.service.LiveTrackingBroker;
import com.schoolbus.service.NotificationService;
import com.schoolbus.util.SecurityUtils;
import java.time.Instant;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DriverServiceImpl implements DriverService {
    private final DriverRepository drivers;
    private final DriverBusRepository driverBuses;
    private final StudentBusRepository studentBuses;
    private final TripRepository trips;
    private final TripLocationRepository tripLocations;
    private final RouteStopRepository routeStops;
    private final NotificationService notificationService;
    private final LiveTrackingBroker liveTrackingBroker;

    public DriverServiceImpl(DriverRepository drivers, DriverBusRepository driverBuses,
                             StudentBusRepository studentBuses, TripRepository trips,
                             TripLocationRepository tripLocations, RouteStopRepository routeStops,
                             NotificationService notificationService,
                             LiveTrackingBroker liveTrackingBroker) {
        this.drivers = drivers;
        this.driverBuses = driverBuses;
        this.studentBuses = studentBuses;
        this.trips = trips;
        this.tripLocations = tripLocations;
        this.routeStops = routeStops;
        this.notificationService = notificationService;
        this.liveTrackingBroker = liveTrackingBroker;
    }

    private Driver getCurrentDriver() {
        Long userId = SecurityUtils.getCurrentUserIdOptional()
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        return drivers.findByUserIdAndSchoolId(userId, SecurityUtils.getCurrentSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found"));
    }

    private Optional<DriverBus> findAssignment(Driver driver) {
        return driverBuses.findFirstByDriverIdAndActiveTrueOrderByAssignedFromDesc(driver.getId());
    }

    private DriverBus assignment(Driver driver) {
        return findAssignment(driver)
                .orElseThrow(() -> new BadRequestException("No active bus assignment found"));
    }

    private Optional<Trip> findActiveTrip(Driver driver) {
        return trips.findFirstByDriverIdAndStatusOrderByActualStartDesc(driver.getId(), TripStatus.IN_PROGRESS)
                .or(() -> trips.findFirstByDriverIdAndStatusOrderByActualStartDesc(driver.getId(), TripStatus.EMERGENCY));
    }

    private Trip currentTrip(Driver driver) {
        return findActiveTrip(driver)
                .orElseThrow(() -> new ResourceNotFoundException("No active trip found"));
    }

    @Override
    @Transactional(readOnly = true)
    public DriverDashboardResponse dashboard() {
        Driver driver = getCurrentDriver();
        Optional<DriverBus> assignment = driverBuses.findFirstByDriverIdAndActiveTrueOrderByAssignedFromDesc(driver.getId());
        Optional<Trip> active = trips.findFirstByDriverIdAndStatusOrderByActualStartDesc(driver.getId(), TripStatus.IN_PROGRESS)
                .or(() -> trips.findFirstByDriverIdAndStatusOrderByActualStartDesc(driver.getId(), TripStatus.EMERGENCY));
        long students = assignment.map(this::studentsFor).map(List::size).orElse(0);
        AssignedBusResponse bus = assignment.map(AssignedBusResponse::from).orElse(null);
        AssignedRouteResponse route = assignment
                .filter(a -> a.getRoute() != null)
                .map(AssignedRouteResponse::from)
                .orElse(null);
        TripResponse trip = active.map(TripResponse::from).orElse(null);
        return new DriverDashboardResponse(
                bus,
                route,
                trip,
                driver.getLocationEnabled(),
                driver.getOnline(),
                students,
                bus == null ? null : bus.busNumber(),
                route == null ? null : route.name(),
                active.map(Trip::getStatus).orElse(null),
                trip == null ? null : trip.id());
    }

    @Override
    @Transactional(readOnly = true)
    public DriverProfileResponse profile() {
        return DriverProfileResponse.from(getCurrentDriver());
    }

    @Override
    @Transactional
    public DriverProfileResponse updateProfile(DriverProfileUpdateRequest request) {
        Driver driver = getCurrentDriver();
        if (request.phone() != null) driver.getUser().setPhone(request.phone());
        if (request.emergencyContact() != null) driver.setEmergencyContact(request.emergencyContact());
        if (request.address() != null) driver.setAddress(request.address());
        if (request.bloodGroup() != null) driver.setBloodGroup(request.bloodGroup());
        if (request.fcmToken() != null) driver.setFcmToken(request.fcmToken());
        return DriverProfileResponse.from(driver);
    }

    @Override
    @Transactional
    public void updateFcmToken(FcmTokenRequest request) {
        getCurrentDriver().setFcmToken(request.token());
    }

    @Override
    @Transactional(readOnly = true)
    public AssignedBusResponse assignedBus() {
        return findAssignment(getCurrentDriver()).map(AssignedBusResponse::from).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public AssignedRouteResponse assignedRoute() {
        return findAssignment(getCurrentDriver())
                .filter(a -> a.getRoute() != null)
                .map(AssignedRouteResponse::from)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TodayStudentResponse> todayStudents() {
        return findAssignment(getCurrentDriver())
                .map(this::studentsFor)
                .orElseGet(List::of)
                .stream()
                .map(TodayStudentResponse::from)
                .toList();
    }

    private List<StudentBus> studentsFor(DriverBus assignment) {
        return assignment.getRoute() == null
                ? studentBuses.findByBusIdAndActiveTrue(assignment.getBus().getId())
                : studentBuses.findByRouteIdAndActiveTrue(assignment.getRoute().getId());
    }

    @Override
    @Transactional
    public void enableLocation() {
        Driver driver = getCurrentDriver();
        driver.setLocationEnabled(true);
        driver.setOnline(true);
    }

    @Override
    @Transactional
    public void disableLocation() {
        Driver driver = getCurrentDriver();
        driver.setLocationEnabled(false);
        driver.setOnline(false);
    }

    @Override
    @Transactional
    public void updateLocation(LocationUpdateRequest request) {
        updateLocation(request, null);
    }

    @Override
    @Transactional
    public void updateLocation(LocationUpdateRequest request, Long requestedTripId) {
        Driver driver = getCurrentDriver();
        Instant recordedAt = request.recordedAt() == null ? Instant.now() : request.recordedAt();
        driver.setLastLatitude(request.latitude());
        driver.setLastLongitude(request.longitude());
        driver.setLastLocationAt(recordedAt);
        findLiveTrip(driver, requestedTripId).ifPresent(trip -> {
            tripLocations.save(TripLocation.builder().trip(trip).latitude(request.latitude())
                    .longitude(request.longitude()).accuracy(request.accuracy()).heading(request.heading())
                    .speed(request.speed()).altitude(request.altitude()).recordedAt(recordedAt).build());
            liveTrackingBroker.broadcast(trip, request, recordedAt);
        });
    }

    private Optional<Trip> findLiveTrip(Driver driver, Long requestedTripId) {
        if (requestedTripId == null) {
            return trips.findFirstByDriverIdAndStatusOrderByActualStartDesc(driver.getId(), TripStatus.IN_PROGRESS)
                    .or(() -> trips.findFirstByDriverIdAndStatusOrderByActualStartDesc(driver.getId(), TripStatus.EMERGENCY));
        }

        Trip trip = trips.findById(requestedTripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        boolean belongsToDriver = Objects.equals(trip.getDriver().getId(), driver.getId());
        boolean belongsToSchool = Objects.equals(trip.getSchool().getId(), driver.getSchool().getId());
        boolean isLive = trip.getStatus() == TripStatus.IN_PROGRESS || trip.getStatus() == TripStatus.EMERGENCY;
        if (!belongsToDriver || !belongsToSchool || !isLive) {
            throw new BadRequestException("The selected trip is not active for this driver");
        }
        return Optional.of(trip);
    }

    @Override
    @Transactional
    public TripResponse startTrip(StartTripRequest request) {
        Driver driver = getCurrentDriver();
        if (!trips.findByDriverIdAndStatus(driver.getId(), TripStatus.IN_PROGRESS).isEmpty()) {
            throw new BadRequestException("An in-progress trip already exists");
        }
        DriverBus assignment = assignment(driver);
        if (assignment.getRoute() == null) throw new BadRequestException("An active route assignment is required to start a trip");
        Trip trip = Trip.builder().school(driver.getSchool()).driver(driver).bus(assignment.getBus()).route(assignment.getRoute())
                .tripType(request.tripType() == null ? TripType.MORNING : request.tripType()).status(TripStatus.IN_PROGRESS)
                .actualStart(Instant.now()).startLatitude(driver.getLastLatitude()).startLongitude(driver.getLastLongitude()).build();
        trip = trips.save(trip);
        notifyParents(driver, NotificationType.BUS_STARTED, "Bus trip started",
                "Bus " + assignment.getBus().getBusNumber() + " has started its trip", trip);
        return TripResponse.from(trip);
    }

    @Override
    @Transactional
    public TripResponse endTrip() {
        Driver driver = getCurrentDriver();
        Trip trip = currentTrip(driver);
        if (trip.getStatus() == TripStatus.EMERGENCY) throw new BadRequestException("Resolve the emergency before ending this trip");
        trip.setStatus(TripStatus.COMPLETED);
        trip.setActualEnd(Instant.now());
        trip.setEndLatitude(driver.getLastLatitude());
        trip.setEndLongitude(driver.getLastLongitude());
        notifyParents(driver, NotificationType.TRIP_COMPLETED, "Trip completed",
                "Bus " + trip.getBus().getBusNumber() + " has completed its trip", trip);
        return TripResponse.from(trip);
    }

    @Override
    @Transactional
    public void sendSos(SosRequest request) {
        Driver driver = getCurrentDriver();
        Optional<Trip> active = trips.findFirstByDriverIdAndStatusOrderByActualStartDesc(driver.getId(), TripStatus.IN_PROGRESS);
        active.ifPresent(trip -> trip.setStatus(TripStatus.EMERGENCY));
        String details = request.message() == null || request.message().isBlank() ? "Driver SOS alert" : request.message();
        if (request.latitude() != null && request.longitude() != null) {
            details += " Location: " + request.latitude() + ", " + request.longitude();
        }
        notifyParents(driver, NotificationType.EMERGENCY, "Emergency SOS", details, active.orElse(null));
    }

    private void notifyParents(Driver driver, NotificationType type, String title, String body, Trip trip) {
        String referenceType = trip == null ? "DRIVER" : "TRIP";
        Long referenceId = trip == null ? driver.getId() : trip.getId();
        Optional<DriverBus> assignment = findAssignment(driver);
        if (assignment.isEmpty()) {
            return;
        }
        studentsFor(assignment.get()).stream()
                .map(StudentBus::getStudent)
                .map(Student::getParent)
                .filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toMap(Parent::getId, parent -> parent, (first, ignored) -> first))
                .values()
                .forEach(parent -> notificationService.create(driver.getSchool(), parent.getUser(), parent.getFcmToken(),
                        title, body, type, referenceType, referenceId,
                        Map.of(referenceType.toLowerCase() + "Id", String.valueOf(referenceId))));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TripResponse> tripHistory(Pageable pageable) {
        return trips.findByDriverIdOrderByCreatedAtDesc(getCurrentDriver().getId(), pageable).map(TripResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public TripResponse activeTrip() {
        return findActiveTrip(getCurrentDriver()).map(TripResponse::from).orElse(null);
    }

    @Override
    @Transactional
    public RouteStopResponse addStopFromLocation(DriverAddStopRequest request) {
        DriverBus assignment = assignment(getCurrentDriver());
        Route route = assignment.getRoute();
        if (route == null) {
            throw new BadRequestException("Assign a route before adding stops");
        }
        int nextOrder = routeStops.findByRouteId(route.getId()).stream()
                .map(RouteStop::getStopOrder)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 1;
        RouteStop stop = RouteStop.builder()
                .route(route)
                .name(request.name().trim())
                .stopOrder(nextOrder)
                .latitude(request.latitude())
                .longitude(request.longitude())
                .address(request.address())
                .geofenceRadiusM(request.geofenceRadiusM() == null ? 100 : request.geofenceRadiusM())
                .build();
        route.addStop(stop);
        return RouteStopResponse.from(routeStops.save(stop));
    }
}
