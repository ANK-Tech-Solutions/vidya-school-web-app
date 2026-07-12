package com.schoolbus.controller;

import com.schoolbus.dto.request.SchoolAdminRequest;
import com.schoolbus.dto.request.SchoolRequest;
import com.schoolbus.dto.response.ApiResponse;
import com.schoolbus.dto.response.PageResponse;
import com.schoolbus.dto.response.SchoolAdminResponse;
import com.schoolbus.dto.response.SchoolResponse;
import com.schoolbus.entity.School;
import com.schoolbus.entity.User;
import com.schoolbus.entity.enums.RoleType;
import com.schoolbus.exception.BadRequestException;
import com.schoolbus.exception.ResourceNotFoundException;
import com.schoolbus.repository.RoleRepository;
import com.schoolbus.repository.SchoolRepository;
import com.schoolbus.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/platform")
public class PlatformController {
    private static final String DEFAULT_APP_NAME = "ANK-School-managment";
    private static final String DEFAULT_APP_ICON =
            "https://drive.google.com/uc?export=view&id=1oThTuOXW8fvrXUJHNDRBARkgc10Qg5lV";

    private final SchoolRepository schools;
    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder encoder;

    public PlatformController(
            SchoolRepository schools, UserRepository users, RoleRepository roles, PasswordEncoder encoder) {
        this.schools = schools;
        this.users = users;
        this.roles = roles;
        this.encoder = encoder;
    }

    @GetMapping("/schools")
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<SchoolResponse>> listSchools(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.success(PageResponse.from(schools.findAll(PageRequest.of(page, size)).map(SchoolResponse::from)));
    }

    @PostMapping("/schools")
    @Transactional
    public ResponseEntity<ApiResponse<SchoolResponse>> createSchool(@Valid @RequestBody SchoolRequest request) {
        if (schools.existsByCode(request.code().trim())) {
            throw new BadRequestException("School code already exists");
        }
        School school = new School();
        apply(school, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("School created", SchoolResponse.from(schools.save(school))));
    }

    @PutMapping("/schools/{id}")
    @Transactional
    public ApiResponse<SchoolResponse> updateSchool(@PathVariable Long id, @Valid @RequestBody SchoolRequest request) {
        School school = schools.findById(id).orElseThrow(() -> new ResourceNotFoundException("School not found"));
        if (!school.getCode().equalsIgnoreCase(request.code().trim()) && schools.existsByCode(request.code().trim())) {
            throw new BadRequestException("School code already exists");
        }
        apply(school, request);
        return ApiResponse.success(SchoolResponse.from(school));
    }

    @PatchMapping("/schools/{id}/deactivate")
    @Transactional
    public ApiResponse<Void> deactivateSchool(@PathVariable Long id) {
        School school = schools.findById(id).orElseThrow(() -> new ResourceNotFoundException("School not found"));
        school.setActive(false);
        return ApiResponse.success("School deactivated", null);
    }

    @GetMapping("/admins")
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<SchoolAdminResponse>> listAdmins(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.success(
                PageResponse.from(users.findByRole(RoleType.ADMIN, PageRequest.of(page, size)).map(SchoolAdminResponse::from)));
    }

    @PostMapping("/admins")
    @Transactional
    public ResponseEntity<ApiResponse<SchoolAdminResponse>> createAdmin(@Valid @RequestBody SchoolAdminRequest request) {
        if (users.existsByUsername(request.username()) || users.existsByEmail(request.email())) {
            throw new BadRequestException("Username or email already exists");
        }
        School school = schools.findById(request.schoolId()).orElseThrow(() -> new ResourceNotFoundException("School not found"));
        if (!Boolean.TRUE.equals(school.getActive())) {
            throw new BadRequestException("Cannot create admin for inactive school");
        }
        User user = new User();
        user.setSchool(school);
        user.setUsername(request.username().trim());
        user.setEmail(request.email().trim());
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPhone(request.phone());
        user.setPasswordHash(encoder.encode(
                request.password() == null || request.password().isBlank() ? "Password@123" : request.password()));
        user.setActive(true);
        user.getRoles()
                .add(roles.findByName(RoleType.ADMIN).orElseThrow(() -> new ResourceNotFoundException("ADMIN role not found")));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("School admin created", SchoolAdminResponse.from(users.save(user))));
    }

    @PatchMapping("/admins/{id}/deactivate")
    @Transactional
    public ApiResponse<Void> deactivateAdmin(@PathVariable Long id) {
        User user = users.findById(id).orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ADMIN);
        if (!isAdmin) {
            throw new BadRequestException("User is not a school admin");
        }
        user.setActive(false);
        return ApiResponse.success("School admin deactivated", null);
    }

    private void apply(School school, SchoolRequest request) {
        school.setCode(request.code().trim());
        school.setName(request.name().trim());
        school.setAppName(
                request.appName() == null || request.appName().isBlank() ? DEFAULT_APP_NAME : request.appName().trim());
        school.setAppIconUrl(
                request.appIconUrl() == null || request.appIconUrl().isBlank()
                        ? DEFAULT_APP_ICON
                        : request.appIconUrl().trim());
        school.setAddress(request.address());
        school.setCity(request.city());
        school.setState(request.state());
        school.setPostalCode(request.postalCode());
        school.setCountry(request.country() == null || request.country().isBlank() ? "India" : request.country());
        school.setPhone(request.phone());
        school.setEmail(request.email());
        school.setTimezone(request.timezone() == null || request.timezone().isBlank() ? "Asia/Kolkata" : request.timezone());
        if (request.active() != null) {
            school.setActive(request.active());
        } else if (school.getId() == null) {
            school.setActive(true);
        }
    }
}
