package com.schoolbus.dto.response;
import com.schoolbus.entity.Student;
import java.time.LocalDate;
public record StudentProfileResponse(Long id, String studentCode, String firstName, String lastName, String grade,
                                     String section, LocalDate dateOfBirth, String gender, String bloodGroup,
                                     String photoUrl, String pickupAddress, String dropAddress) {
    public static StudentProfileResponse from(Student s) { return new StudentProfileResponse(s.getId(), s.getStudentCode(), s.getFirstName(), s.getLastName(), s.getGrade(), s.getSection(), s.getDateOfBirth(), s.getGender(), s.getBloodGroup(), s.getPhotoUrl(), s.getPickupAddress(), s.getDropAddress()); }
}
