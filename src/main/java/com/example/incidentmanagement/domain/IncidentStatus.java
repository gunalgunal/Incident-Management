package com.example.incidentmanagement.domain;

/**
 * Lifecycle of an incident:
 *   New -> Assigned -> In Progress -> Resolved -> Closed
 */
public enum IncidentStatus {
    NEW,
    ASSIGNED,
    IN_PROGRESS,
    RESOLVED,
    CLOSED
}
