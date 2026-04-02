package com.karigarnow.repository;

import com.karigarnow.model.ThekedarService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ThekedarServiceRepository extends JpaRepository<ThekedarService, UUID> {

    Optional<ThekedarService> findByServiceIdAndThekedarId(UUID serviceId, UUID thekedarId);

    // Sort by rating (default)
    @Query("""
        SELECT ts FROM ThekedarService ts
        JOIN FETCH ts.thekedar t
        JOIN FETCH t.user
        WHERE ts.service.id = :serviceId
        AND t.isOnline = true
        ORDER BY t.ratingAverage DESC
        """)
    Page<ThekedarService> findByServiceIdAndThekedarIsOnline(
            @Param("serviceId") UUID serviceId,
            Pageable pageable);

    // Sort by price
    @Query("""
        SELECT ts FROM ThekedarService ts
        JOIN FETCH ts.thekedar t
        JOIN FETCH t.user
        WHERE ts.service.id = :serviceId
        AND t.isOnline = true
        ORDER BY ts.customRate ASC
        """)
    Page<ThekedarService> findByServiceIdAndThekedarIsOnlineOrderByPrice(
            @Param("serviceId") UUID serviceId,
            Pageable pageable);

    // Sort by rating with search
    @Query("""
        SELECT ts FROM ThekedarService ts
        JOIN FETCH ts.thekedar t
        JOIN FETCH t.user u
        WHERE ts.service.id = :serviceId
        AND t.isOnline = true
        AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(t.location) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY t.ratingAverage DESC
        """)
    Page<ThekedarService> findByServiceIdAndThekedarIsOnlineAndSearch(
            @Param("serviceId") UUID serviceId,
            @Param("search") String search,
            Pageable pageable);

    // Sort by price with search
    @Query("""
        SELECT ts FROM ThekedarService ts
        JOIN FETCH ts.thekedar t
        JOIN FETCH t.user u
        WHERE ts.service.id = :serviceId
        AND t.isOnline = true
        AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(t.location) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY ts.customRate ASC
        """)
    Page<ThekedarService> findByServiceIdAndThekedarIsOnlineAndSearchOrderByPrice(
            @Param("serviceId") UUID serviceId,
            @Param("search") String search,
            Pageable pageable);
}
