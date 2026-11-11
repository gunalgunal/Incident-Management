package com.example.incidentmanagement.service;

import com.example.incidentmanagement.api.InvalidCredentialsException;
import com.example.incidentmanagement.api.UserAlreadyExistsException;
import com.example.incidentmanagement.api.dto.LoginRequest;
import com.example.incidentmanagement.api.dto.LoginResponse;
import com.example.incidentmanagement.api.dto.RegisterUserRequest;
import com.example.incidentmanagement.api.dto.UserResponse;
import com.example.incidentmanagement.domain.User;
import com.example.incidentmanagement.domain.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository) {
        this.repository = repository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * 1.1 Register a new user.
     * The password is BCrypt-hashed before storage; the raw password is never persisted.
     */
    public UserResponse register(RegisterUserRequest request) {
        if (repository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException(request.getUsername());
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        return UserResponse.from(repository.save(user));
    }

    /**
     * 1.2 Login a user with basic authentication (username + password).
     * No token is issued; the caller is expected to send credentials with each request.
     * Returns the authenticated user's details on success, 401 on failure.
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = repository.findByUsername(request.getUsername())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        return new LoginResponse("Login successful", UserResponse.from(user));
    }
}
