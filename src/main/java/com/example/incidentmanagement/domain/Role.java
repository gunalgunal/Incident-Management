package com.example.incidentmanagement.domain;

/**
 * Application roles.
 *   - USER:      can report incidents and accept/reject recommendations.
 *   - ENGINEER:  can investigate and resolve incidents with an engineer solution.
 *   - ADMIN:     full access.
 */
public enum Role {
    USER,
    ENGINEER,
    ADMIN
}
