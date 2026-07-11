package com.schoolbus.service;

import com.schoolbus.dto.request.BroadcastNotificationRequest;
import com.schoolbus.dto.response.NotificationResponse;
import com.schoolbus.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminNotificationService {
    List<NotificationResponse> listRecent(int limit);

    PageResponse<NotificationResponse> list(Pageable pageable);

    NotificationResponse broadcast(BroadcastNotificationRequest request);
}
