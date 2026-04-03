package com.karigarnow.controller;

import com.karigarnow.dto.request.WorkerRequest;
import com.karigarnow.dto.request.WorkerUpdateRequest;
import com.karigarnow.dto.response.WorkerResponse;
import com.karigarnow.exception.ForbiddenException;
import com.karigarnow.utils.UserPrincipal;
import com.karigarnow.service.WorkerService;
import com.karigarnow.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkerResponse>>> getWorkers(
            @RequestParam(required = false) Boolean available) {
        UUID thekedarId = requireThekedarId();
        List<WorkerResponse> workers = workerService.getWorkers(thekedarId, available);
        return ResponseEntity.ok(new ApiResponse<>(true, "Workers fetched", workers));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkerResponse>> createWorker(
            @Valid @RequestBody WorkerRequest request) {
        UUID thekedarId = requireThekedarId();
        WorkerResponse worker = workerService.createWorker(thekedarId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Worker added", worker));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkerResponse>> updateWorker(
            @PathVariable UUID id,
            @Valid @RequestBody WorkerUpdateRequest request) {
        UUID thekedarId = requireThekedarId();
        WorkerResponse worker = workerService.updateWorker(thekedarId, id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Worker updated", worker));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWorker(@PathVariable UUID id) {
        UUID thekedarId = requireThekedarId();
        workerService.deleteWorker(thekedarId, id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Worker removed successfully", null));
    }

    private UUID requireThekedarId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new ForbiddenException("Access denied");
        }
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        // Thekedar.id == User.id (MapsId), so userId from JWT is the thekedar UUID
        return UUID.fromString(principal.getUserId());
    }
}
