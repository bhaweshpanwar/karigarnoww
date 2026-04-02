package com.karigarnow.repository;

import com.karigarnow.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    @Query("""
        SELECT r FROM Review r
        JOIN FETCH r.consumer c
        WHERE r.thekedar.id = :thekedarId
        ORDER BY r.createdAt DESC
        """)
    List<Review> findTop5ByThekedarIdOrderByCreatedAtDesc(
            @Param("thekedarId") UUID thekedarId);
}
