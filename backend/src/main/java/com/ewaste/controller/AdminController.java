package com.ewaste.controller;

import com.ewaste.dto.RequestDTOs.*;
import com.ewaste.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final RequestService requestService;

    @GetMapping("/requests")
    public ResponseEntity<Page<RequestResponseDTO>> getAllRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(requestService.getAllRequests(status, PageRequest.of(page, size)));
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<RequestResponseDTO> getRequest(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getRequestById(id, null, true));
    }

    @PutMapping("/requests/{id}/status")
    public ResponseEntity<RequestResponseDTO> updateStatus(@PathVariable Long id,
                                                            @Valid @RequestBody UpdateStatusDTO dto) {
        return ResponseEntity.ok(requestService.updateStatus(id, dto.getStatus()));
    }

    @PutMapping("/requests/{id}/schedule")
    public ResponseEntity<RequestResponseDTO> schedulePickup(@PathVariable Long id,
                                                              @Valid @RequestBody ScheduleRequestDTO dto) {
        return ResponseEntity.ok(requestService.schedulePickup(id, dto));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        return ResponseEntity.ok(requestService.getDashboardStats());
    }
}
