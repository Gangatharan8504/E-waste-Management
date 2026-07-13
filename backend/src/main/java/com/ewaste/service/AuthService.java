package com.ewaste.service;

import com.ewaste.dto.AuthDTOs.*;
import com.ewaste.email.EmailService;
import com.ewaste.model.OtpStore;
import com.ewaste.model.User;
import com.ewaste.repository.OtpStoreRepository;
import com.ewaste.repository.UserRepository;
import com.ewaste.security.CustomUserDetailsService;
import com.ewaste.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final UserRepository userRepository;
    private final OtpStoreRepository otpStoreRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final EmailService emailService;
    private final OtpService otpService;
    private final NotificationService notificationService;

    private static final int OTP_EXPIRY_MINUTES = 5;

    // Step 1: Send Registration OTP - stores in OtpStore, NOT in User entity
    @Transactional
    public MessageResponse sendRegistrationOtp(SendOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        userRepository.findByEmail(email).ifPresent(u -> {
            if (u.isEnabled() && u.isEmailVerified())
                throw new RuntimeException("This email is already registered. Please login.");
        });

        String otp = otpService.generateOtp();
        otpStoreRepository.deleteByEmail(email);
        otpStoreRepository.flush();

        otpStoreRepository.save(OtpStore.builder()
                .email(email).otp(otp).purpose("REGISTRATION")
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .build());

        emailService.sendRegistrationOtp(email, otp);
        log.info("Registration OTP sent to {}", email);
        return new MessageResponse("OTP sent to " + email + ". Valid for 5 minutes.");
    }

    // Step 2: Register details (User created inactive, OTP sent)
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        userRepository.findByEmail(email).ifPresent(u -> {
            if (u.isEnabled() && u.isEmailVerified()) {
                throw new RuntimeException("This email is already registered. Please login.");
            }
        });

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
        }
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setPincode(request.getPincode());
        user.setRole(User.Role.USER);
        user.setEnabled(false);
        user.setEmailVerified(false);

        userRepository.save(user);

        // Send OTP
        String otp = otpService.generateOtp();
        otpStoreRepository.deleteByEmailAndPurpose(email, "REGISTRATION");
        otpStoreRepository.flush();

        otpStoreRepository.save(OtpStore.builder()
                .email(email).otp(otp).purpose("REGISTRATION")
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .build());

        emailService.sendRegistrationOtp(email, otp);

        return new AuthResponse("", UserDTO.from(user));
    }

    // Verify OTP and Activate Account
    @Transactional
    public MessageResponse verifyRegistrationOtp(VerifyOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String otp = request.getOtp().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No registration details found for this email."));

        if (user.isEmailVerified()) {
            return new MessageResponse("Email already verified. Please login.");
        }

        OtpStore store = otpStoreRepository.findByEmailAndPurpose(email, "REGISTRATION")
                .orElseThrow(() -> new RuntimeException("OTP not found or expired. Please request a new one."));

        if (store.isExpired()) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        if (!store.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP code.");
        }

        user.setEnabled(true);
        user.setEmailVerified(true);
        userRepository.save(user);

        otpStoreRepository.delete(store);

        // Welcome notifications & emails
        try {
            emailService.sendWelcomeEmail(user);
        } catch (Exception e) {
            log.error("Failed to send Welcome Email: {}", e.getMessage());
        }

        try {
            notificationService.createNotification(user, "Email Verified", "Your email address has been successfully verified.", null);
            notificationService.createNotification(user, "Welcome Email Sent", "Welcome to EcoSync! We are thrilled to have you join us.", null);
        } catch (Exception e) {
            log.error("Failed to create verification notifications: {}", e.getMessage());
        }

        return new MessageResponse("Email verified successfully! You can now log in.");
    }

    // Resend OTP
    @Transactional
    public MessageResponse resendRegistrationOtp(ResendOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No registration details found for this email."));

        if (user.isEmailVerified()) {
            return new MessageResponse("Email already verified. Please login.");
        }

        Optional<OtpStore> existing = otpStoreRepository.findByEmailAndPurpose(email, "REGISTRATION");
        if (existing.isPresent()) {
            OtpStore store = existing.get();
            if (LocalDateTime.now().isBefore(store.getCreatedAt().plusSeconds(60))) {
                long elapsedSeconds = java.time.Duration.between(store.getCreatedAt(), LocalDateTime.now()).getSeconds();
                long waitSeconds = 60 - elapsedSeconds;
                throw new RuntimeException("Please wait " + waitSeconds + " seconds before requesting a new OTP.");
            }
        }

        String otp = otpService.generateOtp();
        otpStoreRepository.deleteByEmailAndPurpose(email, "REGISTRATION");
        otpStoreRepository.flush();

        otpStoreRepository.save(OtpStore.builder()
                .email(email).otp(otp).purpose("REGISTRATION")
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .build());

        emailService.sendRegistrationOtp(email, otp);

        return new MessageResponse("OTP has been resent to " + email + ". Valid for 5 minutes.");
    }

    // Login
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));
        if (!user.isEmailVerified() || !user.isEnabled()) {
            throw new RuntimeException("Email not verified. Please complete verification.");
        }
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        } catch (Exception e) {
            throw new RuntimeException("Invalid email or password.");
        }
        UserDetails ud = userDetailsService.loadUserByUsername(email);
        return new AuthResponse(jwtUtil.generateToken(ud), UserDTO.from(user));
    }

    // Forgot password - send OTP
    @Transactional
    public MessageResponse sendForgotPasswordOtp(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email."));

        String otp = otpService.generateOtp();
        otpStoreRepository.deleteByEmail(email);
        otpStoreRepository.flush();
        otpStoreRepository.save(OtpStore.builder()
                .email(email).otp(otp).purpose("FORGOT_PASSWORD")
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .build());
        emailService.sendForgotPasswordOtp(email, otp);
        return new MessageResponse("Password reset OTP sent to " + email + ". Valid for 5 minutes.");
    }

    // Reset password (directly, no OTP validation)
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email."));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return new MessageResponse("Password reset successfully. You can now login.");
    }

    public UserDTO getProfile(String email) {
        return UserDTO.from(userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    @Transactional
    public UserDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        if (request.getPhone()   != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getPincode() != null) user.setPincode(request.getPincode());
        userRepository.save(user);
        return UserDTO.from(user);
    }

    @Transactional
    public MessageResponse changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword()))
            throw new RuntimeException("Current password is incorrect.");
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return new MessageResponse("Password changed successfully.");
    }

    @Transactional
    public UserDTO updateProfilePic(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));
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
            if (user.getProfilePic() != null) {
                try {
                    Files.deleteIfExists(uploadPath.resolve(user.getProfilePic()));
                } catch (Exception e) {
                    // Ignore deletion failure
                }
            }
            user.setProfilePic(filename);
            userRepository.save(user);
            return UserDTO.from(user);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save profile picture: " + e.getMessage());
        }
    }
}
