package com.example.incidentmanagement.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class IncidentAlreadyResolvedException extends RuntimeException {
    public IncidentAlreadyResolvedException(Long id) {
        super("Incident " + id + " is already resolved");
    }
}
