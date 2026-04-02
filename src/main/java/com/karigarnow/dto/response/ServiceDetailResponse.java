package com.karigarnow.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDetailResponse {

    @JsonProperty("service")
    private ServiceResponse service;

    @JsonProperty("thekedars")
    private PagedResponse<ThekedarSummaryResponse> thekedars;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PagedResponse<T> {
        @JsonProperty("content")
        private List<T> content;

        @JsonProperty("totalPages")
        private int totalPages;

        @JsonProperty("totalElements")
        private long totalElements;

        @JsonProperty("currentPage")
        private int currentPage;
    }
}
