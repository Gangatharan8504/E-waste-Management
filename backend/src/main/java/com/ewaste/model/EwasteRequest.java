package com.ewaste.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ewaste_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EwasteRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @NotBlank
    private String deviceType;

    @NotBlank
    private String brand;

    @NotBlank
    private String model;

    @NotBlank
    @Column(name = "device_condition")
    private String condition;

    @Min(1)
    private Integer quantity;

    @Column(length = 1000)
    @NotBlank
    private String pickupAddress;

    private Double pickupLat;
    private Double pickupLng;

    @Column(length = 500)
    private String remarks;

    // Multiple images (up to 10) stored as comma-separated filenames
    @ElementCollection
    @CollectionTable(name = "request_images", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    // OTP for submission verification
    private String submitOtp;
    private LocalDateTime submitOtpExpiry;
    private boolean otpVerified = false;

    // Scheduling
    private LocalDate scheduledDate;
    private String scheduledTime;

    @Column(length = 500)
    private String adminNotes;

    @Column(length = 1000)
    private String aiSummary;

    // AI Photo Analysis Fields
    private Boolean isElectronicDevice;
    private Boolean isSuitableForRecycling;
    private String aiDeviceType;
    private String aiDeviceCategory;
    private Boolean isDamaged;
    private String aiDamageLevel; // Minor, Moderate, Severe
    private String aiEstimatedCondition;
    @Column(length = 1000)
    private String aiVisibleParts;
    @Column(length = 1000)
    private String aiMissingComponents;
    @Column(length = 1000)
    private String aiBatteryDamage;
    @Column(length = 1000)
    private String aiSafetyRisks;
    private Integer aiConfidenceScore;
    @Column(length = 1000)
    private String aiRepairRecommendation;
    @Column(length = 1000)
    private String aiReuseRecommendation;
    @Column(length = 1000)
    private String aiRecyclingRecommendation;
    @Column(length = 1000)
    private String aiSafeHandlingInstructions;
    @Column(length = 500)
    private String aiRejectedReason;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum RequestStatus {
        PENDING_OTP,   // Submitted but OTP not verified
        PENDING,       // OTP verified, awaiting admin review
        ACCEPTED,
        REJECTED,
        BETTER_IMAGES_REQUIRED, // Admin requested better photos
        SCHEDULED,
        COMPLETED,
        CANCELLED
    }
}
