package com.karigarnow.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class WorkerResponse {

    @JsonProperty("id")
    private String id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("mobile")
    private String mobile;

    @JsonProperty("skills")
    private List<String> skills;

    @JsonProperty("daily_rate")
    private BigDecimal dailyRate;

    @JsonProperty("is_available")
    private Boolean isAvailable;

    @JsonProperty("total_jobs")
    private Integer totalJobs;

    @JsonProperty("thekedar_id")
    private String thekedarId;
}
