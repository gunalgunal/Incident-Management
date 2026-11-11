package com.example.incidentmanagement.domain;

/**
 * User's decision on a recommended solution:
 *   - ACCEPT: auto-resolve the incident and store the accepted solution.
 *   - REJECT: leave the incident in its current status and record the rejection.
 */
public enum RecommendationDecision {
    ACCEPT,
    REJECT
}
