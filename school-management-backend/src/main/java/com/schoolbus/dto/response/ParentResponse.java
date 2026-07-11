package com.schoolbus.dto.response;
import com.schoolbus.entity.Parent;
public record ParentResponse(Long id,Long userId,String username,String email,String firstName,String lastName,String phone,String relationship,String address,String emergencyContact,Boolean active) {public static ParentResponse from(Parent p){var u=p.getUser();return new ParentResponse(p.getId(),u.getId(),u.getUsername(),u.getEmail(),u.getFirstName(),u.getLastName(),u.getPhone(),p.getRelationship(),p.getAddress(),p.getEmergencyContact(),u.getActive());}}
