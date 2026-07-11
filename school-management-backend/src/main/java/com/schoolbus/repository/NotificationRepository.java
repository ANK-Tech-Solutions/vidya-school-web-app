package com.schoolbus.repository;

import com.schoolbus.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop10BySchoolIdOrderByCreatedAtDesc(Long schoolId);

    Page<Notification> findBySchoolIdOrderByCreatedAtDesc(Long schoolId, Pageable pageable);

    long countBySchoolIdAndReadFalse(Long schoolId);
    Page<Notification> findBySchoolIdAndUserIdOrSchoolIdAndUserIsNullOrderByCreatedAtDesc(
            Long schoolId, Long userId, Long generalSchoolId, Pageable pageable);
    Optional<Notification> findByIdAndSchoolId(Long id, Long schoolId);
}
