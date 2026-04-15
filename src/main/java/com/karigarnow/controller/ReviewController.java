package com.karigarnow.controller;

import com.karigarnow.dto.request.CreateReviewRequest;
import com.karigarnow.dto.response.ReviewResponse;
import com.karigarnow.exception.ForbiddenException;
import com.karigarnow.model.Review;
import com.karigarnow.service.ReviewService;
import com.karigarnow.utils.ApiResponse;
import com.karigarnow.utils.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (!"consumer".equals(principal.getRole())) {
            throw new ForbiddenException("Only consumers can submit reviews");
        }
        UUID consumerId = UUID.fromString(principal.getUserId());
        ApiResponse<Review> response = reviewService.createReview(request, consumerId);
        Review review = response.getData();
        ReviewResponse reviewResponse = ReviewResponse.builder()
                .rating(review.getRating())
                .comment(review.getComment())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Review submitted successfully", reviewResponse));
    }
}