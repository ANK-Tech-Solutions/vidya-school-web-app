package com.schoolbus.dto.response;
import com.schoolbus.entity.RouteStop; import java.math.*;
public record RouteStopResponse(Long id,String name,Integer stopOrder,BigDecimal latitude,BigDecimal longitude,String address,Integer estimatedArrivalMins,Integer geofenceRadiusM){public static RouteStopResponse from(RouteStop s){return new RouteStopResponse(s.getId(),s.getName(),s.getStopOrder(),s.getLatitude(),s.getLongitude(),s.getAddress(),s.getEstimatedArrivalMins(),s.getGeofenceRadiusM());}}
