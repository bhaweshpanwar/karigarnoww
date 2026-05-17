package com.karigarnow.service;

import com.karigarnow.dto.request.ThekedarServiceRequest;
import com.karigarnow.dto.request.ThekedarUpdateRequest;
import com.karigarnow.model.AppService;
import com.karigarnow.model.Thekedar;
import com.karigarnow.model.ThekedarService;
import com.karigarnow.model.User;
import com.karigarnow.repository.AppServiceRepository;
import com.karigarnow.repository.ThekedarRepository;
import com.karigarnow.repository.ThekedarServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ThekedarProfileServiceTest {

    @Mock
    private ThekedarRepository thekedarRepository;

    @Mock
    private ThekedarServiceRepository thekedarServiceRepository;

    @Mock
    private AppServiceRepository appServiceRepository;

    @InjectMocks
    private ThekedarProfileService thekedarProfileService;

    private UUID thekedarId;
    private Thekedar thekedar;
    private User user;

    @BeforeEach
    void setUp() {
        thekedarId = UUID.randomUUID();
        user = User.builder()
                .id(thekedarId)
                .name("Test Thekedar")
                .email("test@example.com")
                .role("thekedar")
                .build();
        
        thekedar = Thekedar.builder()
                .id(thekedarId)
                .user(user)
                .isOnline(false)
                .services(new ArrayList<>())
                .build();
    }

    @Test
    void updateProfile_ShouldGoOnline_WhenCompleteAndHasServices() {
        // Arrange
        ThekedarUpdateRequest request = ThekedarUpdateRequest.builder()
                .bio("I am a skilled plumber with 10 years experience.")
                .location("Indore, MP")
                .ratePerHour(new BigDecimal("250.00"))
                .build();

        when(thekedarRepository.findByIdWithUser(thekedarId)).thenReturn(Optional.of(thekedar));
        
        // Mock that they ALREADY have a service
        AppService appService = AppService.builder().id(UUID.randomUUID()).name("Plumbing").build();
        ThekedarService ts = ThekedarService.builder().service(appService).customRate(new BigDecimal("250.00")).build();
        when(thekedarServiceRepository.findByThekedarId(thekedarId))
                .thenReturn(Collections.singletonList(ts));
        
        when(thekedarRepository.save(any(Thekedar.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        thekedarProfileService.updateProfile(thekedarId, request);

        // Assert
        assertTrue(thekedar.getIsOnline(), "Thekedar should be auto-online when profile is complete and has services");
        assertEquals("Indore, MP", thekedar.getLocation());
        assertEquals(new BigDecimal("250.00"), thekedar.getRatePerHour());
    }

    @Test
    void updateProfile_ShouldStayOffline_WhenCompleteButNoServices() {
        // Arrange
        ThekedarUpdateRequest request = ThekedarUpdateRequest.builder()
                .bio("I am a skilled plumber.")
                .location("Indore, MP")
                .ratePerHour(new BigDecimal("200.00"))
                .build();

        when(thekedarRepository.findByIdWithUser(thekedarId)).thenReturn(Optional.of(thekedar));
        // No services
        when(thekedarServiceRepository.findByThekedarId(thekedarId)).thenReturn(Collections.emptyList());
        when(thekedarRepository.save(any(Thekedar.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        thekedarProfileService.updateProfile(thekedarId, request);

        // Assert
        assertFalse(thekedar.getIsOnline(), "Thekedar should stay offline if they have no services");
    }

    @Test
    void addService_ShouldGoOnline_WhenProfileAlreadyComplete() {
        // Arrange
        thekedar.setBio("Detailed bio");
        thekedar.setLocation("Bhopal");
        thekedar.setRatePerHour(new BigDecimal("150.00"));
        thekedar.setIsOnline(false);

        UUID serviceId = UUID.randomUUID();
        ThekedarServiceRequest request = ThekedarServiceRequest.builder()
                .serviceId(serviceId)
                .customRate(new BigDecimal("150.00"))
                .build();

        AppService appService = AppService.builder().id(serviceId).name("Plumbing").build();

        when(thekedarRepository.findById(thekedarId)).thenReturn(Optional.of(thekedar));
        when(appServiceRepository.findById(serviceId)).thenReturn(Optional.of(appService));
        when(thekedarServiceRepository.findByThekedarIdAndServiceId(thekedarId, serviceId)).thenReturn(Optional.empty());
        
        // Mock that they NOW have a service (after addition)
        ThekedarService ts = ThekedarService.builder().service(appService).customRate(new BigDecimal("150.00")).build();
        when(thekedarServiceRepository.findByThekedarId(thekedarId))
                .thenReturn(Collections.singletonList(ts));

        // Act
        thekedarProfileService.addService(thekedarId, request);

        // Assert
        assertTrue(thekedar.getIsOnline(), "Thekedar should go online when adding first service if profile is complete");
    }
}
