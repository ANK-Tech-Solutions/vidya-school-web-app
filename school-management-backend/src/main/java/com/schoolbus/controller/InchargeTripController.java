package com.schoolbus.controller;

import com.schoolbus.dto.response.ApiResponse;
import com.schoolbus.dto.response.TrackingStopResponse;
import com.schoolbus.dto.response.TripReplayResponse;
import com.schoolbus.entity.Trip;
import com.schoolbus.exception.ResourceNotFoundException;
import com.schoolbus.repository.RouteStopRepository;
import com.schoolbus.repository.TripLocationRepository;
import com.schoolbus.repository.TripRepository;
import com.schoolbus.util.SecurityUtils;
import java.util.List;
import java.util.Objects;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Trip replay/playback for the Vehicle Incharge fleet portal. */
@RestController
@RequestMapping("/api/v1/incharge/trips")
public class InchargeTripController {
    private final TripRepository trips;
    private final TripLocationRepository tripLocations;
    private final RouteStopRepository routeStops;

    public InchargeTripController(TripRepository trips, TripLocationRepository tripLocations,
                                  RouteStopRepository routeStops) {
        this.trips = trips;
        this.tripLocations = tripLocations;
        this.routeStops = routeStops;
    }

    @GetMapping("/{tripId}/replay")
    @Transactional(readOnly = true)
    public ApiResponse<TripReplayResponse> replay(@PathVariable Long tripId) {
        Trip trip = trips.findById(tripId)
                .filter(t -> Objects.equals(t.getSchool().getId(), SecurityUtils.getCurrentSchoolId()))
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        List<TrackingStopResponse> stops = trip.getRoute() == null ? List.of()
                : routeStops.findByRouteIdOrderByStopOrderAsc(trip.getRoute().getId()).stream()
                        .map(TrackingStopResponse::from).toList();

        List<TripReplayResponse.Point> points = tripLocations.findByTripIdOrderByRecordedAtAsc(tripId).stream()
                .map(l -> new TripReplayResponse.Point(l.getLatitude(), l.getLongitude(), l.getSpeed(),
                        l.getHeading(), l.getRecordedAt()))
                .toList();

        String driverName = trip.getDriver().getUser().getFirstName() + " " + trip.getDriver().getUser().getLastName();
        return ApiResponse.success(new TripReplayResponse(
                trip.getId(),
                trip.getBus().getBusNumber(),
                driverName,
                trip.getRoute() == null ? null : trip.getRoute().getName(),
                trip.getStatus(),
                trip.getActualStart(),
                trip.getActualEnd(),
                trip.getTotalDistanceKm(),
                stops,
                points));
    }
}
