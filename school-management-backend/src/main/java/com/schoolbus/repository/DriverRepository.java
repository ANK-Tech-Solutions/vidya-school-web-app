package com.schoolbus.repository;
import com.schoolbus.entity.Driver; import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.util.*;
public interface DriverRepository extends JpaRepository<Driver,Long> {
 Optional<Driver> findByIdAndSchoolId(Long id,Long schoolId); long countBySchoolId(Long schoolId); long countBySchoolIdAndOnlineTrue(Long schoolId);
 Optional<Driver> findByUserId(Long userId);
 Optional<Driver> findByUserIdAndSchoolId(Long userId, Long schoolId);
 List<Driver> findBySchoolId(Long schoolId);
 @Query("select d from Driver d where d.school.id=:schoolId and (:search is null or lower(d.user.firstName) like lower(concat('%',:search,'%')) or lower(d.user.lastName) like lower(concat('%',:search,'%')) or lower(d.licenseNumber) like lower(concat('%',:search,'%')))")
 Page<Driver> search(@Param("schoolId") Long schoolId,@Param("search") String search,Pageable pageable);
}
