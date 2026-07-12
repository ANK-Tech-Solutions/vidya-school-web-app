package com.schoolbus.service.impl;

import com.schoolbus.dto.request.*;
import com.schoolbus.dto.response.*;
import com.schoolbus.entity.*;
import com.schoolbus.entity.enums.AssignmentTripType;
import com.schoolbus.exception.*;
import com.schoolbus.repository.*;
import com.schoolbus.service.AdminAssignmentService;
import com.schoolbus.util.SecurityUtils;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminAssignmentServiceImpl implements AdminAssignmentService {
    private final DriverBusRepository db;
    private final StudentBusRepository sb;
    private final DriverRepository dr;
    private final StudentRepository st;
    private final BusRepository bs;
    private final RouteRepository rt;

    public AdminAssignmentServiceImpl(
            DriverBusRepository a,
            StudentBusRepository b,
            DriverRepository c,
            StudentRepository d,
            BusRepository e,
            RouteRepository f) {
        db = a;
        sb = b;
        dr = c;
        st = d;
        bs = e;
        rt = f;
    }

    private Long s() {
        return SecurityUtils.getCurrentSchoolId();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssignmentResponse> list(Pageable p) {
        List<AssignmentResponse> x = Stream.concat(
                        db.findByDriverSchoolId(s(), Pageable.unpaged()).stream().map(AssignmentResponse::driver),
                        sb.findByStudentSchoolId(s(), Pageable.unpaged()).stream().map(AssignmentResponse::student))
                .sorted(Comparator.comparing(AssignmentResponse::id).reversed())
                .toList();
        int from = (int) Math.min(p.getOffset(), x.size());
        int to = Math.min(from + p.getPageSize(), x.size());
        return new PageImpl<>(x.subList(from, to), p, x.size());
    }

    @Override
    @Transactional
    public AssignmentResponse driver(AssignDriverRequest r) {
        DriverBus x = new DriverBus();
        x.setDriver(dr.findByIdAndSchoolId(r.driverId(), s()).orElseThrow(() -> new ResourceNotFoundException("Driver not found")));
        x.setBus(bs.findByIdAndSchoolId(r.busId(), s()).orElseThrow(() -> new ResourceNotFoundException("Bus not found")));
        x.setRoute(r.routeId() == null
                ? null
                : rt.findByIdAndSchoolId(r.routeId(), s()).orElseThrow(() -> new ResourceNotFoundException("Route not found")));
        x.setAssignedFrom(LocalDate.now());
        x.setPrimaryAssignment(true);
        x.setActive(true);
        return AssignmentResponse.driver(db.save(x));
    }

    @Override
    @Transactional
    public AssignmentResponse student(AssignStudentRequest r) {
        StudentBus x = new StudentBus();
        x.setStudent(st.findByIdAndSchoolId(r.studentId(), s()).orElseThrow(() -> new ResourceNotFoundException("Student not found")));
        Route route = r.routeId() == null
                ? null
                : rt.findByIdAndSchoolId(r.routeId(), s()).orElseThrow(() -> new ResourceNotFoundException("Route not found"));
        x.setRoute(route);
        Bus bus = r.busId() == null
                ? null
                : bs.findByIdAndSchoolId(r.busId(), s()).orElseThrow(() -> new ResourceNotFoundException("Bus not found"));
        if (bus == null) {
            throw new BadRequestException("busId is required");
        }
        x.setBus(bus);
        x.setTripType(AssignmentTripType.BOTH);
        x.setAssignedFrom(LocalDate.now());
        x.setActive(true);
        return AssignmentResponse.student(sb.save(x));
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        deactivate(id, null);
    }

    @Override
    @Transactional
    public void deactivate(Long id, String type) {
        if ("STUDENT".equalsIgnoreCase(type)) {
            sb.findByIdAndStudentSchoolId(id, s())
                    .ifPresentOrElse(x -> x.setActive(false), () -> {
                        throw new ResourceNotFoundException("Student assignment not found");
                    });
            return;
        }
        if ("DRIVER".equalsIgnoreCase(type)) {
            db.findByIdAndDriverSchoolId(id, s())
                    .ifPresentOrElse(x -> x.setActive(false), () -> {
                        throw new ResourceNotFoundException("Driver assignment not found");
                    });
            return;
        }
        db.findByIdAndDriverSchoolId(id, s()).ifPresentOrElse(
                x -> x.setActive(false),
                () -> sb.findByIdAndStudentSchoolId(id, s()).ifPresentOrElse(
                        x -> x.setActive(false),
                        () -> {
                            throw new ResourceNotFoundException("Assignment not found");
                        }));
    }
}
