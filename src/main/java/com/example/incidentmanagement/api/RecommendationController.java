package com.example.incidentmanagement.api;

import com.example.incidentmanagement.api.dto.AcceptRecommendationRequest;
import com.example.incidentmanagement.api.dto.IncidentResponse;
import com.example.incidentmanagement.api.dto.RecommendationResponse;
import com.example.incidentmanagement.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Recommendation endpoints: get recommended solutions for an incident (3.1) and
 * accept/reject a recommended solution (3.2).
 */
@RestController
@RequestMapping("/api/incidents")
public class RecommendationController {

    private final IncidentService service;

    public RecommendationController(IncidentService service) {
        this.service = service;
    }

    /**
     * 3.1 Get recommended solutions for an incident.
     * Compares the incident's description with resolved incidents in the same category
     * and returns the top matches with their solutions, ranked by similarity.
     */
    @GetMapping("/{id}/recommendations")
    public List<RecommendationResponse> getRecommendations(
            @PathVariable Long id,
            @RequestParam(name = "limit", defaultValue = "5") int limit) {
        return service.getRecommendations(id, limit);
    }

    /**
     * 3.2 Let a user accept or reject a recommended solution.
     * On ACCEPT the incident is auto-resolved and the accepted solution is stored.
     * On REJECT the incident keeps its current status and the rejection is recorded.
     */
    @PostMapping("/{id}/recommendation/decision")
    public IncidentResponse decideOnRecommendation(
            @PathVariable Long id,
            @Valid @RequestBody AcceptRecommendationRequest request) {
        return service.acceptRecommendation(id, request);
    }
}
