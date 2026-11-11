package com.example.incidentmanagement.api.dto;

import java.util.List;

/**
 * Dashboard summary (API 6.1):
 *   - total open (incidents not yet resolved or closed)
 *   - total resolved (incidents resolved or closed)
 *   - total by category
 *   - total by priority
 */
public class DashboardSummary {

    private long totalOpen;
    private long totalResolved;
    private List<CountResponse> byCategory;
    private List<CountResponse> byPriority;

    public DashboardSummary(long totalOpen, long totalResolved,
                             List<CountResponse> byCategory,
                             List<CountResponse> byPriority) {
        this.totalOpen = totalOpen;
        this.totalResolved = totalResolved;
        this.byCategory = byCategory;
        this.byPriority = byPriority;
    }

    public long getTotalOpen() {
        return totalOpen;
    }

    public void setTotalOpen(long totalOpen) {
        this.totalOpen = totalOpen;
    }

    public long getTotalResolved() {
        return totalResolved;
    }

    public void setTotalResolved(long totalResolved) {
        this.totalResolved = totalResolved;
    }

    public List<CountResponse> getByCategory() {
        return byCategory;
    }

    public void setByCategory(List<CountResponse> byCategory) {
        this.byCategory = byCategory;
    }

    public List<CountResponse> getByPriority() {
        return byPriority;
    }

    public void setByPriority(List<CountResponse> byPriority) {
        this.byPriority = byPriority;
    }
}
