package com.schoolbus.repository;
import com.schoolbus.entity.Parent; import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.util.*;
public interface ParentRepository extends JpaRepository<Parent,Long> {
 Optional<Parent> findByIdAndSchoolId(Long id,Long schoolId); long countBySchoolId(Long schoolId);
 Optional<Parent> findByUserIdAndSchoolId(Long userId, Long schoolId); List<Parent> findBySchoolId(Long schoolId);
 @Query("select p from Parent p where p.school.id=:schoolId and (:search is null or lower(p.user.firstName) like lower(concat('%',:search,'%')) or lower(p.user.lastName) like lower(concat('%',:search,'%')) or lower(p.user.email) like lower(concat('%',:search,'%')))")
 Page<Parent> search(@Param("schoolId") Long schoolId,@Param("search") String search,Pageable pageable);
}
