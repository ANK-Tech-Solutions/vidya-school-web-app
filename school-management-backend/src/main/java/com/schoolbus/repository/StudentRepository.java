package com.schoolbus.repository;
import com.schoolbus.entity.Student; import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.util.*;
public interface StudentRepository extends JpaRepository<Student,Long> {
 Optional<Student> findByIdAndSchoolId(Long id,Long schoolId); long countBySchoolId(Long schoolId);
 List<Student> findByParentUserIdAndSchoolIdOrderByFirstNameAsc(Long userId, Long schoolId);
 Optional<Student> findByUserIdAndSchoolId(Long userId, Long schoolId);
 @Query("select s from Student s where s.school.id=:schoolId and (:grade is null or s.grade=:grade) and (:search is null or lower(s.firstName) like lower(concat('%',:search,'%')) or lower(s.lastName) like lower(concat('%',:search,'%')) or lower(s.studentCode) like lower(concat('%',:search,'%')))")
 Page<Student> search(@Param("schoolId") Long schoolId,@Param("search") String search,@Param("grade") String grade, Pageable pageable);
}
