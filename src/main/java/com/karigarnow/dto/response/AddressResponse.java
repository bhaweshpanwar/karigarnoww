package com.karigarnow.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("address_line1")
    private String addressLine1;

    @JsonProperty("address_line2")
    private String addressLine2;

    @JsonProperty("city")
    private String city;

    @JsonProperty("state")
    private String state;

    @JsonProperty("country")
    private String country;

    @JsonProperty("postal_code")
    private String postalCode;

    @JsonProperty("is_primary")
    private Boolean isPrimary;
}