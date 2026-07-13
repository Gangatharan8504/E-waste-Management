package com.ewaste.dto;

import com.ewaste.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDTOs {

    // ---- Step 1: Send OTP to email ----
    @Data
    public static class SendOtpRequest {
        @Email(message = "Valid email required")
        @NotBlank
        private String email;
    }

    // ---- Step 2: Register with OTP verification ----
    @Data
    public static class RegisterRequest {
        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        @Email(message = "Valid email required")
        @NotBlank(message = "Email is required")
        private String email;

        private String otp;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^[+\\d\\s-]{10,15}$", message = "Enter a valid phone number")
        private String phone;

        @NotBlank(message = "Address is required")
        private String address;

        @NotBlank(message = "Pincode is required")
        @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Enter a valid 6-digit pincode")
        private String pincode;
    }

    // ---- Verify Registration OTP ----
    @Data
    public static class VerifyOtpRequest {
        @Email(message = "Valid email required")
        @NotBlank
        private String email;
        @NotBlank
        private String otp;
    }

    // ---- Resend Registration OTP ----
    @Data
    public static class ResendOtpRequest {
        @Email(message = "Valid email required")
        @NotBlank
        private String email;
    }

    // ---- Login ----
    @Data
    public static class LoginRequest {
        @Email
        @NotBlank
        private String email;
        @NotBlank
        private String password;
    }

    // ---- Forgot password: send OTP ----
    @Data
    public static class ForgotPasswordRequest {
        @Email
        @NotBlank
        private String email;
    }

    // ---- Reset password with OTP ----
    @Data
    public static class ResetPasswordRequest {
        @Email
        @NotBlank
        private String email;

        private String otp;

        @NotBlank
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String newPassword;
    }

    // ---- Update profile (email not changeable) ----
    @Data
    public static class UpdateProfileRequest {
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
        private String phone;
        private String address;
        private String pincode;
    }

    // ---- Change password (logged in) ----
    @Data
    public static class ChangePasswordRequest {
        @NotBlank
        private String currentPassword;
        @NotBlank
        @Size(min = 6)
        private String newPassword;
    }

    // ---- Auth response ----
    @Data
    public static class AuthResponse {
        private String token;
        private UserDTO user;
        public AuthResponse(String token, UserDTO user) {
            this.token = token;
            this.user = user;
        }
    }

    // ---- User DTO ----
    @Data
    public static class UserDTO {
        private Long id;
        private String firstName;
        private String lastName;
        private String name; // convenience: firstName + lastName
        private String email;
        private String phone;
        private String address;
        private String pincode;
        private String profilePic;
        private String role;
        private boolean emailVerified;

        public static UserDTO from(User user) {
            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
            dto.setAddress(user.getAddress());
            dto.setPincode(user.getPincode());
            dto.setProfilePic(user.getProfilePic());
            dto.setRole(user.getRole().name());
            dto.setEmailVerified(user.isEmailVerified());
            return dto;
        }
    }

    // ---- Simple message response ----
    @Data
    public static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
    }
}
