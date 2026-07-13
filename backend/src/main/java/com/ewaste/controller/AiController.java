package com.ewaste.controller;

import com.ewaste.dto.AiDTOs.*;
import com.ewaste.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    // ─── Chat Assistant (Feature 6) ───────────────────────────────────────
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request, Authentication auth) {
        return ResponseEntity.ok(aiService.chat(auth.getName(), request.getPrompt()));
    }

    @GetMapping("/chat/history")
    public ResponseEntity<List<ChatHistoryResponse>> getChatHistory(Authentication auth) {
        return ResponseEntity.ok(aiService.getChatHistory(auth.getName()));
    }

    // ─── Smart E-Waste Identification (Feature 1) ─────────────────────────
    @PostMapping("/identify")
    public ResponseEntity<SmartIdResponse> identifyEwaste(@Valid @RequestBody SmartIdRequest request) {
        return ResponseEntity.ok(aiService.identifyEwaste(request));
    }

    // ─── Repair vs Reuse vs Recycle Decision (Feature 2) ──────────────────
    @PostMapping("/decision")
    public ResponseEntity<DecisionResponse> makeDecision(@Valid @RequestBody DecisionRequest request) {
        return ResponseEntity.ok(aiService.makeDecision(request));
    }

    // ─── Safe Disposal Guide (Feature 3) ──────────────────────────────────
    @PostMapping("/disposal")
    public ResponseEntity<DisposalResponse> getSafeDisposal(@Valid @RequestBody DisposalRequest request) {
        return ResponseEntity.ok(aiService.getSafeDisposal(request));
    }

    // ─── Recycling Value Estimation (Feature 4) ───────────────────────────
    @PostMapping("/value")
    public ResponseEntity<RecyclingValueResponse> estimateValue(@Valid @RequestBody RecyclingValueRequest request) {
        return ResponseEntity.ok(aiService.estimateValue(request));
    }

    // ─── Environmental Impact Calculator (Feature 5) ──────────────────────
    @PostMapping("/impact")
    public ResponseEntity<EnvironmentalImpactResponse> getEnvironmentalImpact(@Valid @RequestBody EnvironmentalImpactRequest request) {
        return ResponseEntity.ok(aiService.getEnvironmentalImpact(request));
    }

    // ─── AI Recycling Cost Recommendation / Value Estimator ────────────────
    @PostMapping("/estimate-value")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EstimateRecyclingValueResponse> estimateRecyclingValue(@Valid @RequestBody EstimateRecyclingValueRequest request) {
        return ResponseEntity.ok(aiService.estimateRecyclingValue(request));
    }

    // ─── Admin AI Insights (Feature 8) ────────────────────────────────────
    @GetMapping("/admin-insights")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminInsightsResponse> getAdminInsights(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(aiService.generateAdminInsights());
    }
}
