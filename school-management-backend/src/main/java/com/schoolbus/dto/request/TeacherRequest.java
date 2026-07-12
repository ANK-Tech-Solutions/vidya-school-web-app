package com.schoolbus.dto.request;
import jakarta.validation.constraints.NotBlank; import java.time.LocalDate;
public record TeacherRequest(@NotBlank String username,@NotBlank String email,String password,@NotBlank String firstName,@NotBlank String lastName,String phone,@NotBlank String employeeCode,String department,String subjects,LocalDate joinDate,String phoneExtension,Boolean active) {}
