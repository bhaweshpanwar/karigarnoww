package com.karigarnow.service;

import com.karigarnow.dto.request.CreateReviewRequest;
import com.karigarnow.exception.BadRequestException;
import com.karigarnow.exception.ForbiddenException;
import com.karigarnow.exception.ResourceNotFoundException;
import com.karigarnow.model.Booking;
import com.karigarnow.model.Review;
import com.karigarnow.model.Thekedar;
import com.karigarnow.model.User;
import com.karigarnow.repository.BookingRepository;
import com.karigarnow.repository.ReviewRepository;
import com.karigarnow.repository.ThekedarRepository;
import com.karigarnow.repository.UserRepository;
import com.karigarnow.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ThekedarRepository thekedarRepository;

    @Transactional
    public ApiResponse<Review> createReview(CreateReviewRequest request, UUID consumerId) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!"completed".equals(booking.getBookingStatus())) {
            throw new BadRequestException("Can only review completed bookings");
        }

        if (!booking.getConsumer().getId().equals(consumerId)) {
            throw new ForbiddenException("You are not authorized to review this booking");
        }

        Thekedar thekedar = thekedarRepository.findById(request.getThekedarId())
                .orElseThrow(() -> new ResourceNotFoundException("Thekedar not found"));

        Review review = Review.builder()
                .booking(booking)
                .consumer(booking.getConsumer())
                .thekedar(thekedar)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);

        return new ApiResponse<>(true, "Review submitted successfully", review);
    }
}