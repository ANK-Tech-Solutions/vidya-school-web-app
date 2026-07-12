package com.schoolbus.repository;
import com.schoolbus.entity.Teacher; import java.util.*; import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface TeacherRepository extends JpaRepository<Teacher,Long> { Optional<Teacher> findByIdAndSchoolId(Long id,Long schoolId); Optional<Teacher> findByUserIdAndSchoolId(Long userId,Long schoolId); Page<Teacher> findBySchoolId(Long schoolId,Pageable pageable); }
