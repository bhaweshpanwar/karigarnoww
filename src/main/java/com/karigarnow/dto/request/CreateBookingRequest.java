package com.karigarnow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    @NotNull(message = "Thekedar ID is required")
    private UUID thekedarId;

    @NotNull(message = "Service ID is required")
    private UUID serviceId;

    @NotNull(message = "Address ID is required")
    private UUID addressId;

    @NotNull(message = "Workers needed is required")
    @Min(value = 1, message = "At least 1 worker is required")
    private Integer workersNeeded;

    @NotBlank(message = "Job description is required")
    private String jobDescription;

    private LocalDateTime scheduledAt;
}
