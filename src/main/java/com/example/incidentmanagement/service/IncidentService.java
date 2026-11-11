package com.example.incidentmanagement.service;

import com.example.incidentmanagement.api.IllegalStatusTransitionException;
import com.example.incidentmanagement.api.IncidentAlreadyResolvedException;
import com.example.incidentmanagement.api.IncidentNotFoundException;
import com.example.incidentmanagement.api.dto.AcceptRecommendationRequest;
import com.example.incidentmanagement.api.dto.ChangeStatusRequest;
import com.example.incidentmanagement.api.dto.CreateIncidentRequest;
import com.example.incidentmanagement.api.dto.EngineerSolutionRequest;
import com.example.incidentmanagement.api.dto.IncidentResponse;
import com.example.incidentmanagement.api.dto.RecommendationResponse;
import com.example.incidentmanagement.api.dto.ResolveIncidentRequest;
import com.example.incidentmanagement.domain.Incident;
import com.example.incidentmanagement.domain.IncidentRepository;
import com.example.incidentmanagement.domain.IncidentStatus;
import com.example.incidentmanagement.domain.RecommendationDecision;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
public class IncidentService {

    /**
     * Allowed forward transitions for the incident lifecycle:
     *   New -> Assigned -> In Progress -> Resolved -> Closed
     */
    private static final Map<IncidentStatus, Set<IncidentStatus>> ALLOWED_TRANSITIONS = Map.of(
            IncidentStatus.NEW, EnumSet.of(IncidentStatus.ASSIGNED),
            IncidentStatus.ASSIGNED, EnumSet.of(IncidentStatus.IN_PROGRESS),
            IncidentStatus.IN_PROGRESS, EnumSet.of(IncidentStatus.RESOLVED),
            IncidentStatus.RESOLVED, EnumSet.of(IncidentStatus.CLOSED),
            IncidentStatus.CLOSED, EnumSet.noneOf(IncidentStatus.class)
    );

    private final IncidentRepository repository;

    public IncidentService(IncidentRepository repository) {
        this.repository = repository;
    }

    public IncidentResponse create(CreateIncidentRequest request) {
        Incident incident = new Incident();
        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setCategory(request.getCategory());
        incident.setPriority(request.getPriority());
        incident.setReportedBy(request.getReportedBy());
        incident.setStatus(IncidentStatus.NEW);
        return IncidentResponse.from(repository.save(incident));
    }

    @Transactional(readOnly = true)
    public List<IncidentResponse> listAll() {
        return repository.findAll().stream()
                .map(IncidentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public IncidentResponse getById(Long id) {
        return IncidentResponse.from(findIncident(id));
    }

    public IncidentResponse changeStatus(Long id, ChangeStatusRequest request) {
        Incident incident = findIncident(id);
        IncidentStatus current = incident.getStatus();
        IncidentStatus target = request.getStatus();

        if (current == target) {
            // No-op transition is allowed.
            return IncidentResponse.from(incident);
        }

        if (!ALLOWED_TRANSITIONS.getOrDefault(current, EnumSet.noneOf(IncidentStatus.class)).contains(target)) {
            throw new IllegalStatusTransitionException(
                    "Illegal status transition: " + current + " -> " + target
                            + ". Allowed lifecycle: New -> Assigned -> In Progress -> Resolved -> Closed");
        }

        if (target == IncidentStatus.ASSIGNED && request.getAssignedTo() != null
                && !request.getAssignedTo().isBlank()) {
            incident.setAssignedTo(request.getAssignedTo());
        }

        incident.setStatus(target);
        return IncidentResponse.from(repository.save(incident));
    }

    /**
     * Mark an incident as Resolved. An incident can be resolved:
     *   - by a user accepting a recommendation (resolutionMethod = USER_RECOMMENDATION), or
     *   - by an engineer after investigation (resolutionMethod = ENGINEER_INVESTIGATION).
     *
     * Resolution is only allowed when the incident is IN_PROGRESS (per the lifecycle). If the
     * incident is already RESOLVED, a 409 is returned. The resolution method is recorded in
     * the resolution note.
     */
    public IncidentResponse resolve(Long id, ResolveIncidentRequest request) {
        Incident incident = findIncident(id);
        IncidentStatus current = incident.getStatus();

        if (current == IncidentStatus.RESOLVED || current == IncidentStatus.CLOSED) {
            throw new IncidentAlreadyResolvedException(id);
        }

        if (current != IncidentStatus.IN_PROGRESS) {
            throw new IllegalStatusTransitionException(
                    "An incident can only be resolved from IN_PROGRESS. Current status: " + current);
        }

        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolvedBy(request.getResolvedBy());

        // Capture the resolution method (user recommendation vs engineer investigation)
        // along with any note provided.
        String note = request.getResolutionNote();
        String combined = "[" + request.getResolutionMethod() + "]"
                + (note == null || note.isBlank() ? "" : " " + note);
        incident.setResolutionNote(combined);

        return IncidentResponse.from(repository.save(incident));
    }

    private Incident findIncident(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IncidentNotFoundException(id));
    }

    /**
     * 3.2 Let a user accept or reject a recommended solution.
     *
     * On ACCEPT:
     *   - The incident is auto-resolved (status -> RESOLVED) regardless of its current
     *     non-terminal status, so a user can accept a recommendation without an engineer
     *     first moving it to IN_PROGRESS.
     *   - The recommended solution is copied from the source incident into this incident's
     *     {@code solution} field.
     *   - The source incident id is stored in {@code acceptedRecommendationId} for traceability.
     *   - {@code resolvedBy} is set to the user who accepted.
     *
     * On REJECT:
     *   - The incident keeps its current status.
     *   - The rejection (with the source incident id and optional comment) is recorded in the
     *     resolution note so it is visible in the incident history.
     *
     * @param id      the incident being decided on
     * @param request the decision (accept/reject), source recommendation, user, optional comment
     * @return the updated incident
     */
    public IncidentResponse acceptRecommendation(Long id, AcceptRecommendationRequest request) {
        Incident incident = findIncident(id);
        IncidentStatus current = incident.getStatus();

        if (current == IncidentStatus.RESOLVED || current == IncidentStatus.CLOSED) {
            throw new IncidentAlreadyResolvedException(id);
        }

        // Validate that the referenced recommendation exists and is actually resolved.
        Incident source = repository.findById(request.getRecommendationIncidentId())
                .orElseThrow(() -> new IncidentNotFoundException(request.getRecommendationIncidentId()));
        if (source.getStatus() != IncidentStatus.RESOLVED
                && source.getStatus() != IncidentStatus.CLOSED) {
            throw new IllegalStatusTransitionException(
                    "Referenced recommendation incident " + source.getId()
                            + " is not resolved (status: " + source.getStatus() + ")");
        }

        if (request.getDecision() == RecommendationDecision.ACCEPT) {
            incident.setStatus(IncidentStatus.RESOLVED);
            incident.setResolvedBy(request.getDecidedBy());
            // Copy the solution that worked for the source incident.
            incident.setSolution(source.getSolution() != null
                    ? source.getSolution()
                    : source.getResolutionNote());
            String comment = request.getComment();
            incident.setResolutionNote("[USER_RECOMMENDATION] Accepted solution from incident #"
                    + source.getId()
                    + (comment == null || comment.isBlank() ? "" : " - " + comment));
        } else {
            // REJECT: keep current status, record the rejection.
            String comment = request.getComment();
            incident.setResolutionNote("[REJECTED] Rejected recommendation from incident #"
                    + source.getId()
                    + (comment == null || comment.isBlank() ? "" : " - " + comment));
        }

        return IncidentResponse.from(repository.save(incident));
    }

    /**
     * Store an engineer's solution when resolving an incident.
     *
     * The incident is auto-resolved (status -> RESOLVED) and the engineer-provided solution
     * text and root cause are stored. Resolution is only allowed from a non-terminal status.
     *
     * @param id      the incident being resolved
     * @param request the solution text, root cause, and engineer name
     * @return the updated incident
     */
    public IncidentResponse storeEngineerSolution(Long id, EngineerSolutionRequest request) {
        Incident incident = findIncident(id);
        IncidentStatus current = incident.getStatus();

        if (current == IncidentStatus.RESOLVED || current == IncidentStatus.CLOSED) {
            throw new IncidentAlreadyResolvedException(id);
        }

        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolvedBy(request.getResolvedBy());
        incident.setSolution(request.getSolution());
        incident.setRootCause(request.getRootCause());
        incident.setResolutionNote("[ENGINEER_INVESTIGATION] " + request.getSolution());

        return IncidentResponse.from(repository.save(incident));
    }

    /**
     * 3.1 Recommend solutions for an incident.
     *
     * Internally compares the incident's description with previously resolved incidents
     * (status RESOLVED or CLOSED) in the same category, and returns the top matches ranked
     * by description similarity (cosine similarity over token frequencies). Each match
     * carries the solution (resolutionNote) that worked for that incident.
     *
     * @param id    the incident to find solutions for
     * @param limit max number of recommendations to return (clamped to [1, 50])
     * @return ranked recommendations, most similar first; empty if none found
     */
    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecommendations(Long id, int limit) {
        Incident target = findIncident(id);
        int cappedLimit = Math.max(1, Math.min(limit, 50));

        List<Incident> candidates = repository.findResolvedInCategoryExcluding(
                target.getCategory(), target.getId());

        String targetDescription = target.getDescription();

        return candidates.stream()
                .map(c -> Map.entry(c, TextSimilarity.cosine(targetDescription, c.getDescription())))
                .filter(e -> e.getValue() > 0.0)
                .sorted(Comparator.<Map.Entry<Incident, Double>>comparingDouble(Map.Entry::getValue).reversed())
                .limit(cappedLimit)
                .map(e -> RecommendationResponse.from(e.getKey(), round(e.getValue(), 4)))
                .toList();
    }

    private static double round(double value, int places) {
        double scale = Math.pow(10, places);
        return Math.round(value * scale) / scale;
    }
}
