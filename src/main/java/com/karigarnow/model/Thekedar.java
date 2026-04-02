package com.karigarnow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "thekedars")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Thekedar {

    @Id
    private UUID id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id")
    private User user;

    private String bio;

    private String experience;

    @Builder.Default
    private Integer teamSize = 1;

    @Column(precision = 10, scale = 2)
    private BigDecimal ratePerHour;

    @Builder.Default
    private Boolean isOnline = false;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal ratingAverage = BigDecimal.ZERO;

    @Builder.Default
    private Integer totalJobs = 0;

    private String location;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "thekedar", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ThekedarService> services = new ArrayList<>();
}
