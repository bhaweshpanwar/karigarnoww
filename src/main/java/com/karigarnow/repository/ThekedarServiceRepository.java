package com.karigarnow.repository;

import com.karigarnow.model.ThekedarService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ThekedarServiceRepository extends JpaRepository<ThekedarService, UUID> {

    @Query("""
        SELECT ts FROM ThekedarService ts
        JOIN FETCH ts.thekedar t
        JOIN FETCH t.user
        WHERE ts.service.id = :serviceId
        AND t.isOnline = true
        """)
    Page<ThekedarService> findByServiceIdAndThekedarIsOnline(
            @Param("serviceId") UUID serviceId,
            Pageable pageable);

    @Query("""
        SELECT ts FROM ThekedarService ts
        JOIN FETCH ts.thekedar t
        JOIN FETCH t.user u
        WHERE ts.service.id = :serviceId
        AND t.isOnline = true
        AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(t.location) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<ThekedarService> findByServiceIdAndThekedarIsOnlineAndSearch(
            @Param("serviceId") UUID serviceId,
            @Param("search") String search,
            Pageable pageable);
}
