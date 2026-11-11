package com.example.incidentmanagement.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    /**
     * Returns all resolved incidents (status RESOLVED or CLOSED) in the given category,
     * excluding the incident with the given id. These are the candidates used to compute
     * recommended solutions.
     */
    @Query("select i from Incident i " +
            "where i.category = :category " +
            "and i.status in (com.example.incidentmanagement.domain.IncidentStatus.RESOLVED, " +
            "                 com.example.incidentmanagement.domain.IncidentStatus.CLOSED) " +
            "and i.id <> :excludeId")
    List<Incident> findResolvedInCategoryExcluding(@Param("category") String category,
                                                   @Param("excludeId") Long excludeId);

    // ---- Dashboard / statistics queries ----

    long countByStatus(IncidentStatus status);

    /** Count of incidents that are NOT resolved or closed (i.e. still open). */
    @Query("select count(i) from Incident i " +
            "where i.status not in (com.example.incidentmanagement.domain.IncidentStatus.RESOLVED, " +
            "                        com.example.incidentmanagement.domain.IncidentStatus.CLOSED)")
    long countOpen();

    /** Count of incidents that are resolved or closed. */
    @Query("select count(i) from Incident i " +
            "where i.status in (com.example.incidentmanagement.domain.IncidentStatus.RESOLVED, " +
            "                   com.example.incidentmanagement.domain.IncidentStatus.CLOSED)")
    long countResolved();

    /** Incident count grouped by category. Each row is [category, count]. */
    @Query("select i.category, count(i) from Incident i group by i.category order by i.category")
    List<Object[]> countByCategory();

    /** Incident count grouped by status. Each row is [status, count]. */
    @Query("select i.status, count(i) from Incident i group by i.status order by i.status")
    List<Object[]> countByStatusGroup();

    /** Incident count grouped by priority. Each row is [priority, count]. */
    @Query("select i.priority, count(i) from Incident i group by i.priority order by i.priority")
    List<Object[]> countByPriorityGroup();
}

