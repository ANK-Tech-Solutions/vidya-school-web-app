package com.schoolbus.dto.response;
import com.schoolbus.entity.Driver;
public record DriverDetailsResponse(Long id, String fullName, String phone, String avatarUrl, Boolean online) {
    public static DriverDetailsResponse from(Driver d) { return new DriverDetailsResponse(d.getId(), d.getUser().getFullName(), d.getUser().getPhone(), d.getUser().getAvatarUrl(), d.getOnline()); }
}
