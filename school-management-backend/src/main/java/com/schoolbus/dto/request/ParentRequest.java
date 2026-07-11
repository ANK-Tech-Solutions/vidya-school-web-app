package com.schoolbus.dto.request;
import jakarta.validation.constraints.*;
public record ParentRequest(@NotBlank String username,@Email @NotBlank String email,String password,@NotBlank String firstName,@NotBlank String lastName,String phone,String relationship,String address,String emergencyContact,Boolean active) {}
