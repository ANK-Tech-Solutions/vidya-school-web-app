package com.schoolbus.dto.response;

import com.schoolbus.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class UserResponse {
    private final Long id;
    private final String username;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final String fullName;
    private final Long schoolId;
    private final String schoolName;
    private final List<String> roles;

    public static UserResponse from(User user) {
        return UserResponse.builder().id(user.getId()).username(user.getUsername()).email(user.getEmail())
                .firstName(user.getFirstName()).lastName(user.getLastName()).fullName(user.getFullName())
                .schoolId(user.getSchool() == null ? null : user.getSchool().getId())
                .schoolName(user.getSchool() == null ? null : user.getSchool().getName())
                .roles(user.getRoles().stream().map(role -> role.getName().name()).sorted().toList()).build();
    }
}
