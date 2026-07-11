package com.schoolbus.service.impl;

import com.schoolbus.dto.request.BroadcastNotificationRequest;
import com.schoolbus.dto.response.NotificationResponse;
import com.schoolbus.dto.response.PageResponse;
import com.schoolbus.exception.BadRequestException;
import com.schoolbus.repository.NotificationRepository;
import com.schoolbus.repository.SchoolRepository;
import com.schoolbus.service.AdminNotificationService;
import com.schoolbus.service.NotificationService;
import com.schoolbus.util.SecurityUtils;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminNotificationServiceImpl implements AdminNotificationService {

    private final NotificationRepository repository;
    private final SchoolRepository schools;
    private final NotificationService notifications;

    public AdminNotificationServiceImpl(NotificationRepository repository, SchoolRepository schools,
                                        NotificationService notifications) {
        this.repository = repository;
        this.schools = schools;
        this.notifications = notifications;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> listRecent(int limit) {
        if (limit < 1 || limit > 100) {
            throw new BadRequestException("limit must be between 1 and 100");
        }
        return repository.findTop10BySchoolIdOrderByCreatedAtDesc(SecurityUtils.getCurrentSchoolId()).stream()
                .limit(limit)
                .map(NotificationResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> list(Pageable pageable) {
        return PageResponse.from(
                repository.findBySchoolIdOrderByCreatedAtDesc(SecurityUtils.getCurrentSchoolId(), pageable)
                        .map(NotificationResponse::from)
        );
    }

    @Override
    @Transactional
    public NotificationResponse broadcast(BroadcastNotificationRequest request) {
        return NotificationResponse.from(notifications.broadcast(
                schools.getReferenceById(SecurityUtils.getCurrentSchoolId()),
                request.title(), request.body(), request.type()));
    }
}
