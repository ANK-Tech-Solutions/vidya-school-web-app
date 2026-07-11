package com.schoolbus.service.impl;
import com.schoolbus.dto.response.DashboardStatsResponse;
import com.schoolbus.entity.enums.*; import com.schoolbus.repository.*; import com.schoolbus.service.AdminDashboardService; import com.schoolbus.util.SecurityUtils;
import org.springframework.stereotype.Service; import java.time.*; import java.time.temporal.ChronoUnit;
@Service
public class AdminDashboardServiceImpl implements AdminDashboardService {
 private final DriverRepository drivers; private final StudentRepository students; private final ParentRepository parents; private final BusRepository buses; private final TripRepository trips; private final NotificationRepository notifications;
 public AdminDashboardServiceImpl(DriverRepository drivers, StudentRepository students, ParentRepository parents, BusRepository buses, TripRepository trips, NotificationRepository notifications) { this.drivers=drivers;this.students=students;this.parents=parents;this.buses=buses;this.trips=trips;this.notifications=notifications; }
 public DashboardStatsResponse getStats() { Long schoolId=SecurityUtils.getCurrentSchoolId(); Instant start=LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant(); Instant end=start.plus(1,ChronoUnit.DAYS); return new DashboardStatsResponse(drivers.countBySchoolIdAndOnlineTrue(schoolId),students.countBySchoolId(schoolId),parents.countBySchoolId(schoolId),drivers.countBySchoolId(schoolId),buses.countBySchoolIdAndStatus(schoolId,BusStatus.ACTIVE),trips.countBySchoolIdAndStatus(schoolId,TripStatus.IN_PROGRESS),trips.countBySchoolIdAndStatusAndActualEndBetween(schoolId,TripStatus.COMPLETED,start,end),notifications.countBySchoolIdAndReadFalse(schoolId)); }
}
