package com.karigarnow.service;

import com.karigarnow.dto.request.ThekedarServiceRequest;
import com.karigarnow.dto.request.ThekedarUpdateRequest;
import com.karigarnow.dto.response.ThekedarSelfProfileResponse;
import com.karigarnow.dto.response.ThekedarServiceResponse;
import com.karigarnow.exception.ResourceNotFoundException;
import com.karigarnow.model.AppService;
import com.karigarnow.model.Thekedar;
import com.karigarnow.model.ThekedarService;
import com.karigarnow.repository.AppServiceRepository;
import com.karigarnow.repository.ThekedarRepository;
import com.karigarnow.repository.ThekedarServiceRepository;
import com.karigarnow.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ThekedarProfileService {

    private final ThekedarRepository thekedarRepository;
    private final ThekedarServiceRepository thekedarServiceRepository;
    private final AppServiceRepository appServiceRepository;

    public ApiResponse<ThekedarSelfProfileResponse> getMyProfile(UUID thekedarId) {
        Thekedar thekedar = thekedarRepository.findByIdWithUser(thekedarId)
                .orElseThrow(() -> new ResourceNotFoundException("Thekedar not found"));

        return new ApiResponse<>(true, "Profile fetched", mapToSelfProfileResponse(thekedar));
    }

    @Transactional
    public ApiResponse<ThekedarSelfProfileResponse> updateProfile(UUID thekedarId, ThekedarUpdateRequest request) {
        Thekedar thekedar = thekedarRepository.findByIdWithUser(thekedarId)
                .orElseThrow(() -> new ResourceNotFoundException("Thekedar not found"));

        if (request.getBio() != null) thekedar.setBio(request.getBio());
        if (request.getExperience() != null) thekedar.setExperience(request.getExperience());
        if (request.getTeamSize() != null) thekedar.setTeamSize(request.getTeamSize());
        if (request.getRatePerHour() != null) thekedar.setRatePerHour(request.getRatePerHour());
        if (request.getLocation() != null) thekedar.setLocation(request.getLocation());
        
        if (request.getIsOnline() != null) {
            thekedar.setIsOnline(request.getIsOnline());
        } else {
            syncOnlineStatus(thekedar);
        }

        thekedar = thekedarRepository.save(thekedar);
        return new ApiResponse<>(true, "Profile updated", mapToSelfProfileResponse(thekedar));
    }

    @Transactional
    public ApiResponse<List<ThekedarServiceResponse>> addService(UUID thekedarId, ThekedarServiceRequest request) {
        Thekedar thekedar = thekedarRepository.findById(thekedarId)
                .orElseThrow(() -> new ResourceNotFoundException("Thekedar not found"));

        AppService appService = appServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service category not found"));

        thekedarServiceRepository.findByThekedarIdAndServiceId(thekedarId, request.getServiceId())
                .ifPresentOrElse(
                        ts -> {
                            ts.setCustomRate(request.getCustomRate());
                            thekedarServiceRepository.save(ts);
                        },
                        () -> {
                            ThekedarService ts = ThekedarService.builder()
                                    .thekedar(thekedar)
                                    .service(appService)
                                    .customRate(request.getCustomRate())
                                    .build();
                            thekedarServiceRepository.save(ts);
                        }
                );

        // After adding a service, re-sync online status
        syncOnlineStatus(thekedar);
        thekedarRepository.save(thekedar);

        return new ApiResponse<>(true, "Service added/updated", getThekedarServices(thekedarId));
    }

    /**
     * Automatically sets a thekedar to online if they have a complete profile
     * (bio, location, rate) and at least one service offered.
     */
    private void syncOnlineStatus(Thekedar thekedar) {
        boolean isProfileComplete = 
                thekedar.getBio() != null && !thekedar.getBio().isBlank() &&
                thekedar.getLocation() != null && !thekedar.getLocation().isBlank() &&
                thekedar.getRatePerHour() != null;
        
        // We also want to ensure they have at least one service
        List<ThekedarService> currentServices = thekedarServiceRepository.findByThekedarId(thekedar.getId());
        boolean hasServices = !currentServices.isEmpty();

        if (isProfileComplete && hasServices) {
            if (!Boolean.TRUE.equals(thekedar.getIsOnline())) {
                thekedar.setIsOnline(true);
                log.info("Thekedar {} ({}) has completed profile and added services. Status set to AUTO-ONLINE.", 
                        thekedar.getId(), thekedar.getUser().getName());
            }
        }
    }

    @Transactional
    public ApiResponse<List<ThekedarServiceResponse>> removeService(UUID thekedarId, UUID serviceId) {
        thekedarServiceRepository.deleteByThekedarIdAndServiceId(thekedarId, serviceId);
        return new ApiResponse<>(true, "Service removed", getThekedarServices(thekedarId));
    }

    private List<ThekedarServiceResponse> getThekedarServices(UUID thekedarId) {
        return thekedarServiceRepository.findByThekedarId(thekedarId).stream()
                .map(ts -> ThekedarServiceResponse.builder()
                        .id(ts.getService().getId())
                        .slug(ts.getService().getSlug())
                        .name(ts.getService().getName())
                        .customRate(ts.getCustomRate())
                        .build())
                .collect(Collectors.toList());
    }

    private ThekedarSelfProfileResponse mapToSelfProfileResponse(Thekedar thekedar) {
        return ThekedarSelfProfileResponse.builder()
                .id(thekedar.getId())
                .name(thekedar.getUser().getName())
                .email(thekedar.getUser().getEmail())
                .mobile(thekedar.getUser().getMobile())
                .photo(thekedar.getUser().getPhoto())
                .bio(thekedar.getBio())
                .experience(thekedar.getExperience())
                .teamSize(thekedar.getTeamSize())
                .ratePerHour(thekedar.getRatePerHour())
                .isOnline(thekedar.getIsOnline())
                .ratingAverage(thekedar.getRatingAverage())
                .totalJobs(thekedar.getTotalJobs())
                .location(thekedar.getLocation())
                .services(getThekedarServices(thekedar.getId()))
                .build();
    }
}
