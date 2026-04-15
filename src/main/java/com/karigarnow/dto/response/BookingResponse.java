package com.karigarnow.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("service")
    private ServiceInfoResponse service;

    @JsonProperty("consumer_name")
    private String consumerName;

    @JsonProperty("thekedar_name")
    private String thekedarName;

    @JsonProperty("thekedar_id")
    private UUID thekedarId;

    @JsonProperty("workers_needed")
    private Integer workersNeeded;

    @JsonProperty("address")
    private AddressInfoResponse address;

    @JsonProperty("job_description")
    private String jobDescription;

    @JsonProperty("scheduled_at")
    private LocalDateTime scheduledAt;

    @JsonProperty("otp")
    private String otp;

    @JsonProperty("otp_verified")
    private Boolean otpVerified;

    @JsonProperty("booking_status")
    private String bookingStatus;

    @JsonProperty("payment_status")
    private String paymentStatus;

    @JsonProperty("total_amount")
    private BigDecimal totalAmount;

    @JsonProperty("platform_fee")
    private BigDecimal platformFee;

    @JsonProperty("thekedar_payout")
    private BigDecimal thekedarPayout;

    @JsonProperty("assigned_workers")
    private List<BookingWorkerResponse> assignedWorkers;

    @JsonProperty("has_review")
    private Boolean hasReview;

    @JsonProperty("review")
    private ReviewResponse review;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
