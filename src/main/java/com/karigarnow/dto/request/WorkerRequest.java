package com.karigarnow.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class WorkerRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String mobile;

    private List<String> skills;

    @NotNull(message = "Daily rate is required")
    @Positive(message = "Daily rate must be positive")
    @JsonProperty("daily_rate")
    private BigDecimal dailyRate;
}
