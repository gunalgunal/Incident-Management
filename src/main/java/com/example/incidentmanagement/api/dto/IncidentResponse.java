package com.example.incidentmanagement.api.dto;

import com.example.incidentmanagement.domain.Incident;
import com.example.incidentmanagement.domain.IncidentStatus;
import com.example.incidentmanagement.domain.Priority;

public class IncidentResponse {

    private Long id;
    private String title;
    private String description;
    private String category;
    private Priority priority;
    private String reportedBy;
    private IncidentStatus status;
    private String assignedTo;
    private String resolvedBy;
    private String resolutionNote;
    private String solution;
    private String rootCause;

    public static IncidentResponse from(Incident i) {
        IncidentResponse r = new IncidentResponse();
        r.id = i.getId();
        r.title = i.getTitle();
        r.description = i.getDescription();
        r.category = i.getCategory();
        r.priority = i.getPriority();
        r.reportedBy = i.getReportedBy();
        r.status = i.getStatus();
        r.assignedTo = i.getAssignedTo();
        r.resolvedBy = i.getResolvedBy();
        r.resolutionNote = i.getResolutionNote();
        r.solution = i.getSolution();
        r.rootCause = i.getRootCause();
        return r;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }
    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) { this.status = status; }
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }
    public String getResolutionNote() { return resolutionNote; }
    public void setResolutionNote(String resolutionNote) { this.resolutionNote = resolutionNote; }
    public String getSolution() { return solution; }
    public void setSolution(String solution) { this.solution = solution; }
    public String getRootCause() { return rootCause; }
    public void setRootCause(String rootCause) { this.rootCause = rootCause; }
}
