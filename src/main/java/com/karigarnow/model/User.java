package com.karigarnow.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String photo;

    @Column(nullable = false)
    @Builder.Default
    private String authProvider = "local";

    @Column(unique = true)
    private String authProviderId;

    @Column(unique = true)
    private String mobile;

    @Column(nullable = false)
    private String role;

    private LocalDateTime passwordChangedAt;

    private String passwordResetToken;

    private LocalDateTime passwordResetExpires;

    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
