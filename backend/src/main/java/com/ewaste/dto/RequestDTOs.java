package com.ewaste.dto;

import com.ewaste.model.EwasteRequest;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class RequestDTOs {

    @Data
    public static class CreateRequestDTO {
        @NotBlank(message = "Device type is required")
        private String deviceType;
        @NotBlank(message = "Brand is required")
        private String brand;
        @NotBlank(message = "Model is required")
        private String model;
        @NotBlank(message = "Condition is required")
        private String condition;
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
        @NotBlank(message = "Pickup address is required")
        private String pickupAddress;
        private Double pickupLat;
        private Double pickupLng;
        private String remarks;

        // AI assessment reports submitted
        private Boolean isElectronicDevice;
        private Boolean isSuitableForRecycling;
        private String aiDeviceType;
        private String aiDeviceCategory;
        private Boolean isDamaged;
        private String aiDamageLevel;
        private String aiEstimatedCondition;
        private String aiVisibleParts;
        private String aiMissingComponents;
        private String aiBatteryDamage;
        private String aiSafetyRisks;
        private Integer aiConfidenceScore;
        private String aiRepairRecommendation;
        private String aiReuseRecommendation;
        private String aiRecyclingRecommendation;
        private String aiSafeHandlingInstructions;
        private String aiRejectedReason;
        private String aiSummary;
    }

    @Data
    public static class VerifySubmitOtpDTO {
        @NotBlank
        private String otp;
    }

    @Data
    public static class ScheduleRequestDTO {
        @NotBlank(message = "Scheduled date is required")
        private String scheduledDate;
        @NotBlank(message = "Scheduled time is required")
        private String scheduledTime;
        private String adminNotes;
    }

    @Data
    public static class UpdateStatusDTO {
        @NotBlank
        private String status;
    }

    @Data
    public static class RequestResponseDTO {
        private Long id;
        private Long userId;
        private String userName;
        private String userEmail;
        private String userPhone;
        private String deviceType;
        private String brand;
        private String model;
        private String condition;
        private Integer quantity;
        private String pickupAddress;
        private Double pickupLat;
        private Double pickupLng;
        private String remarks;
        private List<String> imageUrls;
        private String status;
        private boolean otpVerified;
        private LocalDate scheduledDate;
        private String scheduledTime;
        private String adminNotes;
        private String aiSummary;

        // AI assessment reports fields
        private Boolean isElectronicDevice;
        private Boolean isSuitableForRecycling;
        private String aiDeviceType;
        private String aiDeviceCategory;
        private Boolean isDamaged;
        private String aiDamageLevel;
        private String aiEstimatedCondition;
        private String aiVisibleParts;
        private String aiMissingComponents;
        private String aiBatteryDamage;
        private String aiSafetyRisks;
        private Integer aiConfidenceScore;
        private String aiRepairRecommendation;
        private String aiReuseRecommendation;
        private String aiRecyclingRecommendation;
        private String aiSafeHandlingInstructions;
        private String aiRejectedReason;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static RequestResponseDTO from(EwasteRequest req) {
            RequestResponseDTO dto = new RequestResponseDTO();
            dto.setId(req.getId());
            if (req.getUser() != null) {
                dto.setUserId(req.getUser().getId());
                dto.setUserName(req.getUser().getFullName());
                dto.setUserEmail(req.getUser().getEmail());
                dto.setUserPhone(req.getUser().getPhone());
            }
            dto.setDeviceType(req.getDeviceType());
            dto.setBrand(req.getBrand());
            dto.setModel(req.getModel());
            dto.setCondition(req.getCondition());
            dto.setQuantity(req.getQuantity());
            dto.setPickupAddress(req.getPickupAddress());
            dto.setPickupLat(req.getPickupLat());
            dto.setPickupLng(req.getPickupLng());
            dto.setRemarks(req.getRemarks());
            dto.setImageUrls(req.getImageUrls() != null ? new java.util.ArrayList<>(req.getImageUrls()) : new java.util.ArrayList<>());
            dto.setStatus(req.getStatus().name());
            dto.setOtpVerified(req.isOtpVerified());
            dto.setScheduledDate(req.getScheduledDate());
            dto.setScheduledTime(req.getScheduledTime());
            dto.setAdminNotes(req.getAdminNotes());
            dto.setAiSummary(req.getAiSummary());

            // Map AI fields
            dto.setIsElectronicDevice(req.getIsElectronicDevice());
            dto.setIsSuitableForRecycling(req.getIsSuitableForRecycling());
            dto.setAiDeviceType(req.getAiDeviceType());
            dto.setAiDeviceCategory(req.getAiDeviceCategory());
            dto.setIsDamaged(req.getIsDamaged());
            dto.setAiDamageLevel(req.getAiDamageLevel());
            dto.setAiEstimatedCondition(req.getAiEstimatedCondition());
            dto.setAiVisibleParts(req.getAiVisibleParts());
            dto.setAiMissingComponents(req.getAiMissingComponents());
            dto.setAiBatteryDamage(req.getAiBatteryDamage());
            dto.setAiSafetyRisks(req.getAiSafetyRisks());
            dto.setAiConfidenceScore(req.getAiConfidenceScore());
            dto.setAiRepairRecommendation(req.getAiRepairRecommendation());
            dto.setAiReuseRecommendation(req.getAiReuseRecommendation());
            dto.setAiRecyclingRecommendation(req.getAiRecyclingRecommendation());
            dto.setAiSafeHandlingInstructions(req.getAiSafeHandlingInstructions());
            dto.setAiRejectedReason(req.getAiRejectedReason());

            dto.setCreatedAt(req.getCreatedAt());
            dto.setUpdatedAt(req.getUpdatedAt());
            return dto;
        }
    }

    @Data
    public static class DashboardStatsDTO {
        private long total;
        private long pending;
        private long accepted;
        private long scheduled;
        private long completed;
        private long rejected;
        private long totalUsers;
        private long thisMonth;
        private java.util.Map<String, Long> byDeviceType;
    }
}
