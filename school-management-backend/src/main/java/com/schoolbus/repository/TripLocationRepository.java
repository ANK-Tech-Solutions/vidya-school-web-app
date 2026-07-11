package com.schoolbus.repository;

import com.schoolbus.entity.TripLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TripLocationRepository extends JpaRepository<TripLocation, Long> {
    Optional<TripLocation> findFirstByTripIdOrderByRecordedAtDesc(Long tripId);
}
