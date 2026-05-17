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
public class ThekedarSelfProfileResponse {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("email")
    private String email;

    @JsonProperty("mobile")
    private String mobile;

    @JsonProperty("photo")
    private String photo;

    @JsonProperty("bio")
    private String bio;

    @JsonProperty("experience")
    private String experience;

    @JsonProperty("team_size")
    private Integer teamSize;

    @JsonProperty("rate_per_hour")
    private BigDecimal ratePerHour;

    @JsonProperty("is_online")
    private Boolean isOnline;

    @JsonProperty("rating_average")
    private BigDecimal ratingAverage;

    @JsonProperty("total_jobs")
    private Integer totalJobs;

    @JsonProperty("location")
    private String location;

    @JsonProperty("services")
    private List<ThekedarServiceResponse> services;
}
