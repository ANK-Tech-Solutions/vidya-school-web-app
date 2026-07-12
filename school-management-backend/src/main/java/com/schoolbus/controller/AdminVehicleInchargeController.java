package com.schoolbus.controller;

import com.schoolbus.dto.request.VehicleInchargeRequest;
import com.schoolbus.dto.response.ApiResponse;
import com.schoolbus.dto.response.PageResponse;
import com.schoolbus.dto.response.SchoolAdminResponse;
import com.schoolbus.entity.User;
import com.schoolbus.entity.enums.RoleType;
import com.schoolbus.exception.BadRequestException;
import com.schoolbus.exception.ResourceNotFoundException;
import com.schoolbus.repository.RoleRepository;
import com.schoolbus.repository.SchoolRepository;
import com.schoolbus.repository.UserRepository;
import com.schoolbus.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/vehicle-incharges")
@RequiredArgsConstructor
public class AdminVehicleInchargeController {
    private final UserRepository users;
    private final RoleRepository roles;
    private final SchoolRepository schools;
    private final PasswordEncoder encoder;

    private Long sid() {
        return SecurityUtils.getCurrentSchoolId();
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<SchoolAdminResponse>> list(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.success(PageResponse.from(
                users.findBySchoolIdAndRole(sid(), RoleType.VEHICLE_INCHARGE, PageRequest.of(page, size))
                        .map(SchoolAdminResponse::from)));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<SchoolAdminResponse>> create(@Valid @RequestBody VehicleInchargeRequest request) {
        if (users.existsByUsername(request.username()) || users.existsByEmail(request.email())) {
            throw new BadRequestException("Username or email already exists");
        }
        User user = new User();
        user.setSchool(schools.getReferenceById(sid()));
        user.setUsername(request.username().trim());
        user.setEmail(request.email().trim());
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPhone(request.phone());
        user.setPasswordHash(encoder.encode(
                request.password() == null || request.password().isBlank() ? "Password@123" : request.password()));
        user.setActive(true);
        user.getRoles()
                .add(roles.findByName(RoleType.VEHICLE_INCHARGE)
                        .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_INCHARGE role not found")));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle incharge created", SchoolAdminResponse.from(users.save(user))));
    }

    @PatchMapping("/{id}/deactivate")
    @Transactional
    public ApiResponse<Void> deactivate(@PathVariable Long id) {
        User user = users.findByIdAndSchoolId(id, sid())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle incharge not found"));
        boolean isIncharge = user.getRoles().stream().anyMatch(r -> r.getName() == RoleType.VEHICLE_INCHARGE);
        if (!isIncharge) {
            throw new BadRequestException("User is not a vehicle incharge");
        }
        user.setActive(false);
        return ApiResponse.success("Vehicle incharge deactivated", null);
    }
}
