package com.karigarnow.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThekedarProfileResponse {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("photo")
    private String photo;

    @JsonProperty("bio")
    private String bio;

    @JsonProperty("experience")
    private String experience;

    @JsonProperty("rating_average")
    private BigDecimal ratingAverage;

    @JsonProperty("total_jobs")
    private Integer totalJobs;

    @JsonProperty("location")
    private String location;

    @JsonProperty("services")
    private List<ThekedarServiceResponse> services;

    @JsonProperty("reviews")
    private List<ReviewSummaryResponse> reviews;
}
