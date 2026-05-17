package com.karigarnow.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    @NotBlank(message = "Address line 1 is required")
    @JsonProperty("address_line1")
    private String addressLine1;

    @JsonProperty("address_line2")
    private String addressLine2;

    @NotBlank(message = "City is required")
    @JsonProperty("city")
    private String city;

    @NotBlank(message = "State is required")
    @JsonProperty("state")
    private String state;

    @NotBlank(message = "Country is required")
    @JsonProperty("country")
    private String country;

    @NotBlank(message = "Postal code is required")
    @JsonProperty("postal_code")
    private String postalCode;

    @JsonProperty("is_primary")
    private Boolean isPrimary;
}