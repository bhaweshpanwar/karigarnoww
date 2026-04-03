package com.karigarnow.controller;

import com.karigarnow.dto.request.GoogleAuthRequest;
import com.karigarnow.dto.request.LoginRequest;
import com.karigarnow.dto.request.RegisterRequest;
import com.karigarnow.dto.response.UserResponse;
import com.karigarnow.model.User;
import com.karigarnow.repository.UserRepository;
import com.karigarnow.service.AuthService;
import com.karigarnow.utils.ApiResponse;
import com.karigarnow.utils.UserPrincipal;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Not authenticated", null));
        }
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User user = userRepository.findById(java.util.UUID.fromString(principal.getUserId()))
                .orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "User not found", null));
        }
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId().toString())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .photo(user.getPhoto())
                .build();
        return ResponseEntity.ok(new ApiResponse<>(true, "User found", userResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        Map<String, Object> result = authService.register(request);
        UserResponse user = (UserResponse) result.get("user");
        return ResponseEntity.ok(new ApiResponse<>(true, "Registration successful", user));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse httpResponse) {
        Map<String, Object> result = authService.login(request);
        String token = (String) result.get("token");
        UserResponse user = (UserResponse) result.get("user");
        setJwtCookie(token, httpResponse);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", user));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<UserResponse>> googleAuth(
            @Valid @RequestBody GoogleAuthRequest request,
            HttpServletResponse httpResponse) {
        Map<String, Object> result = authService.googleAuth(request);
        String token = (String) result.get("token");
        UserResponse user = (UserResponse) result.get("user");
        setJwtCookie(token, httpResponse);
        return ResponseEntity.ok(new ApiResponse<>(true, "Authentication successful", user));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse httpResponse) {
        clearJwtCookie(httpResponse);
        return ResponseEntity.ok(new ApiResponse<>(true, "Logged out successfully", null));
    }

    private void setJwtCookie(String token, HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setMaxAge(604800);
        cookie.setPath("/");
        response.addCookie(cookie);
    }

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", "1");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
    }
}
