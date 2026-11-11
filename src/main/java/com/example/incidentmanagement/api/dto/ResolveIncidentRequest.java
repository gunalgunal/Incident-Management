package com.example.incidentmanagement.api.dto;

import com.example.incidentmanagement.domain.ResolutionMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ResolveIncidentRequest {

    @NotNull
    private ResolutionMethod resolutionMethod;

    @NotBlank
    @Size(max = 100)
    private String resolvedBy;

    @Size(max = 4000)
    private String resolutionNote;

    public ResolutionMethod getResolutionMethod() {
        return resolutionMethod;
    }

    public void setResolutionMethod(ResolutionMethod resolutionMethod) {
        this.resolutionMethod = resolutionMethod;
    }

    public String getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public String getResolutionNote() {
        return resolutionNote;
    }

    public void setResolutionNote(String resolutionNote) {
        this.resolutionNote = resolutionNote;
    }
}
