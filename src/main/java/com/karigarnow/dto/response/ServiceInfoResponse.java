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
public class ServiceInfoResponse {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("slug")
    private String slug;

    @JsonProperty("name")
    private String name;
}
