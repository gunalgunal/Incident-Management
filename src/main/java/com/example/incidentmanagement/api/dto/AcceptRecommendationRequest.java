package com.example.incidentmanagement.api.dto;

import com.example.incidentmanagement.domain.RecommendationDecision;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request body for accepting or rejecting a recommended solution (API 3.2).
 *
 * On ACCEPT the incident is auto-resolved: its status moves to RESOLVED, the
 * recommended solution is copied into the incident, and the source incident id
 * is recorded for traceability. On REJECT the incident keeps its current status
 * and the rejection is recorded as a resolution note.
 */
public class AcceptRecommendationRequest {

    /** The id of the resolved incident whose recommendation is being accepted/rejected. */
    @NotNull
    private Long recommendationIncidentId;

    @NotNull
    private RecommendationDecision decision;

    /** The user making the decision. */
    @NotBlank
    @Size(max = 100)
    private String decidedBy;

    /** Optional comment explaining the decision. */
    @Size(max = 4000)
    private String comment;

    public Long getRecommendationIncidentId() {
        return recommendationIncidentId;
    }

    public void setRecommendationIncidentId(Long recommendationIncidentId) {
        this.recommendationIncidentId = recommendationIncidentId;
    }

    public RecommendationDecision getDecision() {
        return decision;
    }

    public void setDecision(RecommendationDecision decision) {
        this.decision = decision;
    }

    public String getDecidedBy() {
        return decidedBy;
    }

    public void setDecidedBy(String decidedBy) {
        this.decidedBy = decidedBy;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
