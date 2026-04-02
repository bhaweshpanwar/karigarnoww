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
@Table(name = "earnings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Earnings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thekedar_id", nullable = false)
    private Thekedar thekedar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal platformFee;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal netAmount;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime paidAt;
}
