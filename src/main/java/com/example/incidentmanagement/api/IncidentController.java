package com.example.incidentmanagement.api;

import com.example.incidentmanagement.api.dto.ChangeStatusRequest;
import com.example.incidentmanagement.api.dto.CreateIncidentRequest;
import com.example.incidentmanagement.api.dto.EngineerSolutionRequest;
import com.example.incidentmanagement.api.dto.IncidentResponse;
import com.example.incidentmanagement.api.dto.ResolveIncidentRequest;
import com.example.incidentmanagement.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Incident management endpoints: create, list, change status, resolve, and store
 * an engineer's solution. Recommendation-related endpoints live in
 * {@link RecommendationController}.
 */
@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService service;

    public IncidentController(IncidentService service) {
        this.service = service;
    }

    /** 1. Create a new incident. */
    @PostMapping
    public ResponseEntity<IncidentResponse> create(@Valid @RequestBody CreateIncidentRequest request) {
        IncidentResponse created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** 2. List all incidents. */
    @GetMapping
    public List<IncidentResponse> listAll() {
        return service.listAll();
    }

    /** Get a single incident by id. */
    @GetMapping("/{id}")
    public IncidentResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    /** 3. Change incident status (New -> Assigned -> In Progress -> Resolved -> Closed). */
    @PatchMapping("/{id}/status")
    public IncidentResponse changeStatus(@PathVariable Long id,
                                         @Valid @RequestBody ChangeStatusRequest request) {
        return service.changeStatus(id, request);
    }

    /** 4. Mark an incident as Resolved (by user accepting recommendation OR by engineer after investigation). */
    @PostMapping("/{id}/resolve")
    public IncidentResponse resolve(@PathVariable Long id,
                                    @Valid @RequestBody ResolveIncidentRequest request) {
        return service.resolve(id, request);
    }

    /**
     * Store an engineer's solution when resolving an incident.
     * The incident is auto-resolved and the solution text + root cause are stored.
     */
    @PostMapping("/{id}/engineer-solution")
    public IncidentResponse storeEngineerSolution(
            @PathVariable Long id,
            @Valid @RequestBody EngineerSolutionRequest request) {
        return service.storeEngineerSolution(id, request);
    }
}
