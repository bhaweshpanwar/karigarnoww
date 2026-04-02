package com.karigarnow.service;

import com.karigarnow.dto.response.*;
import com.karigarnow.exception.ResourceNotFoundException;
import com.karigarnow.model.*;
import com.karigarnow.repository.*;
import com.karigarnow.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsumerServiceService {

    private final AppServiceRepository appServiceRepository;
    private final ThekedarServiceRepository thekedarServiceRepository;
    private final ThekedarRepository thekedarRepository;
    private final ReviewRepository reviewRepository;

    public ApiResponse<List<ServiceResponse>> getAllActiveServices() {
        List<AppService> services = appServiceRepository.findAll();

        List<ServiceResponse> response = services.stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                .map(this::toServiceResponse)
                .collect(Collectors.toList());

        return new ApiResponse<>(true, "Services fetched successfully", response);
    }

    public ApiResponse<ServiceDetailResponse> getServiceBySlug(
            String slug,
            String search,
            int page,
            int size,
            String sort) {

        AppService appService = appServiceRepository.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        Sort sortOrder = sort.equalsIgnoreCase("price")
                ? Sort.by(Sort.Direction.ASC, "customRate")
                : Sort.by(Sort.Direction.DESC, "ratingAverage");

        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Page<ThekedarService> thekedarServices;

        if (search != null && !search.isBlank()) {
            thekedarServices = thekedarServiceRepository.findByServiceIdAndThekedarIsOnlineAndSearch(
                    appService.getId(), search.trim(), pageable);
        } else {
            thekedarServices = thekedarServiceRepository.findByServiceIdAndThekedarIsOnline(
                    appService.getId(), pageable);
        }

        List<ThekedarSummaryResponse> thekedarSummaries = thekedarServices.getContent().stream()
                .map(this::toThekedarSummaryResponse)
                .collect(Collectors.toList());

        ServiceDetailResponse.PagedResponse<ThekedarSummaryResponse> pagedResponse =
                ServiceDetailResponse.PagedResponse.<ThekedarSummaryResponse>builder()
                        .content(thekedarSummaries)
                        .totalPages(thekedarServices.getTotalPages())
                        .totalElements(thekedarServices.getTotalElements())
                        .currentPage(page)
                        .build();

        ServiceDetailResponse response = ServiceDetailResponse.builder()
                .service(toServiceResponse(appService))
                .thekedars(pagedResponse)
                .build();

        return new ApiResponse<>(true, "Service fetched successfully", response);
    }

    public ApiResponse<ThekedarProfileResponse> getThekedarProfile(UUID thekedarId) {
        Thekedar thekedar = thekedarRepository.findByIdWithServices(thekedarId)
                .orElseThrow(() -> new ResourceNotFoundException("Thekedar not found"));

        List<Review> reviews = reviewRepository.findTop5ByThekedarIdOrderByCreatedAtDesc(thekedarId);

        ThekedarProfileResponse response = ThekedarProfileResponse.builder()
                .id(thekedar.getId())
                .name(thekedar.getUser().getName())
                .photo(thekedar.getUser().getPhoto())
                .bio(thekedar.getBio())
                .experience(thekedar.getExperience())
                .ratingAverage(thekedar.getRatingAverage())
                .totalJobs(thekedar.getTotalJobs())
                .location(thekedar.getLocation())
                .services(toThekedarServiceResponses(thekedar.getServices()))
                .reviews(toReviewSummaryResponses(reviews))
                .build();

        return new ApiResponse<>(true, "Thekedar profile fetched successfully", response);
    }

    private ServiceResponse toServiceResponse(AppService service) {
        return ServiceResponse.builder()
                .id(service.getId())
                .slug(service.getSlug())
                .name(service.getName())
                .description(service.getDescription())
                .build();
    }

    private ThekedarSummaryResponse toThekedarSummaryResponse(ThekedarService ts) {
        Thekedar t = ts.getThekedar();
        return ThekedarSummaryResponse.builder()
                .id(t.getId())
                .name(t.getUser().getName())
                .photo(t.getUser().getPhoto())
                .ratingAverage(t.getRatingAverage())
                .customRate(ts.getCustomRate())
                .experience(t.getExperience())
                .totalJobs(t.getTotalJobs())
                .location(t.getLocation())
                .isOnline(t.getIsOnline())
                .build();
    }

    private List<ThekedarServiceResponse> toThekedarServiceResponses(List<ThekedarService> services) {
        return services.stream()
                .map(ts -> ThekedarServiceResponse.builder()
                        .id(ts.getService().getId())
                        .slug(ts.getService().getSlug())
                        .name(ts.getService().getName())
                        .customRate(ts.getCustomRate())
                        .build())
                .collect(Collectors.toList());
    }

    private List<ReviewSummaryResponse> toReviewSummaryResponses(List<Review> reviews) {
        return reviews.stream()
                .map(r -> ReviewSummaryResponse.builder()
                        .id(r.getId())
                        .consumerName(r.getConsumer().getName())
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
