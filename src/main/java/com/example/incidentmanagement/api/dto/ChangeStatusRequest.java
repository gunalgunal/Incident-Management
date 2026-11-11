package com.example.incidentmanagement.api.dto;

import com.example.incidentmanagement.domain.IncidentStatus;
import jakarta.validation.constraints.NotNull;

public class ChangeStatusRequest {

    @NotNull
    private IncidentStatus status;

    /** Optional: who the incident is being assigned to (used when moving to ASSIGNED). */
    private String assignedTo;

    public IncidentStatus getStatus() {
        return status;
    }

    public void setStatus(IncidentStatus status) {
        this.status = status;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }
}
