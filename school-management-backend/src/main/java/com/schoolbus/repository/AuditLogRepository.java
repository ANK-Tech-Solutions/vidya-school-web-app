package com.schoolbus.repository;

import com.schoolbus.dto.response.AuditLogResponse;
import com.schoolbus.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query(value = """
            select new com.schoolbus.dto.response.AuditLogResponse(
                a.id, a.action, a.entityType, a.entityId, a.userId, u.username, a.ipAddress, a.createdAt)
            from AuditLog a left join User u on u.id = a.userId
            where a.schoolId = :schoolId
              and (:action is null or a.action like concat('%', :action, '%'))
            order by a.createdAt desc
            """,
            countQuery = """
            select count(a) from AuditLog a
            where a.schoolId = :schoolId
              and (:action is null or a.action like concat('%', :action, '%'))
            """)
    Page<AuditLogResponse> search(@Param("schoolId") Long schoolId, @Param("action") String action, Pageable pageable);
}
