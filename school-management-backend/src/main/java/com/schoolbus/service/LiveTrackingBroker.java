package com.schoolbus.service;

import com.schoolbus.dto.request.LocationUpdateRequest;
import com.schoolbus.dto.response.LiveLocationMessage;
import com.schoolbus.entity.Trip;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LiveTrackingBroker {
    private final SimpMessagingTemplate messagingTemplate;

    public void broadcast(Trip trip, LocationUpdateRequest location, Instant recordedAt) {
        LiveLocationMessage message = new LiveLocationMessage(
                trip.getId(),
                trip.getBus().getId(),
                trip.getBus().getBusNumber(),
                location.latitude(),
                location.longitude(),
                location.speed(),
                location.heading(),
                location.accuracy(),
                recordedAt,
                trip.getStatus());

        messagingTemplate.convertAndSend("/topic/trips/" + trip.getId() + "/location", message);
        messagingTemplate.convertAndSend("/topic/school/" + trip.getSchool().getId() + "/buses", message);
    }
}
