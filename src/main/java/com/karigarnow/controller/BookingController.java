package com.karigarnow.controller;

import com.karigarnow.dto.request.CreateBookingRequest;
import com.karigarnow.dto.request.DispatchRequest;
import com.karigarnow.dto.request.OtpVerifyRequest;
import com.karigarnow.dto.response.BookingResponse;
import com.karigarnow.dto.response.PagedBookingResponse;
import com.karigarnow.exception.ForbiddenException;
import com.karigarnow.service.BookingService;
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
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (!"consumer".equals(principal.getRole())) {
            throw new ForbiddenException("Only consumers can create bookings");
        }
        UUID consumerId = UUID.fromString(principal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request, consumerId));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedBookingResponse>> listBookings(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = UUID.fromString(principal.getUserId());
        return ResponseEntity.ok(
                bookingService.listBookings(principal.getRole(), userId, status, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = UUID.fromString(principal.getUserId());
        return ResponseEntity.ok(
                bookingService.getBookingById(id, principal.getRole(), userId));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<BookingResponse>> acceptBooking(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (!"thekedar".equals(principal.getRole())) {
            throw new ForbiddenException("Only thekedars can accept bookings");
        }
        UUID thekedarId = UUID.fromString(principal.getUserId());
        return ResponseEntity.ok(bookingService.acceptBooking(id, thekedarId));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (!"thekedar".equals(principal.getRole())) {
            throw new ForbiddenException("Only thekedars can reject bookings");
        }
        UUID thekedarId = UUID.fromString(principal.getUserId());
        return ResponseEntity.ok(bookingService.rejectBooking(id, thekedarId));
    }

    @PutMapping("/{id}/dispatch")
    public ResponseEntity<ApiResponse<BookingResponse>> dispatchWorkers(
            @PathVariable UUID id,
            @Valid @RequestBody DispatchRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (!"thekedar".equals(principal.getRole())) {
            throw new ForbiddenException("Only thekedars can dispatch workers");
        }
        UUID thekedarId = UUID.fromString(principal.getUserId());
        return ResponseEntity.ok(bookingService.dispatchWorkers(id, request, thekedarId));
    }

    @PostMapping("/{id}/verify-otp")
    public ResponseEntity<ApiResponse<BookingResponse>> verifyOtp(
            @PathVariable UUID id,
            @Valid @RequestBody OtpVerifyRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (!"consumer".equals(principal.getRole())) {
            throw new ForbiddenException("Only consumers can verify OTP");
        }
        UUID consumerId = UUID.fromString(principal.getUserId());
        return ResponseEntity.ok(bookingService.verifyOtp(id, request, consumerId));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<BookingResponse>> completeBooking(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (!"consumer".equals(principal.getRole())) {
            throw new ForbiddenException("Only consumers can complete bookings");
        }
        UUID consumerId = UUID.fromString(principal.getUserId());
        return ResponseEntity.ok(bookingService.completeBooking(id, consumerId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = UUID.fromString(principal.getUserId());
        return ResponseEntity.ok(
                bookingService.cancelBooking(id, userId, principal.getRole()));
    }
}
