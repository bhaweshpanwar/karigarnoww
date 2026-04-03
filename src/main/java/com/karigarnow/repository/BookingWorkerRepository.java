package com.karigarnow.repository;

import com.karigarnow.model.BookingWorker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingWorkerRepository extends JpaRepository<BookingWorker, UUID> {

    List<BookingWorker> findByBookingId(UUID bookingId);

    @Query("""
        SELECT COUNT(bw) > 0 FROM BookingWorker bw
        WHERE bw.worker.id = :workerId
        AND bw.booking.bookingStatus IN ('pending', 'accepted', 'dispatched', 'in_progress')
        """)
    boolean existsByWorkerIdAndActiveBooking(@Param("workerId") UUID workerId);
}
