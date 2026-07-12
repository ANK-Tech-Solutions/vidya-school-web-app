package com.schoolbus.service.impl;

import com.schoolbus.dto.request.*;
import com.schoolbus.dto.response.*;
import com.schoolbus.entity.*;
import com.schoolbus.entity.enums.*;
import com.schoolbus.exception.*;
import com.schoolbus.repository.*;
import com.schoolbus.service.AdminCrudService;
import com.schoolbus.util.SecurityUtils;
import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminCrudServiceImpl implements AdminCrudService {
    private final StudentRepository students;
    private final ParentRepository parents;
    private final DriverRepository drivers;
    private final BusRepository buses;
    private final RouteRepository routes;
    private final SchoolRepository schools;
    private final UserRepository users;
    private final RoleRepository roles;
    private final RouteStopRepository routeStops;
    private final PasswordEncoder encoder;

    public AdminCrudServiceImpl(
            StudentRepository a,
            ParentRepository b,
            DriverRepository c,
            BusRepository d,
            RouteRepository e,
            SchoolRepository f,
            UserRepository g,
            RoleRepository h,
            RouteStopRepository routeStops,
            PasswordEncoder i) {
        students = a;
        parents = b;
        drivers = c;
        buses = d;
        routes = e;
        schools = f;
        users = g;
        roles = h;
        this.routeStops = routeStops;
        encoder = i;
    }

    private Long sid() {
        return SecurityUtils.getCurrentSchoolId();
    }

    private School school() {
        return schools.getReferenceById(sid());
    }

    private Parent parentEntity(Long id) {
        return parents.findByIdAndSchoolId(id, sid()).orElseThrow(() -> new ResourceNotFoundException("Parent not found"));
    }

    private Driver driverEntity(Long id) {
        return drivers.findByIdAndSchoolId(id, sid()).orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
    }

    private Bus busEntity(Long id) {
        return buses.findByIdAndSchoolId(id, sid()).orElseThrow(() -> new ResourceNotFoundException("Bus not found"));
    }

    private Route routeEntity(Long id) {
        return routes.findByIdAndSchoolId(id, sid()).orElseThrow(() -> new ResourceNotFoundException("Route not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentResponse> students(String s, String g, Pageable p) {
        return students.search(sid(), s, g, p).map(StudentResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse student(Long id) {
        return StudentResponse.from(
                students.findByIdAndSchoolId(id, sid()).orElseThrow(() -> new ResourceNotFoundException("Student not found")));
    }

    @Override
    @Transactional
    public StudentResponse createStudent(StudentRequest r) {
        Student x = new Student();
        x.setSchool(school());
        if (r.username() != null && !r.username().isBlank()) {
            if (r.email() == null || r.email().isBlank()) throw new BadRequestException("Email is required when creating a student login");
            check(r.username(), r.email());
            User u = new User();
            u.setSchool(school());
            u.setUsername(r.username());
            u.setEmail(r.email());
            u.setFirstName(r.firstName());
            u.setLastName(r.lastName());
            u.setPasswordHash(encoder.encode(r.password() == null || r.password().isBlank() ? "Password@123" : r.password()));
            u.getRoles().add(roles.findByName(RoleType.STUDENT).orElseThrow(() -> new ResourceNotFoundException("Role not found")));
            x.setUser(users.save(u));
        }
        copy(x, r);
        return StudentResponse.from(students.save(x));
    }

    @Override
    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest r) {
        Student x = students.findByIdAndSchoolId(id, sid()).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        copy(x, r);
        return StudentResponse.from(x);
    }

    @Override
    @Transactional
    public void deactivateStudent(Long id) {
        Student x = students.findByIdAndSchoolId(id, sid()).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        x.setActive(false);
    }

    private void copy(Student x, StudentRequest r) {
        x.setStudentCode(r.studentCode());
        x.setFirstName(r.firstName());
        x.setLastName(r.lastName());
        x.setGrade(r.grade());
        x.setSection(r.section());
        x.setGender(r.gender());
        x.setDateOfBirth(r.dateOfBirth());
        x.setPickupAddress(r.pickupAddress());
        x.setPickupLatitude(r.pickupLatitude());
        x.setPickupLongitude(r.pickupLongitude());
        x.setDropAddress(r.dropAddress());
        x.setDropLatitude(r.dropLatitude());
        x.setDropLongitude(r.dropLongitude());
        x.setRfidTag(r.rfidTag());
        if (r.active() != null) x.setActive(r.active());
        x.setParent(r.parentId() == null ? null : parentEntity(r.parentId()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ParentResponse> parents(String s, Pageable p) {
        return parents.search(sid(), s, p).map(ParentResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public ParentResponse parent(Long id) {
        return ParentResponse.from(parentEntity(id));
    }

    @Override
    @Transactional
    public ParentResponse createParent(ParentRequest r) {
        return ParentResponse.from(parents.save(new Parent(null, user(r, RoleType.PARENT), school(), r.relationship(), r.address(), r.emergencyContact(), null)));
    }

    @Override
    @Transactional
    public ParentResponse updateParent(Long id, ParentRequest r) {
        Parent p = parentEntity(id);
        copy(p.getUser(), r);
        p.setRelationship(r.relationship());
        p.setAddress(r.address());
        p.setEmergencyContact(r.emergencyContact());
        return ParentResponse.from(p);
    }

    @Override
    @Transactional
    public void deactivateParent(Long id) {
        parentEntity(id).getUser().setActive(false);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DriverResponse> drivers(String s, Pageable p) {
        return drivers.search(sid(), s, p).map(DriverResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public DriverResponse driver(Long id) {
        return DriverResponse.from(driverEntity(id));
    }

    @Override
    @Transactional
    public DriverResponse createDriver(DriverRequest r) {
        Driver d = new Driver();
        d.setUser(user(r, RoleType.DRIVER));
        d.setSchool(school());
        copy(d, r);
        return DriverResponse.from(drivers.save(d));
    }

    @Override
    @Transactional
    public DriverResponse updateDriver(Long id, DriverRequest r) {
        Driver d = driverEntity(id);
        copy(d.getUser(), r);
        copy(d, r);
        return DriverResponse.from(d);
    }

    @Override
    @Transactional
    public void deactivateDriver(Long id) {
        driverEntity(id).getUser().setActive(false);
    }

    private User user(ParentRequest r, RoleType role) {
        check(r.username(), r.email());
        User u = new User();
        u.setSchool(school());
        u.setUsername(r.username());
        u.setEmail(r.email());
        u.setPasswordHash(encoder.encode(r.password() == null || r.password().isBlank() ? "Password@123" : r.password()));
        copy(u, r);
        u.getRoles().add(roles.findByName(role).orElseThrow(() -> new ResourceNotFoundException("Role not found")));
        return users.save(u);
    }

    private User user(DriverRequest r, RoleType role) {
        check(r.username(), r.email());
        User u = new User();
        u.setSchool(school());
        u.setUsername(r.username());
        u.setEmail(r.email());
        u.setPasswordHash(encoder.encode(r.password() == null || r.password().isBlank() ? "Password@123" : r.password()));
        copy(u, r);
        u.getRoles().add(roles.findByName(role).orElseThrow(() -> new ResourceNotFoundException("Role not found")));
        return users.save(u);
    }

    private void check(String n, String e) {
        if (users.existsByUsername(n) || users.existsByEmail(e)) throw new BadRequestException("Username or email already exists");
    }

    private void copy(User u, ParentRequest r) {
        u.setUsername(r.username());
        u.setEmail(r.email());
        u.setFirstName(r.firstName());
        u.setLastName(r.lastName());
        u.setPhone(r.phone());
        if (r.password() != null && !r.password().isBlank()) u.setPasswordHash(encoder.encode(r.password()));
        if (r.active() != null) u.setActive(r.active());
    }

    private void copy(User u, DriverRequest r) {
        u.setUsername(r.username());
        u.setEmail(r.email());
        u.setFirstName(r.firstName());
        u.setLastName(r.lastName());
        u.setPhone(r.phone());
        if (r.password() != null && !r.password().isBlank()) u.setPasswordHash(encoder.encode(r.password()));
        if (r.active() != null) u.setActive(r.active());
    }

    private void copy(Driver d, DriverRequest r) {
        d.setLicenseNumber(r.licenseNumber());
        d.setLicenseExpiry(r.licenseExpiry());
        d.setExperienceYears(r.experienceYears());
        d.setBloodGroup(r.bloodGroup());
        d.setEmergencyContact(r.emergencyContact());
        d.setAddress(r.address());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BusResponse> buses(String s, Pageable p) {
        return buses.search(sid(), s, p).map(BusResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public BusResponse bus(Long id) {
        return BusResponse.from(busEntity(id));
    }

    @Override
    @Transactional
    public BusResponse createBus(BusRequest r) {
        Bus b = new Bus();
        b.setSchool(school());
        copy(b, r);
        return BusResponse.from(buses.save(b));
    }

    @Override
    @Transactional
    public BusResponse updateBus(Long id, BusRequest r) {
        Bus b = busEntity(id);
        copy(b, r);
        return BusResponse.from(b);
    }

    @Override
    @Transactional
    public void deactivateBus(Long id) {
        busEntity(id).setStatus(BusStatus.INACTIVE);
    }

    private void copy(Bus b, BusRequest r) {
        b.setBusNumber(r.busNumber());
        b.setPlateNumber(r.plateNumber());
        b.setMake(r.make());
        b.setModel(r.model());
        b.setYearOfMake(r.yearOfMake());
        b.setCapacity(r.capacity());
        b.setColor(r.color());
        b.setGpsDeviceId(r.gpsDeviceId());
        b.setStatus(r.status() == null ? BusStatus.ACTIVE : r.status());
        b.setInsuranceExpiry(r.insuranceExpiry());
        b.setFitnessExpiry(r.fitnessExpiry());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RouteResponse> routes(String s, Pageable p) {
        return routes.search(sid(), s, p).map(RouteResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public RouteResponse route(Long id) {
        return RouteResponse.from(routeEntity(id));
    }

    @Override
    @Transactional
    public RouteResponse createRoute(RouteRequest r) {
        Route x = new Route();
        x.setSchool(school());
        copy(x, r);
        return RouteResponse.from(routes.save(x));
    }

    @Override
    @Transactional
    public RouteResponse updateRoute(Long id, RouteRequest r) {
        Route x = routeEntity(id);
        copy(x, r);
        return RouteResponse.from(x);
    }

    @Override
    @Transactional
    public void deactivateRoute(Long id) {
        routeEntity(id).setActive(false);
    }

    @Override
    @Transactional
    public RouteStopResponse addRouteStop(Long routeId, RouteStopRequest r) {
        Route route = routeEntity(routeId);
        int nextOrder = route.getStops().stream().map(RouteStop::getStopOrder).filter(Objects::nonNull).max(Integer::compareTo).orElse(0) + 1;
        RouteStop stop = RouteStop.builder()
                .name(r.name())
                .stopOrder(r.stopOrder() == null ? nextOrder : r.stopOrder())
                .latitude(r.latitude())
                .longitude(r.longitude())
                .address(r.address())
                .estimatedArrivalMins(r.estimatedArrivalMins())
                .geofenceRadiusM(r.geofenceRadiusM() == null ? 100 : r.geofenceRadiusM())
                .build();
        route.addStop(stop);
        return RouteStopResponse.from(routeStops.save(stop));
    }

    @Override
    @Transactional
    public RouteStopResponse updateRouteStop(Long routeId, Long stopId, RouteStopRequest r) {
        Route route = routeEntity(routeId);
        RouteStop stop = route.getStops().stream()
                .filter(s -> s.getId().equals(stopId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Stop not found"));
        stop.setName(r.name());
        if (r.stopOrder() != null) stop.setStopOrder(r.stopOrder());
        stop.setLatitude(r.latitude());
        stop.setLongitude(r.longitude());
        stop.setAddress(r.address());
        if (r.estimatedArrivalMins() != null) stop.setEstimatedArrivalMins(r.estimatedArrivalMins());
        if (r.geofenceRadiusM() != null) stop.setGeofenceRadiusM(r.geofenceRadiusM());
        return RouteStopResponse.from(stop);
    }

    @Override
    @Transactional
    public void deleteRouteStop(Long routeId, Long stopId) {
        Route route = routeEntity(routeId);
        RouteStop stop = route.getStops().stream()
                .filter(s -> s.getId().equals(stopId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Stop not found"));
        route.getStops().remove(stop);
        stop.setRoute(null);
        routeStops.delete(stop);
        int order = 1;
        for (RouteStop remaining : route.getStops().stream().sorted(Comparator.comparing(RouteStop::getStopOrder)).toList()) {
            remaining.setStopOrder(order++);
        }
    }

    private void copy(Route x, RouteRequest r) {
        x.setName(r.name());
        x.setCode(r.code());
        x.setDescription(r.description());
        x.setStartLatitude(r.startLatitude());
        x.setStartLongitude(r.startLongitude());
        x.setEndLatitude(r.endLatitude());
        x.setEndLongitude(r.endLongitude());
        x.setEstimatedDurationMins(r.estimatedDurationMins());
        x.setDistanceKm(r.distanceKm());
        if (r.active() != null) x.setActive(r.active());
        x.clearStops();
        if (r.stops() != null) {
            int i = 1;
            for (RouteStopRequest s : r.stops()) {
                RouteStop z = new RouteStop();
                z.setName(s.name());
                z.setStopOrder(s.stopOrder() == null ? i : s.stopOrder());
                z.setLatitude(s.latitude());
                z.setLongitude(s.longitude());
                z.setAddress(s.address());
                z.setEstimatedArrivalMins(s.estimatedArrivalMins());
                z.setGeofenceRadiusM(s.geofenceRadiusM());
                x.addStop(z);
                i++;
            }
        }
    }
}
