package com.example.incidentmanagement.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for storing an engineer's solution when resolving an incident.
 *
 * The engineer provides the solution text that was applied and the root cause
 * identified during investigation. The incident is auto-resolved (status moved
 * to RESOLVED) and both fields are stored.
 */
public class EngineerSolutionRequest {

    /** The solution that was applied to resolve the incident. */
    @NotBlank
    @Size(max = 4000)
    private String solution;

    /** The root cause identified during investigation. */
    @NotBlank
    @Size(max = 4000)
    private String rootCause;

    /** The engineer recording the solution. */
    @NotBlank
    @Size(max = 100)
    private String resolvedBy;

    public String getSolution() {
        return solution;
    }

    public void setSolution(String solution) {
        this.solution = solution;
    }

    public String getRootCause() {
        return rootCause;
    }

    public void setRootCause(String rootCause) {
        this.rootCause = rootCause;
    }

    public String getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }
}
