package com.karigarnow.service;

import com.karigarnow.dto.request.GoogleAuthRequest;
import com.karigarnow.dto.request.LoginRequest;
import com.karigarnow.dto.request.RegisterRequest;
import com.karigarnow.dto.response.AuthResponse;
import com.karigarnow.dto.response.UserResponse;
import com.karigarnow.exception.GoogleAuthException;
import com.karigarnow.exception.UserAlreadyExistsException;
import com.karigarnow.model.User;
import com.karigarnow.repository.UserRepository;
import com.karigarnow.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public Map<String, Object> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .mobile(request.getMobile())
                .role(request.getRole())
                .authProvider("local")
                .active(true)
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId().toString());

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId().toString())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .photo(user.getPhoto())
                .build();

        return Map.of("token", token, "user", userResponse);
    }

    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.getActive()) {
            throw new BadCredentialsException("Account is deactivated");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId().toString());

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId().toString())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .photo(user.getPhoto())
                .build();

        return Map.of("token", token, "user", userResponse);
    }

    public Map<String, Object> googleAuth(GoogleAuthRequest request) {
        String googleToken = request.getGoogleToken();

        // Decode Google token payload (without verification for simplicity)
        // In production, use Google ID token verification with Google's public keys
        String[] payload;
        try {
            payload = decodeGoogleToken(googleToken);
        } catch (Exception e) {
            throw new GoogleAuthException("Invalid Google token");
        }

        String googleClientId = payload[0];
        String email = payload[1];
        String googleUserId = payload[2];

        // For MVP, we do basic validation. In production, verify against Google's servers.
        // For local dev, we accept tokens from the Google OAuth flow

        return userRepository.findByAuthProviderId(googleUserId)
                .map(user -> {
                    String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId().toString());
                    UserResponse userResponse = UserResponse.builder()
                            .id(user.getId().toString())
                            .name(user.getName())
                            .email(user.getEmail())
                            .role(user.getRole())
                            .build();
                    return Map.<String, Object>of("token", token, "user", userResponse);
                })
                .orElseGet(() -> {
                    // Create new user with google auth
                    User newUser = User.builder()
                            .name(email.split("@")[0])
                            .email(email)
                            .authProvider("google")
                            .authProviderId(googleUserId)
                            .role(request.getRole())
                            .active(true)
                            .build();

                    newUser = userRepository.save(newUser);

                    String token = jwtUtil.generateToken(newUser.getEmail(), newUser.getRole(), newUser.getId().toString());

                    UserResponse userResponse = UserResponse.builder()
                            .id(newUser.getId().toString())
                            .name(newUser.getName())
                            .email(newUser.getEmail())
                            .role(newUser.getRole())
                            .build();

                    return Map.<String, Object>of("token", token, "user", userResponse);
                });
    }

    // Simple Base64 URL decode for Google token payload (for MVP)
    // Format: header.payload.signature
    private String[] decodeGoogleToken(String token) {
        String[] parts = token.split("\\.");
        if (parts.length < 2) {
            throw new GoogleAuthException("Invalid token format");
        }

        String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));

        // Simple JSON parsing without external library
        String email = extractJsonValue(payloadJson, "email");
        String sub = extractJsonValue(payloadJson, "sub");
        String aud = extractJsonValue(payloadJson, "aud");

        if (email == null || sub == null) {
            throw new GoogleAuthException("Token missing required fields");
        }

        return new String[]{aud, email, sub};
    }

    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex == -1) return null;

        int colonIndex = json.indexOf(":", keyIndex);
        if (colonIndex == -1) return null;

        int valueStart = colonIndex + 1;
        while (valueStart < json.length() && Character.isWhitespace(json.charAt(valueStart))) {
            valueStart++;
        }

        if (valueStart >= json.length()) return null;

        char startChar = json.charAt(valueStart);

        if (startChar == '"') {
            int valueEnd = json.indexOf("\"", valueStart + 1);
            return json.substring(valueStart + 1, valueEnd);
        } else {
            int valueEnd = valueStart;
            while (valueEnd < json.length() && json.charAt(valueEnd) != ',' && json.charAt(valueEnd) != '}') {
                valueEnd++;
            }
            return json.substring(valueStart, valueEnd).trim();
        }
    }
}
