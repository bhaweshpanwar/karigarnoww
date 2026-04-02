package com.karigarnow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thekedar_id", nullable = false)
    private Thekedar thekedar;

    @Column(nullable = false)
    private String name;

    private String mobile;

    private String skills;

    @Column(precision = 10, scale = 2)
    private BigDecimal dailyRate;

    @Builder.Default
    private Boolean isAvailable = true;

    @Builder.Default
    private Integer totalJobs = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
