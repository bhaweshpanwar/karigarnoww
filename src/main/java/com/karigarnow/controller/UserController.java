package com.karigarnow.controller;

import com.karigarnow.dto.request.ChangePasswordRequest;
import com.karigarnow.dto.request.UserProfileRequest;
import com.karigarnow.dto.response.UserResponse;
import com.karigarnow.service.UserService;
import com.karigarnow.utils.ApiResponse;
import com.karigarnow.utils.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = UUID.fromString(principal.getUserId());
        UserResponse user = userService.getUserProfile(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "User profile fetched", user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateCurrentUser(
            @Valid @RequestBody UserProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = UUID.fromString(principal.getUserId());
        UserResponse user = userService.updateUserProfile(userId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", user));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = UUID.fromString(principal.getUserId());
        userService.changePassword(userId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password changed successfully", null));
    }
}