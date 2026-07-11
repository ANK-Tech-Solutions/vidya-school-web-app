package com.schoolbus.service; import com.schoolbus.dto.request.*; import com.schoolbus.dto.response.*; import org.springframework.data.domain.*;
public interface AdminAssignmentService {Page<AssignmentResponse> list(Pageable p);AssignmentResponse driver(AssignDriverRequest r);AssignmentResponse student(AssignStudentRequest r);void deactivate(Long id);}
