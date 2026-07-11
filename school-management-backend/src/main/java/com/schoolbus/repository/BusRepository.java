package com.schoolbus.repository;
import com.schoolbus.entity.*; import com.schoolbus.entity.enums.BusStatus; import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.util.*;
public interface BusRepository extends org.springframework.data.jpa.repository.JpaRepository<Bus,Long> {
 Optional<Bus> findByIdAndSchoolId(Long id,Long schoolId); Page<Bus> findBySchoolId(Long schoolId,Pageable p); long countBySchoolIdAndStatus(Long schoolId,BusStatus status);
 @Query("select b from Bus b where b.school.id=:schoolId and (:search is null or lower(b.busNumber) like lower(concat('%',:search,'%')) or lower(b.plateNumber) like lower(concat('%',:search,'%')))") Page<Bus> search(@Param("schoolId") Long schoolId,@Param("search") String search,Pageable pageable);
}
