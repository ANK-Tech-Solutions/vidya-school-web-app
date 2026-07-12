package com.schoolbus.repository;

import com.schoolbus.entity.User;
import com.schoolbus.entity.enums.RoleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByIdAndSchoolId(Long id, Long schoolId);

    @Query("select u from User u left join fetch u.school left join fetch u.roles where u.username = :username")
    Optional<User> findByUsername(@Param("username") String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query(
            value = "select distinct u from User u join u.roles r where r.name = :role",
            countQuery = "select count(distinct u) from User u join u.roles r where r.name = :role")
    Page<User> findByRole(@Param("role") RoleType role, Pageable pageable);
}