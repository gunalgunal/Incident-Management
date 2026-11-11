package com.example.incidentmanagement.domain;

/**
 * How an incident was resolved:
 *   - USER_RECOMMENDATION: a user accepted a recommended resolution.
 *   - ENGINEER_INVESTIGATION: an engineer resolved it after investigation.
 */
public enum ResolutionMethod {
    USER_RECOMMENDATION,
    ENGINEER_INVESTIGATION
}
