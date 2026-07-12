package com.schoolbus.service;

import com.schoolbus.dto.request.AssignDriverRequest;
import com.schoolbus.dto.request.AssignStudentRequest;
import com.schoolbus.dto.response.AssignmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminAssignmentService {
    Page<AssignmentResponse> list(Pageable p);

    AssignmentResponse driver(AssignDriverRequest r);

    AssignmentResponse student(AssignStudentRequest r);

    void deactivate(Long id);

    void deactivate(Long id, String type);
}
