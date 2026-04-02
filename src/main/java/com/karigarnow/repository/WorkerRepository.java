package com.karigarnow.repository;

import com.karigarnow.model.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, UUID> {

    List<Worker> findByThekedarId(UUID thekedarId);

    List<Worker> findByIdIn(List<UUID> ids);
}
