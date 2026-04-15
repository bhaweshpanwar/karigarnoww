package com.karigarnow.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingListResponse {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("service_name")
    private String serviceName;

    @JsonProperty("thekedar_name")
    private String thekedarName;

    @JsonProperty("consumer_name")
    private String consumerName;

    @JsonProperty("booking_status")
    private String bookingStatus;

    @JsonProperty("payment_status")
    private String paymentStatus;

    @JsonProperty("total_amount")
    private BigDecimal totalAmount;

    @JsonProperty("scheduled_at")
    private LocalDateTime scheduledAt;

    @JsonProperty("workers_needed")
    private Integer workersNeeded;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("otp")
    private String otp;

    @JsonProperty("otp_verified")
    private Boolean otpVerified;
}
