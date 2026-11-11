package com.example.incidentmanagement.api;

import com.example.incidentmanagement.api.dto.CountResponse;
import com.example.incidentmanagement.api.dto.DashboardSummary;
import com.example.incidentmanagement.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Dashboard / statistics endpoints (6.1 - 6.4).
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    /**
     * 6.1 Dashboard summary:
     *   total open, total resolved, total by category, total by priority.
     */
    @GetMapping("/summary")
    public DashboardSummary getSummary() {
        return service.getSummary();
    }

    /** 6.2 Incident count by category. */
    @GetMapping("/counts/by-category")
    public List<CountResponse> countByCategory() {
        return service.countByCategory();
    }

    /** 6.3 Incident count by status. */
    @GetMapping("/counts/by-status")
    public List<CountResponse> countByStatus() {
        return service.countByStatus();
    }

    /** 6.4 Incident count by priority. */
    @GetMapping("/counts/by-priority")
    public List<CountResponse> countByPriority() {
        return service.countByPriority();
    }
}
