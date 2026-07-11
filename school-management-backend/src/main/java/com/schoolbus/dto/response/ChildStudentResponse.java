package com.schoolbus.dto.response;
import com.schoolbus.entity.Student;
public record ChildStudentResponse(Long id, String studentCode, String fullName, String grade, String section, String photoUrl) {
    public static ChildStudentResponse from(Student s) { return new ChildStudentResponse(s.getId(), s.getStudentCode(), s.getFullName(), s.getGrade(), s.getSection(), s.getPhotoUrl()); }
}
