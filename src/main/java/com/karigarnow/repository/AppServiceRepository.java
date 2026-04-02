package com.karigarnow.repository;

import com.karigarnow.model.AppService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppServiceRepository extends JpaRepository<AppService, UUID> {

    Optional<AppService> findBySlug(String slug);

    Optional<AppService> findBySlugAndIsActiveTrue(String slug);
}
