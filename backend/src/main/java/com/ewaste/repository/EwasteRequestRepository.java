package com.ewaste.repository;

import com.ewaste.model.EwasteRequest;
import com.ewaste.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EwasteRequestRepository extends JpaRepository<EwasteRequest, Long> {
    List<EwasteRequest> findByUserOrderByCreatedAtDesc(User user);
    Page<EwasteRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<EwasteRequest> findByStatusOrderByCreatedAtDesc(EwasteRequest.RequestStatus status, Pageable pageable);
    long countByStatus(EwasteRequest.RequestStatus status);
    long countByStatusNot(EwasteRequest.RequestStatus status);
    long countByCreatedAtAfter(LocalDateTime date);

    @Query("SELECT r.deviceType, COUNT(r) FROM EwasteRequest r WHERE r.status != 'PENDING_OTP' GROUP BY r.deviceType")
    List<Object[]> countByDeviceType();
}
