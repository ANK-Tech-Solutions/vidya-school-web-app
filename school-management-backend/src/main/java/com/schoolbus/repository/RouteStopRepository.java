package com.schoolbus.repository;
import com.schoolbus.entity.RouteStop; import java.util.*;
public interface RouteStopRepository extends org.springframework.data.jpa.repository.JpaRepository<RouteStop,Long> { List<RouteStop> findByRouteId(Long routeId); }
