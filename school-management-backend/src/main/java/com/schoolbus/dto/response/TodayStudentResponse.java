package com.schoolbus.dto.response;

import com.schoolbus.entity.StudentBus;

public record TodayStudentResponse(Long studentId, String name, String grade, String section,
                                   String stopName, String pickupAddress, String studentCode, String photoUrl) {
    public static TodayStudentResponse from(StudentBus assignment) {
        var student = assignment.getStudent();
        return new TodayStudentResponse(student.getId(), student.getFullName(), student.getGrade(), student.getSection(),
                assignment.getStop() == null ? null : assignment.getStop().getName(), student.getPickupAddress(),
                student.getStudentCode(), student.getPhotoUrl());
    }
}
