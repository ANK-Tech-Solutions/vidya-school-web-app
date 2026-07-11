package com.schoolbus.repository;

import com.schoolbus.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SchoolRepository extends JpaRepository<School, Long> {
    Optional<School> findByCode(String code);
    boolean existsByCode(String code);
}
