package com.ewaste.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

public class AiDTOs {

    // ─── Chat Assistant ───────────────────────────────────────────────────
    @Data
    public static class ChatRequest {
        private String prompt;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChatResponse {
        private String response;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChatHistoryResponse {
        private Long id;
        private String prompt;
        private String response;
        private LocalDateTime createdAt;
    }

    // ─── Smart E-Waste Identification ─────────────────────────────────────
    @Data
    public static class SmartIdRequest {
        private String productName;
        private String brand;
        private String productDescription;
        private String condition;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class SmartIdResponse {
        private String category;
        
        @com.fasterxml.jackson.annotation.JsonProperty("eWasteCategory")
        private String eWasteCategory;
        
        private String hazardLevel;
        private String recyclablePercentage;
        private String remainingLife;
        private String valuableMaterials;
        private String confidenceScore;
    }

    // ─── Repair vs Reuse vs Recycle Decision ──────────────────────────────
    @Data
    public static class DecisionRequest {
        private String productName;
        private String brand;
        private String productDescription;
        private String condition;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DecisionResponse {
        private String recommendation; // Repair, Reuse, Donate, Sell, Recycle
        private String explanation;
    }

    // ─── Safe Disposal Guide ──────────────────────────────────────────────
    @Data
    public static class DisposalRequest {
        private String deviceType;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DisposalResponse {
        private String steps;
        private String hazardWarnings;
        private String batteryPrecautions;
        private String dataWiping;
    }

    // ─── Recycling Value Estimation ───────────────────────────────────────
    @Data
    public static class RecyclingValueRequest {
        private String deviceType;
        private int quantity;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecyclingValueResponse {
        private String recoverableMaterials;
        private String estimatedValue;
        private String reusableComponents;
    }

    // ─── Environmental Impact Calculator ──────────────────────────────────
    @Data
    public static class EnvironmentalImpactRequest {
        private String deviceType;
        private int quantity;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EnvironmentalImpactResponse {
        private String co2Saved;
        private String energySaved;
        private String plasticRecovered;
        private String copperRecovered;
        private String aluminumRecovered;
        private String summary;
    }

    // ─── Admin AI Insights ────────────────────────────────────────────────
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AdminInsightsResponse {
        private String mostRecycledProducts;
        private String mostHazardousProducts;
        private String monthlyTrends;
        private String commonUserQuestions;
        private String mostRecommendedActions;
        private String aiRecyclingInsights;
    }

    // ─── AI Recycling Cost Recommendation / Value Estimator ────────────────
    @Data
    public static class EstimateRecyclingValueRequest {
        private String productName;
        private String brand;
        private String category;
        private String condition;
        private String age;     // Optional
        private String weight;  // Optional
        private String description;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class EstimateRecyclingValueResponse {
        private String deviceCategory;
        private String recyclablePercentage;
        private String recoverableMaterials;
        private String hazardLevel;
        private String recommendedAction;
        private String estimatedRecyclingValue;
        private String confidenceLevel;
        private String reasonForValue;
    }

    // ─── AI Photo Analysis Before Pickup Request ───────────────────────────
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class EwasteAiAnalysisReport {
        private Boolean isElectronicDevice;
        private Boolean isSuitableForRecycling;
        private String deviceType;
        private String deviceCategory;
        private Boolean isDamaged;
        private String damageLevel; // Minor, Moderate, Severe
        private String estimatedCondition;
        private String visibleParts;
        private String missingComponents;
        private String batteryDamage;
        private String safetyRisks;
        private Integer confidenceScore;
        private String repairRecommendation;
        private String reuseRecommendation;
        private String recyclingRecommendation;
        private String safeHandlingInstructions;
        private String aiSummary;
        private String rejectedReason;
    }
}
