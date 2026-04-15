package com.karigarnow.service;

import com.karigarnow.dto.request.ChangePasswordRequest;
import com.karigarnow.dto.request.UserProfileRequest;
import com.karigarnow.dto.response.UserResponse;
import com.karigarnow.exception.BadRequestException;
import com.karigarnow.exception.ResourceNotFoundException;
import com.karigarnow.exception.UserAlreadyExistsException;
import com.karigarnow.model.User;
import com.karigarnow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUserProfile(UUID userId, UserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setName(request.getName());

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new UserAlreadyExistsException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getMobile() != null) {
            user.setMobile(request.getMobile());
        }

        if (request.getPhoto() != null) {
            user.setPhoto(request.getPhoto());
        }

        user = userRepository.save(user);
        return toUserResponse(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId().toString())
                .name(user.getName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole())
                .photo(user.getPhoto())
                .build();
    }
}