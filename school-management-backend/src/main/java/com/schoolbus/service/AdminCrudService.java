package com.schoolbus.service;
import com.schoolbus.dto.request.*; import com.schoolbus.dto.response.*; import org.springframework.data.domain.*;
public interface AdminCrudService {
 Page<StudentResponse> students(String search,String grade,Pageable p); StudentResponse student(Long id); StudentResponse createStudent(StudentRequest r); StudentResponse updateStudent(Long id,StudentRequest r); void deactivateStudent(Long id);
 Page<ParentResponse> parents(String s,Pageable p); ParentResponse parent(Long id); ParentResponse createParent(ParentRequest r); ParentResponse updateParent(Long id,ParentRequest r); void deactivateParent(Long id);
 Page<DriverResponse> drivers(String s,Pageable p); DriverResponse driver(Long id); DriverResponse createDriver(DriverRequest r); DriverResponse updateDriver(Long id,DriverRequest r); void deactivateDriver(Long id);
 Page<BusResponse> buses(String s,Pageable p); BusResponse bus(Long id); BusResponse createBus(BusRequest r); BusResponse updateBus(Long id,BusRequest r); void deactivateBus(Long id);
 Page<RouteResponse> routes(String s,Pageable p); RouteResponse route(Long id); RouteResponse createRoute(RouteRequest r); RouteResponse updateRoute(Long id,RouteRequest r); void deactivateRoute(Long id);
 RouteStopResponse addRouteStop(Long routeId, RouteStopRequest r); RouteStopResponse updateRouteStop(Long routeId, Long stopId, RouteStopRequest r); void deleteRouteStop(Long routeId, Long stopId);
}
