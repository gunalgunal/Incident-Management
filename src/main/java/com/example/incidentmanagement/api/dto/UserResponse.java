package com.example.incidentmanagement.api.dto;

import com.example.incidentmanagement.domain.Role;
import com.example.incidentmanagement.domain.User;

/**
 * User response returned by register and login. Never includes the password (hashed or raw).
 */
public class UserResponse {

    private Long id;
    private String username;
    private Role role;

    public static UserResponse from(User u) {
        UserResponse r = new UserResponse();
        r.id = u.getId();
        r.username = u.getUsername();
        r.role = u.getRole();
        return r;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
