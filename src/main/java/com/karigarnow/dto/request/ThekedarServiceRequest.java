package com.karigarnow.dto.request;

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
public class ThekedarServiceRequest {
    @JsonProperty("service_id")
    private UUID serviceId;

    @JsonProperty("custom_rate")
    private BigDecimal customRate;
}
