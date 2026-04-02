package com.karigarnow.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingWorkerResponse {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("mobile")
    private String mobile;

    @JsonProperty("skills")
    private String skills;

    @JsonProperty("daily_rate")
    private BigDecimal dailyRate;

    @JsonProperty("assigned_at")
    private java.time.LocalDateTime assignedAt;
}
