package com.karigarnow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "thekedar_services", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"thekedar_id", "service_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThekedarService {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thekedar_id", nullable = false)
    private Thekedar thekedar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private AppService service;

    @Column(precision = 10, scale = 2)
    private BigDecimal customRate;
}
