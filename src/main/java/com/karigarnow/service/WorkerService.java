package com.karigarnow.service;

import com.karigarnow.dto.request.WorkerRequest;
import com.karigarnow.dto.request.WorkerUpdateRequest;
import com.karigarnow.dto.response.WorkerResponse;
import com.karigarnow.exception.BadRequestException;
import com.karigarnow.exception.ForbiddenException;
import com.karigarnow.exception.ResourceNotFoundException;
import com.karigarnow.model.Thekedar;
import com.karigarnow.model.User;
import com.karigarnow.model.Worker;
import com.karigarnow.repository.BookingWorkerRepository;
import com.karigarnow.repository.ThekedarRepository;
import com.karigarnow.repository.UserRepository;
import com.karigarnow.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final ThekedarRepository thekedarRepository;
    private final UserRepository userRepository;
    private final BookingWorkerRepository bookingWorkerRepository;

    public List<WorkerResponse> getWorkers(UUID thekedarId, Boolean available) {
        List<Worker> workers;
        if (available != null && available) {
            workers = workerRepository.findByThekedarIdAndIsAvailableTrue(thekedarId);
        } else {
            workers = workerRepository.findByThekedarId(thekedarId);
        }
        return workers.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public WorkerResponse createWorker(UUID thekedarId, WorkerRequest request) {
        Thekedar thekedar = thekedarRepository.findById(thekedarId)
                .orElseThrow(() -> new ResourceNotFoundException("Thekedar not found"));

        String skillsStr = request.getSkills() != null
                ? String.join(",", request.getSkills())
                : null;

        Worker worker = Worker.builder()
                .thekedar(thekedar)
                .name(request.getName())
                .mobile(request.getMobile())
                .skills(skillsStr)
                .dailyRate(request.getDailyRate())
                .isAvailable(true)
                .totalJobs(0)
                .build();

        worker = workerRepository.save(worker);

        thekedar.setTeamSize(thekedar.getTeamSize() + 1);
        thekedarRepository.save(thekedar);

        return toResponse(worker);
    }

    @Transactional
    public WorkerResponse updateWorker(UUID thekedarId, UUID workerId, WorkerUpdateRequest request) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));

        if (!worker.getThekedar().getId().equals(thekedarId)) {
            throw new ForbiddenException("Worker does not belong to this thekedar");
        }

        if (request.getName() != null) {
            worker.setName(request.getName());
        }
        if (request.getMobile() != null) {
            worker.setMobile(request.getMobile());
        }
        if (request.getSkills() != null) {
            worker.setSkills(String.join(",", request.getSkills()));
        }
        if (request.getDailyRate() != null) {
            worker.setDailyRate(request.getDailyRate());
        }
        if (request.getIsAvailable() != null) {
            worker.setIsAvailable(request.getIsAvailable());
        }

        return toResponse(workerRepository.save(worker));
    }

    @Transactional
    public void deleteWorker(UUID thekedarId, UUID workerId) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));

        if (!worker.getThekedar().getId().equals(thekedarId)) {
            throw new ForbiddenException("Worker does not belong to this thekedar");
        }

        if (bookingWorkerRepository.existsByWorkerIdAndActiveBooking(workerId)) {
            throw new BadRequestException("Worker is assigned to an active booking");
        }

        Thekedar thekedar = worker.getThekedar();
        workerRepository.delete(worker);

        thekedar.setTeamSize(Math.max(0, thekedar.getTeamSize() - 1));
        thekedarRepository.save(thekedar);
    }

    private WorkerResponse toResponse(Worker worker) {
        List<String> skillsList = worker.getSkills() != null && !worker.getSkills().isBlank()
                ? Arrays.asList(worker.getSkills().split(","))
                : null;

        return WorkerResponse.builder()
                .id(worker.getId().toString())
                .name(worker.getName())
                .mobile(worker.getMobile())
                .skills(skillsList)
                .dailyRate(worker.getDailyRate())
                .isAvailable(worker.getIsAvailable())
                .totalJobs(worker.getTotalJobs())
                .thekedarId(worker.getThekedar().getId().toString())
                .build();
    }
}
