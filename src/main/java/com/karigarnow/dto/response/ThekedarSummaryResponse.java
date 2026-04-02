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
public class ThekedarSummaryResponse {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("photo")
    private String photo;

    @JsonProperty("rating_average")
    private BigDecimal ratingAverage;

    @JsonProperty("custom_rate")
    private BigDecimal customRate;

    @JsonProperty("experience")
    private String experience;

    @JsonProperty("total_jobs")
    private Integer totalJobs;

    @JsonProperty("location")
    private String location;

    @JsonProperty("is_online")
    private Boolean isOnline;
}
