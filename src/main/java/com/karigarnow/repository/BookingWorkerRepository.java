package com.karigarnow.repository;

import com.karigarnow.model.BookingWorker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingWorkerRepository extends JpaRepository<BookingWorker, UUID> {

    List<BookingWorker> findByBookingId(UUID bookingId);
}
