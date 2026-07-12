package com.schoolbus.controller;

import com.schoolbus.dto.response.ApiResponse;
import com.schoolbus.entity.CalendarEvent;
import com.schoolbus.entity.NoticeBoard;
import com.schoolbus.util.SecurityUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Optional Staff / Workers portal — notices and calendar for now. */
@RestController
@RequestMapping("/api/v1/staff")
public class StaffController {
    @PersistenceContext
    private EntityManager em;

    private Long sid() {
        return SecurityUtils.getCurrentSchoolId();
    }

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public ApiResponse<?> dashboard() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("notices", em.createQuery("select count(n) from NoticeBoard n where n.school.id=:s and n.active=true", Long.class)
                .setParameter("s", sid()).getSingleResult());
        m.put("events", em.createQuery("select count(c) from CalendarEvent c where c.school.id=:s and c.active=true", Long.class)
                .setParameter("s", sid()).getSingleResult());
        m.put("message", "Staff portal is available for notices and school calendar. More worker tools can be enabled later.");
        return ApiResponse.success(m);
    }

    @GetMapping("/notices")
    @Transactional(readOnly = true)
    public ApiResponse<?> notices() {
        return ApiResponse.success(em.createQuery(
                        "select n from NoticeBoard n where n.school.id=:s and n.active=true order by n.publishedAt desc", NoticeBoard.class)
                .setParameter("s", sid()).getResultList().stream().map(n -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", n.getId());
                    m.put("title", n.getTitle());
                    m.put("body", n.getBody());
                    m.put("priority", n.getPriority());
                    m.put("publishedAt", n.getPublishedAt());
                    return m;
                }).toList());
    }

    @GetMapping("/calendar")
    @Transactional(readOnly = true)
    public ApiResponse<?> calendar() {
        return ApiResponse.success(em.createQuery(
                        "select c from CalendarEvent c where c.school.id=:s and c.active=true order by c.eventDate", CalendarEvent.class)
                .setParameter("s", sid()).getResultList().stream().map(c -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", c.getId());
                    m.put("title", c.getTitle());
                    m.put("description", c.getDescription());
                    m.put("eventDate", c.getEventDate());
                    m.put("eventType", c.getEventType());
                    return m;
                }).toList());
    }
}
