package com.schoolbus.service;

import com.schoolbus.entity.Student;
import com.schoolbus.exception.ResourceNotFoundException;
import com.schoolbus.exception.UnauthorizedException;
import com.schoolbus.repository.StudentRepository;
import com.schoolbus.util.SecurityUtils;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StudentAccessService {
    private final StudentRepository students;

    public StudentAccessService(StudentRepository students) {
        this.students = students;
    }

    public List<Student> getAccessibleStudents() {
        Long userId = SecurityUtils.getCurrentUserIdOptional()
                .orElseThrow(() -> new UnauthorizedException("Authentication is required"));
        Long schoolId = SecurityUtils.getCurrentSchoolId();
        if (hasRole("ROLE_PARENT")) {
            return students.findByParentUserIdAndSchoolIdOrderByFirstNameAsc(userId, schoolId);
        }
        if (hasRole("ROLE_STUDENT")) {
            return students.findByUserIdAndSchoolId(userId, schoolId).stream().toList();
        }
        throw new UnauthorizedException("Student or parent access is required");
    }

    public Student requireStudentAccess(Long studentId) {
        return getAccessibleStudents().stream()
                .filter(student -> student.getId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> new UnauthorizedException("You do not have access to this student"));
    }

    public Student getPrimaryStudent(Long studentId) {
        if (studentId != null) return requireStudentAccess(studentId);
        return getAccessibleStudents().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No student is linked to this account"));
    }

    private boolean hasRole(String role) {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> role.equals(authority.getAuthority()));
    }
}
