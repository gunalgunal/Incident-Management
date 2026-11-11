package com.example.incidentmanagement.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class IllegalStatusTransitionException extends RuntimeException {
    public IllegalStatusTransitionException(String message) {
        super(message);
    }
}
