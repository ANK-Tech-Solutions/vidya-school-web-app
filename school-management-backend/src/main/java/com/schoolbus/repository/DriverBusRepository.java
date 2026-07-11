package com.schoolbus.repository;
import com.schoolbus.entity.DriverBus; import org.springframework.data.domain.*; import java.util.*;
public interface DriverBusRepository extends org.springframework.data.jpa.repository.JpaRepository<DriverBus,Long> { Page<DriverBus> findByDriverSchoolId(Long schoolId,Pageable p); Optional<DriverBus> findByIdAndDriverSchoolId(Long id,Long schoolId); Optional<DriverBus> findFirstByDriverIdAndActiveTrueOrderByAssignedFromDesc(Long driverId); Optional<DriverBus> findFirstByBusIdAndActiveTrueOrderByAssignedFromDesc(Long busId); }
