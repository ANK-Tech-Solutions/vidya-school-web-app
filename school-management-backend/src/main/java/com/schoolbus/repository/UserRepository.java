package com.schoolbus.repository;

import com.schoolbus.entity.User;
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
}
