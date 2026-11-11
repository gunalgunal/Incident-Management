package com.example.incidentmanagement.api.dto;

/**
 * A single label/count pair used for grouped counts (by category, status, or priority).
 */
public class CountResponse {

    private String label;
    private long count;

    public CountResponse(String label, long count) {
        this.label = label;
        this.count = count;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
