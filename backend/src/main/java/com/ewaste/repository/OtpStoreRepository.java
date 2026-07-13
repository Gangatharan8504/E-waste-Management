package com.ewaste.repository;

import com.ewaste.model.OtpStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpStoreRepository extends JpaRepository<OtpStore, Long> {

    Optional<OtpStore> findByEmailAndPurpose(String email, String purpose);

    void deleteByEmail(String email);

    void deleteByEmailAndPurpose(String email, String purpose);

    @Modifying
    @Transactional
    @Query("DELETE FROM OtpStore o WHERE o.expiresAt < :now")
    void deleteExpired(LocalDateTime now);
}
