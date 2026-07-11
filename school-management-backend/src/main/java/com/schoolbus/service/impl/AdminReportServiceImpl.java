package com.schoolbus.service.impl;

import com.schoolbus.dto.response.AttendanceReportRow;
import com.schoolbus.dto.response.DriverPerformanceRow;
import com.schoolbus.dto.response.ReportSummaryResponse;
import com.schoolbus.dto.response.TripReportRow;
import com.schoolbus.entity.Trip;
import com.schoolbus.entity.enums.BusStatus;
import com.schoolbus.entity.enums.TripStatus;
import com.schoolbus.repository.AttendanceRepository;
import com.schoolbus.repository.BusRepository;
import com.schoolbus.repository.TripRepository;
import com.schoolbus.service.AdminReportService;
import com.schoolbus.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminReportServiceImpl implements AdminReportService {
    private final TripRepository trips;
    private final AttendanceRepository attendance;
    private final BusRepository buses;

    public AdminReportServiceImpl(TripRepository trips, AttendanceRepository attendance, BusRepository buses) {
        this.trips = trips;
        this.attendance = attendance;
        this.buses = buses;
    }

    @Override
    public Page<TripReportRow> trips(LocalDate from, LocalDate to, Pageable pageable) {
        DateRange range = range(from, to);
        return trips.findReportTrips(schoolId(), range.from(), range.to(), pageable).map(this::tripRow);
    }

    @Override
    public Page<AttendanceReportRow> attendance(LocalDate from, LocalDate to, Pageable pageable) {
        DateRange range = range(from, to);
        return attendance.findReportAttendance(schoolId(), range.from(), range.to(), pageable).map(a ->
                new AttendanceReportRow(a.getId(), a.getRecordedAt(), a.getStudent().getFullName(),
                        a.getStudent().getStudentCode(), a.getBus() == null ? null : a.getBus().getBusNumber(),
                        a.getTrip() == null ? null : a.getTrip().getId(), a.getEventType(), a.getMethod()));
    }

    @Override
    public ReportSummaryResponse summary(LocalDate from, LocalDate to) {
        DateRange range = range(from, to);
        List<Trip> reportTrips = trips.findReportTrips(schoolId(), range.from(), range.to());
        long completed = reportTrips.stream().filter(t -> t.getStatus() == TripStatus.COMPLETED).count();
        long emergencies = reportTrips.stream().filter(t -> t.getStatus() == TripStatus.EMERGENCY).count();
        long transported = reportTrips.stream()
                .map(Trip::getStudentsPicked).filter(Objects::nonNull).mapToLong(Integer::longValue).sum();
        return new ReportSummaryResponse(reportTrips.size(), completed, emergencies,
                attendance.countReportAttendance(schoolId(), range.from(), range.to()),
                buses.countBySchoolIdAndStatus(schoolId(), BusStatus.ACTIVE), transported);
    }

    @Override
    public List<DriverPerformanceRow> driverPerformance(LocalDate from, LocalDate to) {
        DateRange range = range(from, to);
        Map<Long, List<Trip>> byDriver = trips.findReportTrips(schoolId(), range.from(), range.to()).stream()
                .collect(Collectors.groupingBy(t -> t.getDriver().getId()));
        return byDriver.values().stream().map(driverTrips -> {
            Trip first = driverTrips.get(0);
            long completed = driverTrips.stream().filter(t -> t.getStatus() == TripStatus.COMPLETED).count();
            long emergencies = driverTrips.stream().filter(t -> t.getStatus() == TripStatus.EMERGENCY).count();
            BigDecimal distance = driverTrips.stream().filter(t -> t.getStatus() == TripStatus.COMPLETED)
                    .map(Trip::getTotalDistanceKm).filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            return new DriverPerformanceRow(first.getDriver().getId(), first.getDriver().getUser().getFirstName()
                    + " " + first.getDriver().getUser().getLastName(), completed, distance, emergencies);
        }).sorted(Comparator.comparing(DriverPerformanceRow::driverName)).toList();
    }

    private TripReportRow tripRow(Trip trip) {
        return new TripReportRow(trip.getId(), trip.getActualStart(), trip.getActualEnd(), trip.getBus().getBusNumber(),
                trip.getDriver().getUser().getFirstName() + " " + trip.getDriver().getUser().getLastName(),
                trip.getRoute().getName(), trip.getTripType(), trip.getStatus(), trip.getTotalDistanceKm(),
                trip.getStudentsPicked(), trip.getStudentsDropped());
    }

    private Long schoolId() {
        return SecurityUtils.getCurrentSchoolId();
    }

    private DateRange range(LocalDate from, LocalDate to) {
        if (from != null && to != null && to.isBefore(from)) {
            throw new IllegalArgumentException("'to' must not be earlier than 'from'");
        }
        ZoneId zone = ZoneId.systemDefault();
        return new DateRange(from == null ? null : from.atStartOfDay(zone).toInstant(),
                to == null ? null : to.plusDays(1).atStartOfDay(zone).toInstant());
    }

    private record DateRange(Instant from, Instant to) {}
}
