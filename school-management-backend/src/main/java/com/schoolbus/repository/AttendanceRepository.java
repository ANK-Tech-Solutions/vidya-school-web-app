package com.schoolbus.repository;

import com.schoolbus.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Page<Attendance> findByStudentIdOrderByRecordedAtDesc(Long studentId, Pageable pageable);

    boolean existsByTripIdAndStudentIdAndEventType(Long tripId, Long studentId,
            com.schoolbus.entity.enums.AttendanceEventType eventType);
    @Query("""
            select a from Attendance a
            join fetch a.student left join fetch a.bus left join fetch a.trip
            where a.school.id = :schoolId
            and (:from is null or a.recordedAt >= :from)
            and (:to is null or a.recordedAt < :to)
            """)
    Page<Attendance> findReportAttendance(@Param("schoolId") Long schoolId, @Param("from") Instant from,
                                          @Param("to") Instant to, Pageable pageable);
    @Query("""
            select count(a) from Attendance a
            where a.school.id = :schoolId
            and (:from is null or a.recordedAt >= :from)
            and (:to is null or a.recordedAt < :to)
            """)
    long countReportAttendance(@Param("schoolId") Long schoolId, @Param("from") Instant from, @Param("to") Instant to);
}
