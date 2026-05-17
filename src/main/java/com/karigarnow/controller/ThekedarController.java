package com.karigarnow.controller;

import com.karigarnow.dto.request.ThekedarServiceRequest;
import com.karigarnow.dto.request.ThekedarUpdateRequest;
import com.karigarnow.dto.response.ThekedarSelfProfileResponse;
import com.karigarnow.dto.response.ThekedarServiceResponse;
import com.karigarnow.service.ThekedarProfileService;
import com.karigarnow.utils.ApiResponse;
import com.karigarnow.utils.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ThekedarController {

    private final ThekedarProfileService thekedarProfileService;

    @GetMapping("/thekedars/me")
    public ResponseEntity<ApiResponse<ThekedarSelfProfileResponse>> getMyProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(thekedarProfileService.getMyProfile(UUID.fromString(principal.getUserId())));
    }

    @PutMapping("/thekedars/me")
    public ResponseEntity<ApiResponse<ThekedarSelfProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ThekedarUpdateRequest request) {
        return ResponseEntity.ok(thekedarProfileService.updateProfile(
                UUID.fromString(principal.getUserId()), request));
    }

    @PostMapping("/thekedar-services")
    public ResponseEntity<ApiResponse<List<ThekedarServiceResponse>>> addService(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ThekedarServiceRequest request) {
        return ResponseEntity.ok(thekedarProfileService.addService(
                UUID.fromString(principal.getUserId()), request));
    }

    @DeleteMapping("/thekedar-services/{serviceId}")
    public ResponseEntity<ApiResponse<List<ThekedarServiceResponse>>> removeService(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID serviceId) {
        return ResponseEntity.ok(thekedarProfileService.removeService(
                UUID.fromString(principal.getUserId()), serviceId));
    }
}
