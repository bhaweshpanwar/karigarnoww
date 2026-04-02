package com.karigarnow.controller;

import com.karigarnow.dto.response.*;
import com.karigarnow.service.ConsumerServiceService;
import com.karigarnow.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ConsumerServiceController {

    private final ConsumerServiceService consumerServiceService;

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAllServices() {
        return ResponseEntity.ok(consumerServiceService.getAllActiveServices());
    }

    @GetMapping("/services/{slug}")
    public ResponseEntity<ApiResponse<ServiceDetailResponse>> getServiceBySlug(
            @PathVariable String slug,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "rating") String sort) {
        return ResponseEntity.ok(
                consumerServiceService.getServiceBySlug(slug, search, page, size, sort));
    }

    @GetMapping("/thekedars/{id}")
    public ResponseEntity<ApiResponse<ThekedarProfileResponse>> getThekedarProfile(
            @PathVariable UUID id) {
        return ResponseEntity.ok(consumerServiceService.getThekedarProfile(id));
    }
}
