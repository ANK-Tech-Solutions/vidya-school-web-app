package com.schoolbus.security;

import com.schoolbus.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class UserPrincipal implements UserDetails {
    private final Long id;
    private final Long schoolId;
    private final String username;
    private final String password;
    private final boolean enabled;
    private final boolean accountNonLocked;
    private final Collection<? extends GrantedAuthority> authorities;

    private UserPrincipal(User user) {
        this.id = user.getId();
        this.schoolId = user.getSchool() == null ? null : user.getSchool().getId();
        this.username = user.getUsername();
        this.password = user.getPasswordHash();
        this.enabled = Boolean.TRUE.equals(user.getActive());
        this.accountNonLocked = !Boolean.TRUE.equals(user.getLocked());
        this.authorities = user.getRoles().stream().map(role ->
                new SimpleGrantedAuthority("ROLE_" + role.getName().name())).toList();
    }

    public static UserPrincipal from(User user) { return new UserPrincipal(user); }
}
