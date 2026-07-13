package com.ewaste.controller;

import com.ewaste.dto.RequestDTOs.*;
import com.ewaste.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.ewaste.dto.AiDTOs.EwasteAiAnalysisReport;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    // POST /api/requests/analyze-image
    @PostMapping(value = "/analyze-image", consumes = "multipart/form-data")
    public ResponseEntity<EwasteAiAnalysisReport> analyzeImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("deviceType") String deviceType,
            @RequestParam("brand") String brand,
            @RequestParam("model") String model,
            @RequestParam("condition") String condition) {
        return ResponseEntity.ok(requestService.analyzeImage(file, deviceType, brand, model, condition));
    }

    // POST /api/requests  (multipart: fields + up to 10 images)
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<RequestResponseDTO> submitRequest(
            @ModelAttribute CreateRequestDTO dto,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            Authentication auth) {

        return ResponseEntity.ok(requestService.submitRequest(auth.getName(), dto, images));
    }

    // POST /api/requests/{id}/verify-otp
    @PostMapping("/{id}/verify-otp")
    public ResponseEntity<RequestResponseDTO> verifyOtp(@PathVariable Long id,
                                                         @Valid @RequestBody VerifySubmitOtpDTO dto,
                                                         Authentication auth) {
        return ResponseEntity.ok(requestService.verifySubmitOtp(id, auth.getName(), dto));
    }

    // POST /api/requests/{id}/resend-otp
    @PostMapping("/{id}/resend-otp")
    public ResponseEntity<RequestResponseDTO> resendOtp(@PathVariable Long id,
                                                          Authentication auth) {
        return ResponseEntity.ok(requestService.resendSubmitOtp(id, auth.getName()));
    }

    // GET /api/requests/my
    @GetMapping("/my")
    public ResponseEntity<List<RequestResponseDTO>> getMyRequests(Authentication auth) {
        return ResponseEntity.ok(requestService.getMyRequests(auth.getName()));
    }

    // GET /api/requests/{id}
    @GetMapping("/{id}")
    public ResponseEntity<RequestResponseDTO> getRequest(@PathVariable Long id, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(requestService.getRequestById(id, auth.getName(), isAdmin));
    }

    // PUT /api/requests/{id}/cancel
    @PutMapping("/{id}/cancel")
    public ResponseEntity<RequestResponseDTO> cancelRequest(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(requestService.cancelRequest(id, auth.getName()));
    }

    // DELETE /api/requests/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id, Authentication auth) {
        requestService.deleteRequest(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
