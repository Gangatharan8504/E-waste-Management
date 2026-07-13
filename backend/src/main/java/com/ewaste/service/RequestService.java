package com.ewaste.service;

import com.ewaste.dto.RequestDTOs.*;
import com.ewaste.email.EmailService;
import com.ewaste.model.EwasteRequest;
import com.ewaste.model.EwasteRequest.RequestStatus;
import com.ewaste.model.User;
import com.ewaste.repository.EwasteRequestRepository;
import com.ewaste.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final EwasteRequestRepository requestRepo;
    private final UserRepository userRepo;
    private final EmailService emailService;
    private final OtpService otpService;
    private final AiService aiService;
    private final NotificationService notificationService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_IMAGES = 10;

    // ─── Image Analysis verification ──────────────────────────────────────
    public com.ewaste.dto.AiDTOs.EwasteAiAnalysisReport analyzeImage(MultipartFile file,
                                                                      String deviceType, String brand,
                                                                      String model, String condition) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please upload an image file.");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds 5MB limit.");
        }
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/webp"))) {
            throw new RuntimeException("Unsupported image format. Allowed formats: JPEG, PNG, WEBP.");
        }
        return aiService.analyzeImage(file, deviceType, brand, model, condition);
    }

    // ─── Step 1: Create request draft → send OTP ──────────────────────────
    @Transactional
    public RequestResponseDTO submitRequest(String email, CreateRequestDTO dto,
                                            List<MultipartFile> images) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Feature 3: AI Pickup Verification constraints check
        if (dto.getIsElectronicDevice() == null || !dto.getIsElectronicDevice() ||
            dto.getIsSuitableForRecycling() == null || !dto.getIsSuitableForRecycling()) {
            String rejectMsg = dto.getAiRejectedReason() != null ? dto.getAiRejectedReason() : "The uploaded item is not suitable for recycling.";
            throw new RuntimeException("Submission Rejected: " + rejectMsg);
        }

        // Save images (up to 10)
        List<String> imageUrls = new ArrayList<>();
        if (images != null) {
            List<MultipartFile> valid = images.stream()
                .filter(f -> f != null && !f.isEmpty())
                .limit(MAX_IMAGES)
                .collect(Collectors.toList());
            for (MultipartFile file : valid) {
                imageUrls.add(saveImage(file));
            }
        }

        EwasteRequest request = EwasteRequest.builder()
            .user(user)
            .deviceType(dto.getDeviceType())
            .brand(dto.getBrand())
            .model(dto.getModel())
            .condition(dto.getCondition())
            .quantity(dto.getQuantity())
            .pickupAddress(dto.getPickupAddress())
            .pickupLat(dto.getPickupLat())
            .pickupLng(dto.getPickupLng())
            .remarks(dto.getRemarks())
            .imageUrls(imageUrls)
            .status(RequestStatus.PENDING)
            .otpVerified(true)
            .build();

        // Populate AI report fields
        request.setIsElectronicDevice(dto.getIsElectronicDevice());
        request.setIsSuitableForRecycling(dto.getIsSuitableForRecycling());
        request.setAiDeviceType(dto.getAiDeviceType());
        request.setAiDeviceCategory(dto.getAiDeviceCategory());
        request.setIsDamaged(dto.getIsDamaged());
        request.setAiDamageLevel(dto.getAiDamageLevel());
        request.setAiEstimatedCondition(dto.getAiEstimatedCondition());
        request.setAiVisibleParts(dto.getAiVisibleParts());
        request.setAiMissingComponents(dto.getAiMissingComponents());
        request.setAiBatteryDamage(dto.getAiBatteryDamage());
        request.setAiSafetyRisks(dto.getAiSafetyRisks());
        request.setAiConfidenceScore(dto.getAiConfidenceScore());
        request.setAiRepairRecommendation(dto.getAiRepairRecommendation());
        request.setAiReuseRecommendation(dto.getAiReuseRecommendation());
        request.setAiRecyclingRecommendation(dto.getAiRecyclingRecommendation());
        request.setAiSafeHandlingInstructions(dto.getAiSafeHandlingInstructions());
        request.setAiRejectedReason(dto.getAiRejectedReason());

        if (dto.getAiSummary() != null && !dto.getAiSummary().isBlank()) {
            request.setAiSummary(dto.getAiSummary());
        } else {
            try {
                String summary = aiService.generateSummary(request);
                request.setAiSummary(summary);
            } catch (Exception e) {
                request.setAiSummary("User requested pickup of " + request.getQuantity() + "x " + request.getDeviceType() + ".");
            }
        }

        requestRepo.save(request);

        // Feature 5: AI Analysis Completed notification
        try {
            notificationService.createNotification(user, "AI Analysis Completed", 
                "AI has successfully analyzed the device photos for your request #" + request.getId() + ".", 
                request.getId());
        } catch (Exception e) {
            // Ignore
        }

        try {
            notificationService.createNotification(user, "Pickup Request Submitted", 
                "Your pickup request for the " + request.getBrand() + " " + request.getDeviceType() + " was successfully submitted.", 
                request.getId());
        } catch (Exception e) {
            // Ignore notification failure to ensure request creation succeeds
        }

        // Send confirmation email directly (no OTP needed)
        emailService.sendRequestConfirmation(request);

        return RequestResponseDTO.from(request);
    }

    // ─── Step 2: Verify OTP → activate request ────────────────────────────
    @Transactional
    public RequestResponseDTO verifySubmitOtp(Long requestId, String email, VerifySubmitOtpDTO dto) {
        EwasteRequest request = requestRepo.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }
        if (request.getStatus() != RequestStatus.PENDING_OTP) {
            throw new RuntimeException("Request already verified or invalid state");
        }
        if (!otpService.isValid(request.getSubmitOtp(), dto.getOtp())) {
            throw new RuntimeException("Invalid OTP. Please check and try again.");
        }
        if (request.getSubmitOtpExpiry() == null ||
            LocalDateTime.now().isAfter(request.getSubmitOtpExpiry())) {
            throw new RuntimeException("OTP has expired. Please submit the request again.");
        }

        request.setStatus(RequestStatus.PENDING);
        request.setOtpVerified(true);
        request.setSubmitOtp(null);
        request.setSubmitOtpExpiry(null);
        requestRepo.save(request);

        // Now send confirmation email
        emailService.sendRequestConfirmation(request);
        return RequestResponseDTO.from(request);
    }

    // ─── Resend submit OTP ────────────────────────────────────────────────
    @Transactional
    public RequestResponseDTO resendSubmitOtp(Long requestId, String email) {
        EwasteRequest request = requestRepo.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!request.getUser().getEmail().equals(email)) throw new RuntimeException("Access denied");
        if (request.getStatus() != RequestStatus.PENDING_OTP) {
            throw new RuntimeException("Request is not awaiting OTP verification");
        }
        String otp = otpService.generateOtp();
        request.setSubmitOtp(otp);
        request.setSubmitOtpExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        requestRepo.save(request);
        emailService.sendRequestSubmitOtp(email, request.getUser().getFirstName(), otp, request.getDeviceType());
        return RequestResponseDTO.from(request);
    }

    // ─── Get My Requests ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<RequestResponseDTO> getMyRequests(String email) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return requestRepo.findByUserOrderByCreatedAtDesc(user)
            .stream().map(RequestResponseDTO::from).collect(Collectors.toList());
    }

    // ─── Get Single Request ───────────────────────────────────────────────
    @Transactional(readOnly = true)
    public RequestResponseDTO getRequestById(Long id, String email, boolean isAdmin) {
        EwasteRequest request = requestRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!isAdmin && !request.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }
        return RequestResponseDTO.from(request);
    }

    // ─── Cancel Request ───────────────────────────────────────────────────
    @Transactional
    public RequestResponseDTO cancelRequest(Long id, String email) {
        EwasteRequest request = requestRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!request.getUser().getEmail().equals(email)) throw new RuntimeException("Access denied");
        if (request.getStatus() != RequestStatus.PENDING &&
            request.getStatus() != RequestStatus.PENDING_OTP) {
            throw new RuntimeException("Only pending requests can be cancelled");
        }
        request.setStatus(RequestStatus.CANCELLED);
        requestRepo.save(request);

        try {
            notificationService.createNotification(request.getUser(), "Request Cancelled", 
                "Your e-waste request #" + request.getId() + " has been cancelled.", 
                request.getId());
        } catch (Exception e) {
            // Ignore
        }

        return RequestResponseDTO.from(request);
    }

    // ─── Admin: Get All Requests ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<RequestResponseDTO> getAllRequests(String status, Pageable pageable) {
        Page<EwasteRequest> page;
        if (status != null && !status.isBlank()) {
            RequestStatus rs = RequestStatus.valueOf(status.toUpperCase());
            page = requestRepo.findByStatusOrderByCreatedAtDesc(rs, pageable);
        } else {
            page = requestRepo.findAllByOrderByCreatedAtDesc(pageable);
        }
        List<RequestResponseDTO> dtos = page.getContent().stream()
            .map(RequestResponseDTO::from).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    // ─── Admin: Update Status ─────────────────────────────────────────────
    @Transactional
    public RequestResponseDTO updateStatus(Long id, String status) {
        EwasteRequest request = requestRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        RequestStatus newStatus = RequestStatus.valueOf(status.toUpperCase());
        request.setStatus(newStatus);
        requestRepo.save(request);

        try {
            String title = "Pickup Status Updated";
            String description = "Your request #" + request.getId() + " status is now " + newStatus + ".";
            switch (newStatus) {
                case ACCEPTED -> {
                    title = "Pickup Approved";
                    description = "Your pickup request for the " + request.getBrand() + " " + request.getDeviceType() + " has been approved.";
                }
                case REJECTED -> {
                    title = "Pickup Rejected";
                    description = "Your request #" + request.getId() + " has been rejected. Please review details.";
                }
                case BETTER_IMAGES_REQUIRED -> {
                    title = "Better Images Required";
                    description = "Please upload better images of the device for request #" + request.getId() + ".";
                }
                case COMPLETED -> {
                    title = "Recycling Completed";
                    description = "Recycling for your request #" + request.getId() + " is complete.";
                }
                default -> {}
            }
            notificationService.createNotification(request.getUser(), title, description, request.getId());
        } catch (Exception e) {
            // Ignore
        }

        switch (newStatus) {
            case REJECTED  -> emailService.sendRejectionEmail(request);
            case COMPLETED -> emailService.sendCompletionEmail(request);
            default        -> {}
        }
        return RequestResponseDTO.from(request);
    }

    // ─── Admin: Schedule ──────────────────────────────────────────────────
    @Transactional
    public RequestResponseDTO schedulePickup(Long id, ScheduleRequestDTO dto) {
        EwasteRequest request = requestRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setScheduledDate(LocalDate.parse(dto.getScheduledDate()));
        request.setScheduledTime(dto.getScheduledTime());
        request.setAdminNotes(dto.getAdminNotes());
        request.setStatus(RequestStatus.SCHEDULED);
        requestRepo.save(request);

        try {
            notificationService.createNotification(request.getUser(), "Pickup Scheduled", 
                "Your pickup request #" + request.getId() + " is scheduled for " + request.getScheduledDate() + " (" + request.getScheduledTime() + ").", 
                request.getId());
        } catch (Exception e) {
            // Ignore
        }

        emailService.sendPickupScheduledEmail(request);
        return RequestResponseDTO.from(request);
    }

    // ─── Admin: Stats ─────────────────────────────────────────────────────
    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotal(requestRepo.countByStatusNot(RequestStatus.PENDING_OTP));
        stats.setPending(requestRepo.countByStatus(RequestStatus.PENDING));
        stats.setAccepted(requestRepo.countByStatus(RequestStatus.ACCEPTED));
        stats.setScheduled(requestRepo.countByStatus(RequestStatus.SCHEDULED));
        stats.setCompleted(requestRepo.countByStatus(RequestStatus.COMPLETED));
        stats.setRejected(requestRepo.countByStatus(RequestStatus.REJECTED));
        stats.setTotalUsers(userRepo.countByRole(User.Role.USER));
        stats.setThisMonth(requestRepo.countByCreatedAtAfter(
            LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0)));
        Map<String, Long> byDevice = new LinkedHashMap<>();
        requestRepo.countByDeviceType().forEach(row ->
            byDevice.put((String) row[0], (Long) row[1]));
        stats.setByDeviceType(byDevice);
        return stats;
    }

    @Transactional
    public void deleteRequest(Long id, String email) {
        EwasteRequest request = requestRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        
        if (!request.getUser().getEmail().equals(email)) {
            User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            if (user.getRole() != User.Role.ADMIN) {
                throw new RuntimeException("Unauthorized: You cannot delete this request");
            }
        }
        
        requestRepo.delete(request);
    }

    // ─── Image save helper ────────────────────────────────────────────────
    private String saveImage(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
            String ext = Optional.ofNullable(file.getOriginalFilename())
                .filter(f -> f.contains("."))
                .map(f -> f.substring(f.lastIndexOf(".")))
                .orElse(".jpg");
            String filename = UUID.randomUUID() + ext;
            Files.copy(file.getInputStream(), uploadPath.resolve(filename),
                StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image: " + e.getMessage());
        }
    }
}
