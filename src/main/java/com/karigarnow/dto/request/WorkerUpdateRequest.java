package com.karigarnow.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerUpdateRequest {

    private String name;

    private String mobile;

    private List<String> skills;

    @Positive(message = "Daily rate must be positive")
    @JsonProperty("daily_rate")
    private BigDecimal dailyRate;

    @JsonProperty("is_available")
    private Boolean isAvailable;
}
