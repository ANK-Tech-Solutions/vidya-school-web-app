package com.schoolbus.repository;

import com.schoolbus.entity.TripStopEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripStopEventRepository extends JpaRepository<TripStopEvent, Long> {
    boolean existsByTripIdAndStopIdAndEventType(Long tripId, Long stopId, String eventType);
}
