package com.karigarnow.repository;

import com.karigarnow.model.Earnings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EarningsRepository extends JpaRepository<Earnings, UUID> {
}
