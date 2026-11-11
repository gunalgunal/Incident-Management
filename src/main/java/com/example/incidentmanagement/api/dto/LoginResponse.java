package com.example.incidentmanagement.api.dto;

/**
 * Response returned on successful login. Since no token is required, this simply
 * confirms authentication and echoes back the authenticated user's details.
 */
public class LoginResponse {

    private String message;
    private UserResponse user;

    public LoginResponse(String message, UserResponse user) {
        this.message = message;
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }
}
