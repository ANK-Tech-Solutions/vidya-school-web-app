package com.schoolbus.repository;
import com.schoolbus.entity.Trip; import com.schoolbus.entity.enums.TripStatus; import java.time.*; import java.util.*; import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.Query; import org.springframework.data.repository.query.Param;
public interface TripRepository extends org.springframework.data.jpa.repository.JpaRepository<Trip,Long> {
 long countBySchoolIdAndStatus(Long schoolId,TripStatus status);
 long countBySchoolIdAndStatusAndActualEndBetween(Long schoolId,TripStatus status,Instant from,Instant to);
 List<Trip> findByDriverIdAndStatus(Long driverId, TripStatus status);
 Optional<Trip> findFirstByDriverIdAndStatusOrderByActualStartDesc(Long driverId, TripStatus status);
 Page<Trip> findByDriverIdOrderByCreatedAtDesc(Long driverId, Pageable pageable);
 Optional<Trip> findFirstByBusIdAndStatusOrderByActualStartDesc(Long busId, TripStatus status);
 Page<Trip> findByBusIdOrderByCreatedAtDesc(Long busId, Pageable pageable);
 @Query("""
         select t from Trip t
         join fetch t.bus join fetch t.driver d join fetch d.user join fetch t.route
         where t.school.id = :schoolId
         and (:from is null or t.actualStart >= :from)
         and (:to is null or t.actualStart < :to)
         """)
 Page<Trip> findReportTrips(@Param("schoolId") Long schoolId, @Param("from") Instant from,
                            @Param("to") Instant to, Pageable pageable);
 @Query("""
         select t from Trip t
         join fetch t.driver d join fetch d.user
         where t.school.id = :schoolId
         and (:from is null or t.actualStart >= :from)
         and (:to is null or t.actualStart < :to)
         """)
 List<Trip> findReportTrips(@Param("schoolId") Long schoolId, @Param("from") Instant from,
                            @Param("to") Instant to);
}
