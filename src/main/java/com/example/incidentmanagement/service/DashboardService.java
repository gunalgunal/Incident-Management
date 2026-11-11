package com.example.incidentmanagement.service;

import com.example.incidentmanagement.api.dto.CountResponse;
import com.example.incidentmanagement.api.dto.DashboardSummary;
import com.example.incidentmanagement.domain.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final IncidentRepository repository;

    public DashboardService(IncidentRepository repository) {
        this.repository = repository;
    }

    /**
     * 6.1 Dashboard summary:
     *   - total open (not RESOLVED/CLOSED)
     *   - total resolved (RESOLVED or CLOSED)
     *   - total by category
     *   - total by priority
     */
    public DashboardSummary getSummary() {
        long open = repository.countOpen();
        long resolved = repository.countResolved();
        List<CountResponse> byCategory = toCounts(repository.countByCategory());
        List<CountResponse> byPriority = toCounts(repository.countByPriorityGroup());
        return new DashboardSummary(open, resolved, byCategory, byPriority);
    }

    /** 6.2 Incident count by category. */
    public List<CountResponse> countByCategory() {
        return toCounts(repository.countByCategory());
    }

    /** 6.3 Incident count by status. */
    public List<CountResponse> countByStatus() {
        return toCounts(repository.countByStatusGroup());
    }

    /** 6.4 Incident count by priority. */
    public List<CountResponse> countByPriority() {
        return toCounts(repository.countByPriorityGroup());
    }

    /**
     * Maps grouped-count query rows (each row is [label, count]) to CountResponse objects.
     * Labels are converted to String via toString() so enum values (status, priority)
     * appear as their readable names.
     */
    private List<CountResponse> toCounts(List<Object[]> rows) {
        return rows.stream()
                .map(row -> new CountResponse(String.valueOf(row[0]), ((Number) row[1]).longValue()))
                .toList();
    }
}
