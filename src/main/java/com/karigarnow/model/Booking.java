package com.karigarnow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumer_id", nullable = false)
    private User consumer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thekedar_id", nullable = false)
    private Thekedar thekedar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private AppService service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", nullable = false)
    private Address address;

    @Builder.Default
    private Integer workersNeeded = 1;

    private String jobDescription;

    private LocalDateTime scheduledAt;

    private String otp;

    @Builder.Default
    private Boolean otpVerified = false;

    @Builder.Default
    private String bookingStatus = "pending";

    @Builder.Default
    private String paymentStatus = "pending";

    @Column(precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal platformFee;

    @Column(precision = 10, scale = 2)
    private BigDecimal thekedarPayout;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingWorker> bookingWorkers = new ArrayList<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Review> reviews = new HashSet<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
