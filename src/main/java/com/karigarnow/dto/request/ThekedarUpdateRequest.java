package com.karigarnow.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThekedarUpdateRequest {
    private String bio;
    private String experience;

    @JsonProperty("team_size")
    private Integer teamSize;

    @JsonProperty("rate_per_hour")
    private BigDecimal ratePerHour;

    private String location;

    @JsonProperty("is_online")
    private Boolean isOnline;
}
