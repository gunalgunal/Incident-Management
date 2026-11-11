package com.example.incidentmanagement.api.dto;

import com.example.incidentmanagement.domain.Incident;
import com.example.incidentmanagement.domain.Priority;

/**
 * A recommended solution for an incident, derived from a previously resolved
 * incident in the same category whose description is similar.
 */
public class RecommendationResponse {

    /** The id of the previously resolved incident this recommendation is based on. */
    private Long incidentId;

    private String title;
    private String category;
    private Priority priority;

    /** Similarity score in [0.0, 1.0] between the target incident's description and this one. */
    private double similarity;

    /** The solution that worked for the matched incident (its resolutionNote). */
    private String solution;

    private String resolvedBy;

    public static RecommendationResponse from(Incident i, double similarity) {
        RecommendationResponse r = new RecommendationResponse();
        r.incidentId = i.getId();
        r.title = i.getTitle();
        r.category = i.getCategory();
        r.priority = i.getPriority();
        r.similarity = similarity;
        r.solution = i.getResolutionNote();
        r.resolvedBy = i.getResolvedBy();
        return r;
    }

    public Long getIncidentId() { return incidentId; }
    public void setIncidentId(Long incidentId) { this.incidentId = incidentId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public double getSimilarity() { return similarity; }
    public void setSimilarity(double similarity) { this.similarity = similarity; }
    public String getSolution() { return solution; }
    public void setSolution(String solution) { this.solution = solution; }
    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }
}
