package com.karigarnow.repository;

import com.karigarnow.model.Thekedar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ThekedarRepository extends JpaRepository<Thekedar, UUID> {

    @Query("SELECT t FROM Thekedar t JOIN FETCH t.user WHERE t.id = :id")
    Optional<Thekedar> findByIdWithUser(@Param("id") UUID id);

    @Query("""
        SELECT t FROM Thekedar t
        JOIN FETCH t.user u
        JOIN FETCH t.services ts
        JOIN FETCH ts.service
        WHERE t.id = :id
        """)
    Optional<Thekedar> findByIdWithServices(@Param("id") UUID id);
}
