package com.example.incidentmanagement.api;

import com.example.incidentmanagement.api.dto.LoginRequest;
import com.example.incidentmanagement.api.dto.LoginResponse;
import com.example.incidentmanagement.api.dto.RegisterUserRequest;
import com.example.incidentmanagement.api.dto.UserResponse;
import com.example.incidentmanagement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    private final UserService service;

    public UserManagementController(UserService service) {
        this.service = service;
    }

    /** 1.1 Register a new user (username, password, role). */
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        UserResponse created = service.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** 1.2 Login a user with basic authentication (username + password). No token is issued. */
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return service.login(request);
    }
}
